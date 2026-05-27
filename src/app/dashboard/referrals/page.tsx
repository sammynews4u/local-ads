'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { Users, DollarSign, Copy, Check, Share2, Gift, TrendingUp, Link2 } from 'lucide-react';

interface ReferralData {
  referralCode: string;
  referralLink: string;
  directReferrals: Array<{
    id: string; email: string; firstName: string | null; lastName: string | null;
    role: string; status: string; createdAt: string;
  }>;
  referralTree: Record<number, number>;
  levels: Array<{ level: number; commissionPercent: string; label: string; active: boolean }>;
  earnings: { total: string; last30Days: string; totalTransactions: number };
  recentLog: Array<{
    id: string; level: number; sourceType: string;
    commissionAmount: string; createdAt: string;
  }>;
}

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    fetch('/api/referrals').then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(''), 2000);
  };

  const totalTeam = data?.referralTree ? Object.values(data.referralTree).reduce((a, b) => a + b, 0) : 0;

  if (loading) return (
    <div className="space-y-6">
      <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
      <div className="grid grid-cols-4 gap-6">{[...Array(4)].map((_, i) => <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-20 bg-gray-200 rounded"></div></CardContent></Card>)}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Referral Program</h1>
        <p className="text-gray-600">Earn commissions from up to 10 levels of referrals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Total Earnings</p>
                <p className="text-3xl font-bold">{formatCurrency(data?.earnings?.total || '0')}</p>
              </div>
              <DollarSign className="h-10 w-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last 30 Days</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(data?.earnings?.last30Days || '0')}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Direct Referrals</p>
                <p className="text-3xl font-bold">{data?.directReferrals?.length || 0}</p>
              </div>
              <Users className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Team</p>
                <p className="text-3xl font-bold">{formatNumber(totalTeam)}</p>
              </div>
              <Gift className="h-10 w-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Share2 className="h-5 w-5" /> Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Referral Code</label>
            <div className="flex gap-2">
              <input readOnly value={data?.referralCode || ''} className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg font-mono text-lg font-bold tracking-wider" />
              <Button variant="outline" onClick={() => copy(data?.referralCode || '', 'code')}>
                {copied === 'code' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Referral Link</label>
            <div className="flex gap-2">
              <input readOnly value={data?.referralLink || ''} className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm" />
              <Button variant="outline" onClick={() => copy(data?.referralLink || '', 'link')}>
                {copied === 'link' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
            <strong>How it works:</strong> Share your link. When someone registers and earns, you get a commission from their earnings — up to 10 levels deep!
          </div>
        </CardContent>
      </Card>

      {/* Commission Levels */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Structure (10 Levels)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Array.from({ length: 10 }, (_, i) => {
              const level = data?.levels?.find(l => l.level === i + 1);
              const count = data?.referralTree?.[i + 1] || 0;
              return (
                <div key={i} className={`p-4 rounded-lg border text-center ${level?.active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
                  <p className="text-xs text-gray-500 font-medium uppercase">Level {i + 1}</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">{level?.commissionPercent || '0'}%</p>
                  <p className="text-xs text-gray-500 mt-1">{count} users</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Direct Referrals */}
      <Card>
        <CardHeader>
          <CardTitle>Direct Referrals ({data?.directReferrals?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!data?.directReferrals?.length ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No referrals yet. Share your link to start earning!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.directReferrals.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.firstName ? `${r.firstName} ${r.lastName || ''}` : r.email}</TableCell>
                    <TableCell><Badge variant={r.role === 'publisher' ? 'success' : 'info'}>{r.role}</Badge></TableCell>
                    <TableCell><Badge variant={r.status === 'active' ? 'success' : 'warning'}>{r.status}</Badge></TableCell>
                    <TableCell>{formatDate(r.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Earnings */}
      {data?.recentLog && data.recentLog.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Recent Referral Earnings</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentLog.map(log => (
                  <TableRow key={log.id}>
                    <TableCell><Badge variant="default">Level {log.level}</Badge></TableCell>
                    <TableCell className="capitalize">{log.sourceType}</TableCell>
                    <TableCell className="text-green-600 font-medium">+{formatCurrency(log.commissionAmount)}</TableCell>
                    <TableCell>{formatDate(log.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
