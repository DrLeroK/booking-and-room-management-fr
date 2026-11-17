/**
 * Security and Storage Utilities for StayCraft Hotel
 * Comprehensive protection for XSS prevention, JWT validation, safe storage, and file upload integrity.
 */

import { getCookie, setCookie, deleteCookie } from 'cookies-next';

// ==========================================
// 1. XSS Prevention & Text Sanitization
// ==========================================

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Escapes characters that could lead to Cross-Site Scripting (XSS).
 */
export function sanitizeText(input?: string | null): string {
  if (!input) return '';
  return String(input).replace(/[&<>"'/]/g, (match) => HTML_ESCAPE_MAP[match] || match);
}

/**
 * Strips script tags, javascript: protocols, and event handlers.
 */
export function sanitizeSafeString(input?: string | null): string {
  if (!input) return '';
  return String(input)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

// ==========================================
// 2. JWT Validation & Proactive Expiration Check
// ==========================================

export interface JwtPayload {
  id?: number | string;
  user_id?: number | string;
  username?: string;
  role?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Validates whether a string is a syntactically valid JWT (header.payload.signature).
 */
export function isValidJwt(token?: string | null): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

/**
 * Safely decodes a JWT payload without invoking eval.
 */
export function decodeJwt(token?: string | null): JwtPayload | null {
  if (!isValidJwt(token)) return null;
  try {
    const payloadPart = token!.split('.')[1];
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Checks if a JWT is expired with a configurable safety leeway (default: 30 seconds).
 */
export function isJwtExpired(token?: string | null, leewaySeconds = 30): boolean {
  const payload = decodeJwt(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now + leewaySeconds;
}

// ==========================================
// 3. Defensive Storage Wrapper
// ==========================================

class MemoryStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

/**
 * Safe storage wrapper that falls back seamlessly between browser localStorage,
 * cookies-next, and in-memory storage for SSR safety.
 */
class SafeStorageManager {
  private memoryStorage = new MemoryStorage();

  private isLocalStorageAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  getItem(key: string): string | null {
    if (typeof window === 'undefined') {
      return this.memoryStorage.getItem(key);
    }

    try {
      if (this.isLocalStorageAvailable()) {
        const value = window.localStorage.getItem(key);
        if (value !== null) return value;
      }
      // Fallback to cookie
      const cookieValue = getCookie(key);
      if (typeof cookieValue === 'string') return cookieValue;
      return this.memoryStorage.getItem(key);
    } catch {
      return this.memoryStorage.getItem(key);
    }
  }

  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') {
      this.memoryStorage.setItem(key, value);
      return;
    }

    try {
      if (this.isLocalStorageAvailable()) {
        window.localStorage.setItem(key, value);
      }
      // Also sync to cookie for Next.js middleware access
      setCookie(key, value, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
      });
    } catch {
      this.memoryStorage.setItem(key, value);
    }
  }

  removeItem(key: string): void {
    if (typeof window === 'undefined') {
      this.memoryStorage.removeItem(key);
      return;
    }

    try {
      if (this.isLocalStorageAvailable()) {
        window.localStorage.removeItem(key);
      }
      deleteCookie(key, { path: '/' });
    } catch {
      this.memoryStorage.removeItem(key);
    }
  }

  clear(): void {
    if (typeof window !== 'undefined' && this.isLocalStorageAvailable()) {
      try {
        window.localStorage.clear();
      } catch {
        // Ignore
      }
    }
    this.memoryStorage.clear();
  }
}

export const safeStorage = new SafeStorageManager();

// ==========================================
// 4. File Upload Integrity Validator
// ==========================================

export interface FileValidationOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
}

export const DEFAULT_ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
  'application/pdf',
];

export function validateUploadedFile(
  file: File,
  options: FileValidationOptions = {}
): { valid: boolean; error?: string } {
  const maxSizeMB = options.maxSizeMB || 5;
  const allowedTypes = options.allowedTypes || DEFAULT_ALLOWED_IMAGE_TYPES;

  if (file.size > maxSizeMB * 1024 * 1024) {
    return {
      valid: false,
      error: `File size exceeds the limit of ${maxSizeMB}MB.`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not supported. Allowed formats: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
}
