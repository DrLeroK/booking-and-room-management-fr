'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavItem } from '@/config/navigation';
import { useSidebarStore } from '@/store/sidebar-store';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import {
  Home,
  PlusCircle,
  ClipboardList,
  Users,
  Calendar,
  CreditCard,
  Building,
  BarChart,
  UserCheck,
  FileText,
  Image,
  Mail,
  LineChart,
  Settings,
  Hotel,
  X,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Home,
  PlusCircle,
  ClipboardList,
  Users,
  Calendar,
  CreditCard,
  Building,
  BarChart,
  UserCheck,
  FileText,
  Image,
  Mail,
  LineChart,
  Settings,
};

interface SidebarProps {
  items: NavItem[];
  title?: string;
  badge?: string;
}

export function Sidebar({ items, title, badge }: SidebarProps) {
  const pathname = usePathname();
  const { isOpen, setOpen } = useSidebarStore();

  const isActive = (href: string) => {
    if (href === '/reception' || href === '/manager' || href === '/owner') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300',
          isOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 dark:border-slate-800">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-blue-500/20">
              <Hotel className="w-5 h-5" />
            </div>
            {isOpen && (
              <div className="truncate">
                <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                  {siteConfig.shortName}
                </span>
                <span className="block text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">
                  Management
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {items.map((item) => {
            const Icon = ICON_MAP[item.iconName] || Building;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                    setOpen(false);
                  }
                }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all select-none',
                  active
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200',
                  !isOpen && 'justify-center px-0'
                )}
                title={!isOpen ? item.title : undefined}
              >
                <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-white' : 'text-slate-500 dark:text-slate-400')} />
                {isOpen && <span className="truncate">{item.title}</span>}
                {isOpen && item.badge && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer Info */}
        {isOpen && (
          <div className="p-3 border-t border-slate-100 dark:border-slate-800">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 text-center">
              <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                {title || 'StayCraft PMS'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Version 2.0 Enterprise</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
