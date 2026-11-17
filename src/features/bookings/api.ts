import { ApiClient } from '@/lib/api';
import { Booking } from '@/types';
import { CheckInInput, CheckOutInput, ExtendStayInput } from './schemas';

export const bookingsFeatureApi = {
  getBookings: (params?: { status?: string; search?: string; check_in_date?: string; check_out_date?: string }) =>
    ApiClient.get<{ count: number; results: Booking[] }>('/bookings/', params),

  getBooking: (id: number) => ApiClient.get<Booking>(`/bookings/${id}/`),

  lookupBooking: (ref: string) => ApiClient.get<Booking>(`/bookings/lookup/?reference=${encodeURIComponent(ref)}`),

  createBooking: (data: any) => ApiClient.post<Booking>('/bookings/', data),

  cancelBooking: (id: number, data?: { reason?: string }) =>
    ApiClient.post<Booking>(`/bookings/${id}/cancel/`, data),

  checkin: (data: CheckInInput | any) => ApiClient.post<Booking>('/bookings/checkin/', data),

  checkout: (data: CheckOutInput | any) => ApiClient.post<Booking>('/bookings/checkout/', data),

  extendStay: (id: number, data: Partial<ExtendStayInput> | any) =>
    ApiClient.post<Booking>(`/bookings/${id}/extend_stay/`, data),

  getLiveBoard: () => ApiClient.get<{ date: string; rooms: any[]; statistics: any }>('/bookings/live-board/'),
};
