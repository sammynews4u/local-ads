import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, referralEarnings, referralLevels } from '@/db/schema';
import { eq, and, desc, sum, count, gte, sql } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get user's referral code
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
      columns: { referralCode: true, referredBy: true },
    });

    // Get referral levels config
    const levels = await db.query.referralLevels.findMany({
      orderBy: [referralLevels.level],
    });

    // Get direct referrals (level 1)
    const directReferrals = await db.query.users.findMany({
      where: eq(users.referredBy, session.userId),
      columns: { id: true, email: true, firstName: true, lastName: true, role: true, status: true, createdAt: true },
      orderBy: [desc(users.createdAt)],
    });

    // Build full referral tree (up to 10 levels)
    const referralTree: Record<number, number> = {};
    let currentLevelIds = [session.userId];

    for (let level = 1; level <= 10; level++) {
      if (currentLevelIds.length === 0) break;
      const placeholders = currentLevelIds.map((_, i) => `$${i + 1}`).join(',');
      const result = await db
        .select({ count: count() })
        .from(users)
        .where(sql`${users.referredBy} IN (${sql.raw(currentLevelIds.map(id => `'${id}'`).join(','))})`)
      
      referralTree[level] = result[0]?.count || 0;

      // Get IDs for next level
      const nextLevel = await db
        .select({ id: users.id })
        .from(users)
        .where(sql`${users.referredBy} IN (${sql.raw(currentLevelIds.map(id => `'${id}'`).join(','))})`);
      
      currentLevelIds = nextLevel.map(u => u.id);
    }

    // Get total referral earnings
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [earningsStats] = await db
      .select({
        totalEarnings: sum(referralEarnings.commissionAmount),
        totalTransactions: count(),
      })
      .from(referralEarnings)
      .where(eq(referralEarnings.earnerId, session.userId));

    const [recentEarnings] = await db
      .select({ total: sum(referralEarnings.commissionAmount) })
      .from(referralEarnings)
      .where(and(
        eq(referralEarnings.earnerId, session.userId),
        gte(referralEarnings.createdAt, thirtyDaysAgo)
      ));

    // Recent referral earnings log
    const recentLog = await db.query.referralEarnings.findMany({
      where: eq(referralEarnings.earnerId, session.userId),
      orderBy: [desc(referralEarnings.createdAt)],
      limit: 20,
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

    return NextResponse.json({
      referralCode: user?.referralCode || '',
      referralLink: `${baseUrl}/register?ref=${user?.referralCode || ''}`,
      directReferrals,
      referralTree,
      levels,
      earnings: {
        total: earningsStats?.totalEarnings || '0.00',
        last30Days: recentEarnings?.total || '0.00',
        totalTransactions: earningsStats?.totalTransactions || 0,
      },
      recentLog,
    });
  } catch (error) {
    console.error('Get referrals error:', error);
    return NextResponse.json({ error: 'Failed to fetch referrals' }, { status: 500 });
  }
}
