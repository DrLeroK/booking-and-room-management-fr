'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { ROLE_NAMES, UserRole } from '@/config/roles';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!user) return null;

  const roleName = user.role ? (ROLE_NAMES[user.role as UserRole] || user.role) : 'Staff';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/90 text-slate-900 transition-all shadow-sm"
        title="Account Menu"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
          {user.first_name?.[0] || user.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="text-left text-xs">
          <p className="font-bold text-slate-900 leading-tight truncate max-w-[120px] sm:max-w-[160px]">
            {user.full_name || user.username}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-blue-700 font-semibold text-[10px] uppercase tracking-wider">{roleName}</span>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {user.full_name || user.username}
            </p>
            <p className="text-xs text-slate-500 truncate">{user.email || user.username}</p>
            <div className="mt-2">
              <Badge variant="info" size="sm">{roleName}</Badge>
            </div>
          </div>

          <div className="py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
