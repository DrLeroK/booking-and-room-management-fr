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
        className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-semibold text-sm shadow-sm">
          {user.first_name?.[0] || user.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="hidden md:block text-left text-xs">
          <p className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">
            {user.full_name || user.username}
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-[11px]">{roleName}</p>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
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
