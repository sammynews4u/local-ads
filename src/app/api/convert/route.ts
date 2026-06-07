import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { clicks, conversions, ads, campaigns, wallets, transactions, notifications } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

const convertSchema = z.object({
  click_id: z.string().uuid(),
  type: z.enum(['lead', 'signup', 'purchase', 'download', 'custom']).optional(),
  value: z.number().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = convertSchema.parse(body);

    // Find the click
    const click = await db.query.clicks.findFirst({
      where: eq(clicks.id, validated.click_id),
      with: {
        ad: {
          with: {
            campaign: true,
          },
        },
      },
    });

    if (!click || !click.ad?.campaign) {
      return NextResponse.json(
        { error: 'Invalid click ID' },
        { status: 400 }
      );
    }

    // Check if conversion already exists for this click
    const existingConversion = await db.query.conversions.findFirst({
      where: eq(conversions.clickId, validated.click_id),
    });

    if (existingConversion) {
      return NextResponse.json(
        { error: 'Conversion already recorded for this click' },
        { status: 400 }
      );
    }

    // Calculate conversion earnings (could be different from CPC)
    const conversionValue = validated.value || parseFloat(click.cpc || '0') * 5; // Default 5x CPC
    const publisherEarning = conversionValue * 0.8;
    const platformEarning = conversionValue * 0.2;

    // Create conversion record
    const [conversion] = await db.insert(conversions).values({
      clickId: click.id,
      adId: click.adId,
      publisherId: click.publisherId,
      campaignId: click.campaignId,
      type: validated.type || 'lead',
      value: conversionValue.toFixed(2),
      metadata: validated.metadata,
      publisherEarning: publisherEarning.toFixed(4),
      platformEarning: platformEarning.toFixed(4),
    }).returning();

    // Update ad conversion count
    await db.update(ads)
      .set({ conversions: sql`${ads.conversions} + 1` })
      .where(eq(ads.id, click.adId));

    // Credit publisher for conversion
    const publisherWallet = await db.query.wallets.findFirst({
      where: eq(wallets.userId, click.publisherId),
    });

    if (publisherWallet) {
      const newBalance = parseFloat(publisherWallet.balance) + publisherEarning;
      await db.update(wallets)
        .set({
          balance: newBalance.toFixed(2),
          totalEarnings: sql`${wallets.totalEarnings} + ${publisherEarning}`,
        })
        .where(eq(wallets.id, publisherWallet.id));

      await db.insert(transactions).values({
        walletId: publisherWallet.id,
        userId: click.publisherId,
        type: 'conversion_earning',
        amount: publisherEarning.toFixed(2),
        balanceBefore: publisherWallet.balance,
        balanceAfter: newBalance.toFixed(2),
        status: 'completed',
        description: `Conversion earning: ${validated.type || 'lead'}`,
        referenceId: conversion.id,
        referenceType: 'conversion',
      });
    }

    // Deduct from advertiser
    const advertiserWallet = await db.query.wallets.findFirst({
      where: eq(wallets.userId, click.ad.campaign.advertiserId),
    });

    if (advertiserWallet) {
      const newBalance = parseFloat(advertiserWallet.balance) - conversionValue;
      await db.update(wallets)
        .set({
          balance: newBalance.toFixed(2),
          totalSpent: sql`${wallets.totalSpent} + ${conversionValue}`,
        })
        .where(eq(wallets.id, advertiserWallet.id));

      await db.insert(transactions).values({
        walletId: advertiserWallet.id,
        userId: click.ad.campaign.advertiserId,
        type: 'conversion_spend',
        amount: (-conversionValue).toFixed(2),
        balanceBefore: advertiserWallet.balance,
        balanceAfter: newBalance.toFixed(2),
        status: 'completed',
        description: `Conversion: ${validated.type || 'lead'}`,
        referenceId: conversion.id,
        referenceType: 'conversion',
      });
    }

    // Notify publisher
    await db.insert(notifications).values({
      userId: click.publisherId,
      type: 'new_conversion',
      title: 'New Conversion!',
      message: `You earned $${publisherEarning.toFixed(2)} from a ${validated.type || 'lead'} conversion.`,
      metadata: { conversionId: conversion.id },
    });

    return NextResponse.json({
      success: true,
      conversion: {
        id: conversion.id,
        type: conversion.type,
        value: conversion.value,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Conversion tracking error:', error);
    return NextResponse.json(
      { error: 'Conversion tracking failed' },
      { status: 500 }
    );
  }
}

// GET endpoint for pixel-based tracking
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const clickId = searchParams.get('click_id');

  if (!clickId) {
    // Return 1x1 transparent gif
    return new NextResponse(
      Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
      {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }

  // Process conversion in background
  try {
    const click = await db.query.clicks.findFirst({
      where: eq(clicks.id, clickId),
    });

    if (click) {
      const existingConversion = await db.query.conversions.findFirst({
        where: eq(conversions.clickId, clickId),
      });

      if (!existingConversion) {
        await db.insert(conversions).values({
          clickId: click.id,
          adId: click.adId,
          publisherId: click.publisherId,
          campaignId: click.campaignId,
          type: 'lead',
          publisherEarning: (parseFloat(click.cpc || '0') * 0.8 * 5).toFixed(4),
          platformEarning: (parseFloat(click.cpc || '0') * 0.2 * 5).toFixed(4),
        });
      }
    }
  } catch (error) {
    console.error('Pixel conversion error:', error);
  }

  // Return 1x1 transparent gif
  return new NextResponse(
    Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
    {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
