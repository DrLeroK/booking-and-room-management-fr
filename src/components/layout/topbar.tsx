'use client';

import React from 'react';
import { Menu, Hotel } from 'lucide-react';
import { useSidebarStore } from '@/store/sidebar-store';
import { UserMenu } from './user-menu';
import { siteConfig } from '@/config/site';

interface TopbarProps {
  title?: string;
  badge?: string;
}

export function Topbar({ title, badge }: TopbarProps) {
  const { toggle } = useSidebarStore();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {title && (
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
              {title}
            </h1>
            {badge && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 font-medium border border-blue-200 dark:border-blue-800">
                {badge}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
          <Hotel className="w-3.5 h-3.5 text-blue-600" />
          <span>{siteConfig.shortName} Live</span>
        </div>
        <UserMenu />
      </div>
    </header>
  );
}
