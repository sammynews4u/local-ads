import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { campaigns, ads, adTargeting, campaignLogs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession, requireRole } from '@/lib/auth';

const updateCampaignSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().optional(),
  landingPageUrl: z.string().url().optional(),
  totalBudget: z.number().positive().optional(),
  dailyBudget: z.number().positive().optional(),
  status: z.enum(['draft', 'pending_approval', 'active', 'paused', 'rejected', 'completed']).optional(),
  rejectionReason: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  niches: z.array(z.string()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const campaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, id),
      with: {
        ads: true,
        targeting: true,
        pixels: true,
        advertiser: {
          columns: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Check access
    if (session.role === 'advertiser' && campaign.advertiserId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Get campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updateCampaignSchema.parse(body);

    // Get existing campaign
    const existingCampaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, id),
    });

    if (!existingCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Check access
    if (session.role === 'advertiser' && existingCampaign.advertiserId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only admin can change status to active or rejected
    if (validated.status && ['active', 'rejected'].includes(validated.status) && session.role !== 'admin') {
      return NextResponse.json({ error: 'Only admin can approve/reject campaigns' }, { status: 403 });
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (validated.title) updateData.title = validated.title;
    if (validated.description !== undefined) updateData.description = validated.description;
    if (validated.landingPageUrl) updateData.landingPageUrl = validated.landingPageUrl;
    if (validated.totalBudget) updateData.totalBudget = validated.totalBudget.toFixed(2);
    if (validated.dailyBudget) updateData.dailyBudget = validated.dailyBudget.toFixed(2);
    if (validated.status) updateData.status = validated.status;
    if (validated.rejectionReason) updateData.rejectionReason = validated.rejectionReason;
    if (validated.startDate) updateData.startDate = new Date(validated.startDate);
    if (validated.endDate) updateData.endDate = new Date(validated.endDate);
    if (validated.niches) updateData.niches = validated.niches;

    const [updatedCampaign] = await db.update(campaigns)
      .set(updateData)
      .where(eq(campaigns.id, id))
      .returning();

    // Log the change
    await db.insert(campaignLogs).values({
      campaignId: id,
      userId: session.userId,
      action: 'update',
      oldValue: existingCampaign as unknown as Record<string, unknown>,
      newValue: validated as Record<string, unknown>,
    });

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Update campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const campaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, id),
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Check access
    if (session.role !== 'admin' && campaign.advertiserId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Can only delete draft campaigns
    if (campaign.status !== 'draft' && session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Can only delete draft campaigns' },
        { status: 400 }
      );
    }

    await db.delete(campaigns).where(eq(campaigns.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}
