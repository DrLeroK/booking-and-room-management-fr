'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Menu,
  Hotel,
  CreditCard,
  Bell,
  Copy,
  Check,
  X,
  ExternalLink,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { useSidebarStore } from '@/store/sidebar-store';
import { UserMenu } from './user-menu';
import { siteConfig } from '@/config/site';
import { bankAPI, bookingAPI } from '@/lib/api/endpoints';
import { formatCurrency, getImageUrl } from '@/lib/utils';

interface TopbarProps {
  title?: string;
  badge?: string;
}

interface BankAccount {
  id: number;
  bank_name: string;
  account_name: string;
  account_number: string;
  branch_name?: string;
  swift_code?: string;
  instructions?: string;
  qr_code?: string;
  qr_code_url?: string;
  is_active?: boolean;
}

interface PendingBooking {
  id: number;
  booking_reference: string;
  guest?: {
    first_name: string;
    last_name: string;
    phone_number: string;
  };
  room?: {
    room_number: string;
    room_type_name?: string;
  };
  total_amount: number | string;
  created_at: string;
}

export function Topbar({ title, badge }: TopbarProps) {
  const { toggle } = useSidebarStore();

  // Bank Accounts state
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Notification state
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Fetch pending verifications
  const fetchPendingVerifications = async () => {
    try {
      const res = await bookingAPI.getPendingVerification();
      const count = res.data?.count ?? (res.data?.results ? res.data.results.length : 0);
      setPendingCount(count);
      setPendingBookings(res.data?.results || []);
    } catch {
      // Fallback silently if unauthenticated or error
    }
  };

  useEffect(() => {
    fetchPendingVerifications();
    const interval = setInterval(fetchPendingVerifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotifOpen]);

  // Fetch bank accounts on open
  const openBankModal = async () => {
    setIsBankModalOpen(true);
    setLoadingBanks(true);
    try {
      const res = await bankAPI.getBankAccounts();
      const list = res.data?.results || (Array.isArray(res.data) ? res.data : []);
      if (list.length > 0) {
        setBankAccounts(list.filter((b: BankAccount) => b.is_active !== false));
      } else {
        const pub = await bankAPI.getPublicBankDetails();
        if (pub.data?.accounts && pub.data.accounts.length > 0) {
          setBankAccounts(pub.data.accounts);
        } else if (pub.data?.bank_name) {
          setBankAccounts([pub.data]);
        }
      }
    } catch {
      try {
        const pub = await bankAPI.getPublicBankDetails();
        if (pub.data?.accounts && pub.data.accounts.length > 0) {
          setBankAccounts(pub.data.accounts);
        } else if (pub.data?.bank_name) {
          setBankAccounts([pub.data]);
        }
      } catch (err) {
        console.error('Failed to load bank details', err);
      }
    } finally {
      setLoadingBanks(false);
    }
  };

  const handleCopy = (acc: BankAccount) => {
    navigator.clipboard.writeText(acc.account_number);
    setCopiedId(acc.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all text-slate-900">
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {title && (
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900">
                {title}
              </h1>
              {badge && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                  {badge}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Bank Accounts Button */}
          <button
            onClick={openBankModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs sm:text-sm font-medium border border-slate-200 transition-all"
            title="View Hotel Bank Accounts"
          >
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Bank Accounts</span>
          </button>

          {/* Real-time Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                if (!isNotifOpen) {
                  fetchPendingVerifications();
                }
              }}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Payment notifications"
            >
              <Bell className="w-5 h-5" />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-600 rounded-full animate-pulse shadow-sm">
                  {pendingCount > 99 ? '99+' : pendingCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">Online Payments</span>
                    {pendingCount > 0 && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-rose-50 text-rose-600 rounded-full border border-rose-200">
                        {pendingCount} Pending
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setLoadingNotifs(true);
                      fetchPendingVerifications().finally(() => setLoadingNotifs(false));
                    }}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingNotifs ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {pendingBookings.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      <Check className="w-6 h-6 mx-auto mb-1 text-emerald-500 opacity-80" />
                      No pending payment verifications!
                    </div>
                  ) : (
                    pendingBookings.map((bk) => (
                      <Link
                        key={bk.id}
                        href="/reception/payments"
                        onClick={() => setIsNotifOpen(false)}
                        className="block px-4 py-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {bk.guest ? `${bk.guest.first_name} ${bk.guest.last_name || ''}`.trim() : 'Guest'}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Ref: <span className="font-mono text-slate-700">{bk.booking_reference}</span>
                              {bk.room && ` • Room ${bk.room.room_number}`}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-blue-600">
                            {formatCurrency(Number(bk.total_amount))}
                          </span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
                  <Link
                    href="/reception/payments"
                    onClick={() => setIsNotifOpen(false)}
                    className="flex items-center justify-center gap-1.5 w-full py-2 px-3 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    Open Payments Dashboard
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-700 font-medium">
            <Hotel className="w-3.5 h-3.5 text-blue-600" />
            <span>{siteConfig.shortName} Live</span>
          </div>

          <UserMenu />
        </div>
      </header>

      {/* Hotel Bank Accounts Modal */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Hotel Bank Accounts</h3>
                  <p className="text-xs text-slate-500">Official accounts for guest transfers &amp; deposits</p>
                </div>
              </div>
              <button
                onClick={() => setIsBankModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingBanks ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-2 text-slate-400 text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  <span>Loading bank accounts...</span>
                </div>
              ) : bankAccounts.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No hotel bank accounts configured.
                </div>
              ) : (
                bankAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          {account.bank_name}
                          {account.branch_name && (
                            <span className="text-[11px] font-normal text-slate-500">
                              ({account.branch_name})
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5">{account.account_name}</p>
                      </div>
                      {(account.qr_code_url || account.qr_code) && (
                        <div className="p-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                          <img
                            src={getImageUrl(account.qr_code_url || account.qr_code || '')}
                            alt="Bank QR Code"
                            className="w-12 h-12 object-contain rounded"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                          Account Number
                        </span>
                        <span className="font-mono font-semibold text-slate-900 text-sm">
                          {account.account_number}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(account)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          copiedId === account.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200'
                        }`}
                      >
                        {copiedId === account.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>

                    {account.swift_code && (
                      <p className="text-[11px] text-slate-500">
                        SWIFT / BIC: <span className="font-mono font-medium text-slate-700">{account.swift_code}</span>
                      </p>
                    )}

                    {account.instructions && (
                      <p className="text-xs text-slate-500 italic bg-white/60 p-2 rounded-lg border border-slate-100">
                        {account.instructions}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
              <button
                onClick={() => setIsBankModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
