'use client';

import React from 'react';
import { NavItem } from '@/config/navigation';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { useSidebarStore } from '@/store/sidebar-store';

import { OfflineNoticeBanner } from '@/components/common/OfflineNoticeBanner';

interface DashboardShellProps {
  items: NavItem[];
  title?: string;
  badge?: string;
  children: React.ReactNode;
}

export function DashboardShell({ items, title, badge, children }: DashboardShellProps) {
  const { isOpen } = useSidebarStore();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      <Sidebar items={items} title={title} badge={badge} />
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isOpen ? 'lg:pl-64' : 'lg:pl-20'
        }`}
      >
        <OfflineNoticeBanner />
        <Topbar title={title} badge={badge} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
