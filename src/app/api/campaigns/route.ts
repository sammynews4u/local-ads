import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { campaigns, ads, adTargeting, pixels, approvalRequests, campaignTargetingRules, moduleActivityLogs } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getSession, requireRole } from '@/lib/auth';
import { generateTrackingCode } from '@/lib/utils';


function generateApprovalNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `APR-${date}-${suffix}`;
}

const mediaUrlSchema = z.string().trim().min(1).refine((value) => {
  if (value.startsWith('/uploads/')) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}, 'Media URL must be a full URL or a local /uploads path');

const createCampaignSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  landingPageUrl: z.string().url(),
  totalBudget: z.number().min(10),
  dailyBudget: z.number().min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  niches: z.array(z.string()).optional(),
  targeting: z.array(z.object({
    country: z.string().trim().min(2).max(100),
    cpc: z.number().positive(),
  })).optional(),
  ad: z.object({
    title: z.string().trim().min(1),
    description: z.string().optional(),
    videoUrl: mediaUrlSchema.optional(),
    imageUrl: mediaUrlSchema.optional(),
    ctaText: z.string().optional(),
  }).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let whereClause;
    
    if (session.role === 'admin') {
      // Admin can see all campaigns
      whereClause = status ? eq(campaigns.status, status as typeof campaigns.status.enumValues[number]) : undefined;
    } else if (session.role === 'advertiser') {
      // Advertiser can only see their own campaigns
      whereClause = status 
        ? and(eq(campaigns.advertiserId, session.userId), eq(campaigns.status, status as typeof campaigns.status.enumValues[number]))
        : eq(campaigns.advertiserId, session.userId);
    } else {
      // Publishers can see active campaigns
      whereClause = eq(campaigns.status, 'active');
    }

    const campaignsList = await db.query.campaigns.findMany({
      where: whereClause,
      with: {
        ads: true,
        targeting: true,
        advertiser: {
          columns: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [desc(campaigns.createdAt)],
      limit,
      offset,
    });

    return NextResponse.json({
      campaigns: campaignsList,
      page,
      limit,
    });
  } catch (error) {
    console.error('Get campaigns error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !requireRole(session, ['advertiser', 'admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createCampaignSchema.parse(body);

    if (validated.dailyBudget > validated.totalBudget) {
      return NextResponse.json(
        { error: 'Daily budget cannot be greater than total budget' },
        { status: 400 }
      );
    }

    if (validated.startDate && validated.endDate && new Date(validated.endDate) < new Date(validated.startDate)) {
      return NextResponse.json(
        { error: 'End date cannot be earlier than start date' },
        { status: 400 }
      );
    }

    // Create campaign
    const [campaign] = await db.insert(campaigns).values({
      advertiserId: session.userId,
      title: validated.title,
      description: validated.description,
      landingPageUrl: validated.landingPageUrl,
      totalBudget: validated.totalBudget.toFixed(2),
      dailyBudget: validated.dailyBudget.toFixed(2),
      startDate: validated.startDate ? new Date(validated.startDate) : null,
      endDate: validated.endDate ? new Date(validated.endDate) : null,
      niches: validated.niches || [],
      status: 'pending_approval',
    }).returning();

    // Add targeting if provided
    if (validated.targeting && validated.targeting.length > 0) {
      await db.insert(adTargeting).values(
        validated.targeting.map(t => ({
          campaignId: campaign.id,
          country: t.country,
          cpc: t.cpc.toFixed(4),
        }))
      );
    }

    // Create ad if provided
    if (validated.ad) {
      await db.insert(ads).values({
        campaignId: campaign.id,
        title: validated.ad.title,
        description: validated.ad.description,
        videoUrl: validated.ad.videoUrl,
        imageUrl: validated.ad.imageUrl,
        ctaText: validated.ad.ctaText || 'Learn More',
        status: 'pending',
      });
    }


    const targetingRules: Array<typeof campaignTargetingRules.$inferInsert> = [];

    for (const niche of validated.niches || []) {
      targetingRules.push({
        campaignId: campaign.id,
        ruleType: 'niche',
        include: true,
        weight: 100,
        metadata: { niche },
      });
    }

    for (const target of validated.targeting || []) {
      targetingRules.push({
        campaignId: campaign.id,
        ruleType: 'country',
        include: true,
        weight: 100,
        metadata: { country: target.country, cpc: target.cpc },
      });
    }

    if (targetingRules.length > 0) {
      await db.insert(campaignTargetingRules).values(targetingRules);
    }

    await db.insert(approvalRequests).values({
      approvalNumber: generateApprovalNumber(),
      moduleKey: 'approvals',
      entityType: 'campaign',
      entityId: campaign.id,
      requestedBy: session.userId,
      subject: `Campaign approval: ${campaign.title}`,
      notes: 'Automatically created when the campaign was submitted for admin approval.',
      metadata: { campaignId: campaign.id, totalBudget: campaign.totalBudget, dailyBudget: campaign.dailyBudget },
    });

    await db.insert(moduleActivityLogs).values([
      {
        moduleKey: 'approvals',
        userId: session.userId,
        entityType: 'campaign',
        entityId: campaign.id,
        action: 'campaign_submitted_for_approval',
        metadata: { title: campaign.title },
      },
      {
        moduleKey: 'targeting',
        userId: session.userId,
        entityType: 'campaign',
        entityId: campaign.id,
        action: 'campaign_targeting_configured',
        metadata: { niches: validated.niches || [], targeting: validated.targeting || [] },
      },
    ]);

    // Create default tracking pixel
    const pixelCode = generateTrackingCode();
    await db.insert(pixels).values({
      campaignId: campaign.id,
      advertiserId: session.userId,
      name: 'Default Pixel',
      pixelCode,
      conversionType: 'lead',
    });

    return NextResponse.json({
      success: true,
      campaign,
      pixelCode,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Create campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
