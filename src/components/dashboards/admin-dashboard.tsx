'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Users, Megaphone, MousePointerClick, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';

interface Stats {
  users: {
    total: number;
    advertisers: number;
    publishers: number;
    pending: number;
  };
  campaigns: {
    total: number;
    active: number;
    pending: number;
  };
  clicks: {
    total: number;
    valid: number;
    fraud: number;
    totalRevenue: string;
    fraudRate: string;
  };
  conversions: {
    total: number;
    totalValue: string;
  };
  withdrawals: {
    pending: number;
    pendingAmount: string;
  };
  dailyClicks: Array<{
    date: string;
    clicks: number;
    revenue: string;
  }>;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats?period=30d');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Platform overview and management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(stats?.users?.total || 0)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats?.users?.pending || 0} pending approval
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Campaigns</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(stats?.campaigns?.active || 0)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats?.campaigns?.pending || 0} pending review
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Megaphone className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clicks (30d)</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(stats?.clicks?.total || 0)}
                </p>
                <p className="text-sm text-red-500 mt-1">
                  {stats?.clicks?.fraudRate || '0'}% fraud rate
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <MousePointerClick className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Platform Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(stats?.clicks?.totalRevenue || '0')}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Last 30 days
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-500" />
              User Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Advertisers</span>
                <Badge variant="info">{stats?.users?.advertisers || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Publishers</span>
                <Badge variant="success">{stats?.users?.publishers || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending</span>
                <Badge variant="warning">{stats?.users?.pending || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-gray-500" />
              Fraud Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Valid Clicks</span>
                <span className="font-medium text-green-600">{formatNumber(stats?.clicks?.valid || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fraud Clicks</span>
                <span className="font-medium text-red-600">{formatNumber(stats?.clicks?.fraud || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fraud Rate</span>
                <span className="font-medium">{stats?.clicks?.fraudRate || '0'}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-gray-500" />
              Withdrawals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending Requests</span>
                <Badge variant="warning">{stats?.withdrawals?.pending || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending Amount</span>
                <span className="font-medium">{formatCurrency(stats?.withdrawals?.pendingAmount || '0')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Conversions (30d)</span>
                <span className="font-medium">{formatNumber(stats?.conversions?.total || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/dashboard/users?status=pending"
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
            >
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium text-blue-900">Review Users</p>
              <p className="text-sm text-blue-600">{stats?.users?.pending || 0} pending</p>
            </a>
            <a
              href="/dashboard/campaigns?status=pending_approval"
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
            >
              <Megaphone className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium text-green-900">Review Campaigns</p>
              <p className="text-sm text-green-600">{stats?.campaigns?.pending || 0} pending</p>
            </a>
            <a
              href="/dashboard/withdrawals?status=pending"
              className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors text-center"
            >
              <DollarSign className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="font-medium text-yellow-900">Process Withdrawals</p>
              <p className="text-sm text-yellow-600">{stats?.withdrawals?.pending || 0} pending</p>
            </a>
            <a
              href="/dashboard/fraud"
              className="p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-center"
            >
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="font-medium text-red-900">Fraud Alerts</p>
              <p className="text-sm text-red-600">View reports</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
