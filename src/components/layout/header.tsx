'use client';

import { Bell, User } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface HeaderProps {
  user: {
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    role: string;
  };
  walletBalance?: string;
}

export function Header({ user, walletBalance }: HeaderProps) {
  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.email;

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Welcome back, {user.firstName || 'User'}!
        </h2>
        <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>

      <div className="flex items-center gap-6">
        {walletBalance && (
          <div className="text-right">
            <p className="text-sm text-gray-500">Balance</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(walletBalance)}
            </p>
          </div>
        )}

        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
            {user.firstName?.charAt(0) || user.email.charAt(0).toUpperCase()}
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-900">{displayName}</p>
            <p className="text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
