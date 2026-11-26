import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

/**
 * Combines class names conditionally with tailwind-merge
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a monetary amount nicely with standard currency formatting.
 */
export function formatCurrency(amount: number | string | null | undefined, currency = 'USD'): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '$0.00';
  }
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(numeric);
}

/**
 * Formats date into readable format: e.g. "Oct 12, 2026"
 */
export function formatDate(dateString?: string | Date | null, formatStr = 'MMM dd, yyyy'): string {
  if (!dateString) return '-';
  try {
    const d = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(d, formatStr);
  } catch {
    return String(dateString);
  }
}

/**
 * Formats date and time into readable format: e.g. "Oct 12, 2026 14:30"
 */
export function formatDateTime(dateString?: string | Date | null, formatStr = 'MMM dd, yyyy HH:mm'): string {
  if (!dateString) return '-';
  try {
    const d = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(d, formatStr);
  } catch {
    return String(dateString);
  }
}

/**
 * Returns UI variant/classes for Room Status
 */
export function getRoomStatusBadge(status: string): {
  label: string;
  variant: 'success' | 'warning' | 'danger' | 'info' | 'default';
  className: string;
} {
  switch (status?.toUpperCase()) {
    case 'AVAILABLE':
      return { label: 'Available', variant: 'success', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800' };
    case 'OCCUPIED':
      return { label: 'Occupied', variant: 'danger', className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800' };
    case 'MAINTENANCE':
      return { label: 'Maintenance', variant: 'warning', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800' };
    case 'DIRTY_CLEANING':
      return { label: 'Dirty / Cleaning', variant: 'info', className: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800' };
    default:
      return { label: status || 'Unknown', variant: 'default', className: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300' };
  }
}

/**
 * Returns UI variant/classes for Booking Status
 */
export function getBookingStatusBadge(status: string): {
  label: string;
  variant: 'success' | 'warning' | 'danger' | 'info' | 'default';
  className: string;
} {
  switch (status?.toUpperCase()) {
    case 'CONFIRMED':
      return { label: 'Confirmed', variant: 'info', className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800' };
    case 'CHECKED_IN':
      return { label: 'Checked In', variant: 'success', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800' };
    case 'CHECKED_OUT':
      return { label: 'Checked Out', variant: 'default', className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' };
    case 'CANCELLED':
      return { label: 'Cancelled', variant: 'danger', className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800' };
    case 'NO_SHOW':
      return { label: 'No Show', variant: 'warning', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800' };
    default:
      return { label: status || 'Unknown', variant: 'default', className: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300' };
  }
}

/**
 * Normalizes Ethiopian phone numbers to international format (+251...).
 * Handles 09..., 07..., 9..., 7..., 2519..., 2517..., and +251...
 */
export function normalizeEthiopianPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');

  // If starts with 09 or 07 and length is 10 digits
  if (/^0[97]\d{8}$/.test(cleaned)) {
    return `+251${cleaned.slice(1)}`;
  }
  // If starts with 9 or 7 and length is 9 digits
  if (/^[97]\d{8}$/.test(cleaned)) {
    return `+251${cleaned}`;
  }
  // If starts with 2519 or 2517 and length is 12 digits
  if (/^251[97]\d{8}$/.test(cleaned)) {
    return `+${cleaned}`;
  }
  // If already +251[97]...
  if (/^\+251[97]\d{8}$/.test(cleaned)) {
    return cleaned;
  }

  return cleaned;
}

/**
 * Safely resolves media URLs from Cloudflare R2 / S3 or local Django media server.
 * Strips accidental leading slashes before absolute URLs (e.g. /https:// -> https://).
 */
export function getImageUrl(path?: string | null): string {
  if (!path) return '';
  const trimmed = path.trim();
  // Strip accidental leading slashes before http:// or https://
  const sanitized = trimmed.replace(/^\/+(https?:\/\/)/i, '$1');
  if (sanitized.startsWith('http://') || sanitized.startsWith('https://')) {
    return sanitized;
  }
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  const baseUrl = apiUrl.replace('/api/v1', '');
  return `${baseUrl}${sanitized.startsWith('/') ? '' : '/'}${sanitized}`;
}

