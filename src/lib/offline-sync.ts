import { getCookie } from 'cookies-next';
import { ApiClient, getApiBaseUrl } from './api';

export interface OfflineMutation {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload: any;
  idempotencyKey: string;
  createdAt: string;
  status: 'PENDING' | 'SYNCING' | 'CONFLICT' | 'SYNCED' | 'FAILED';
  errorDetail?: string;
  description?: string;
}

const STORAGE_KEY = 'staycraft_offline_outbox';

export class OfflineSyncManager {
  private static listeners: Array<(mutations: OfflineMutation[]) => void> = [];

  public static getPendingMutations(): OfflineMutation[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static enqueueMutation(
    endpoint: string,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    payload: any,
    description = 'Staff action'
  ): OfflineMutation {
    const idempotencyKey = `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const mutation: OfflineMutation = {
      id: idempotencyKey,
      endpoint,
      method,
      payload,
      idempotencyKey,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
      description,
    };

    const current = this.getPendingMutations();
    current.push(mutation);
    this.saveMutations(current);
    this.notifyListeners(current);
    return mutation;
  }

  public static async syncQueue(): Promise<{ synced: number; conflicts: number; failed: number }> {
    if (typeof window === 'undefined' || !navigator.onLine) {
      return { synced: 0, conflicts: 0, failed: 0 };
    }

    const mutations = this.getPendingMutations();
    if (mutations.length === 0) return { synced: 0, conflicts: 0, failed: 0 };

    let synced = 0;
    let conflicts = 0;
    let failed = 0;
    const remaining: OfflineMutation[] = [];

    for (const mutation of mutations) {
      if (mutation.status === 'SYNCED') continue;

      try {
        mutation.status = 'SYNCING';
        this.saveMutations(mutations);

        const fullUrl = mutation.endpoint.startsWith('http')
          ? mutation.endpoint
          : `${getApiBaseUrl()}${mutation.endpoint.startsWith('/') ? '' : '/'}${mutation.endpoint}`;

        const token = (typeof window !== 'undefined' ? getCookie('access_token') : null) || ApiClient.getAccessToken() || '';

        const response = await fetch(fullUrl, {
          method: mutation.method,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Idempotency-Key': mutation.idempotencyKey,
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(mutation.payload),
        });

        if (response.ok || response.status === 201 || response.status === 200) {
          mutation.status = 'SYNCED';
          synced++;
        } else if (response.status === 409) {
          const errData = await response.json().catch(() => ({}));
          mutation.status = 'CONFLICT';
          mutation.errorDetail = errData.message || errData.detail || 'Room is already occupied or booked by another guest.';
          conflicts++;
          remaining.push(mutation);
        } else {
          mutation.status = 'FAILED';
          failed++;
          remaining.push(mutation);
        }
      } catch (err: any) {
        mutation.status = 'FAILED';
        mutation.errorDetail = err?.message || 'Network error during sync';
        failed++;
        remaining.push(mutation);
      }
    }

    this.saveMutations(remaining);
    this.notifyListeners(remaining);
    return { synced, conflicts, failed };
  }

  public static clearMutation(id: string) {
    const filtered = this.getPendingMutations().filter((m) => m.id !== id);
    this.saveMutations(filtered);
    this.notifyListeners(filtered);
  }

  public static subscribe(callback: (mutations: OfflineMutation[]) => void): () => void {
    this.listeners.push(callback);
    callback(this.getPendingMutations());
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private static saveMutations(mutations: OfflineMutation[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mutations));
    } catch (e) {
      console.warn('Failed to save offline mutations to storage:', e);
    }
  }

  private static notifyListeners(mutations: OfflineMutation[]) {
    this.listeners.forEach((cb) => cb(mutations));
  }
}
