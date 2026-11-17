import { ApiClient } from '@/lib/api';
import { Guest } from '@/types';
import { GuestInput } from './schemas';

export const guestsFeatureApi = {
  getGuests: (params?: { search?: string; phone_number?: string }) =>
    ApiClient.get<{ count: number; results: Guest[] }>('/guests/', params),

  getGuest: (id: number) => ApiClient.get<Guest>(`/guests/${id}/`),

  createGuest: (data: Partial<GuestInput> | any) => ApiClient.post<Guest>('/guests/', data),

  updateGuest: (id: number, data: Partial<GuestInput> | any) =>
    ApiClient.patch<Guest>(`/guests/${id}/`, data),

  deleteGuest: (id: number) => ApiClient.delete(`/guests/${id}/`),

  lookupByPhone: (phone: string) =>
    ApiClient.get<Guest>(`/guests/lookup_by_phone/?phone=${encodeURIComponent(phone)}`),
};
