import api from './client';
import { User, LoginCredentials, AuthResponse } from '@/lib/types';

// ============ AUTH ENDPOINTS ============
export const authAPI = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>('/users/login/', credentials),

  refreshToken: (refresh: string) =>
    api.post<{ access: string }>('/users/token/refresh/', { refresh }),

  getProfile: () => api.get<User>('/users/me/'),

  changePassword: (data: { 
    old_password: string; 
    new_password: string; 
    new_password_confirm: string 
  }) => api.post('/users/change-password/', data),
};

// ============ USER ENDPOINTS ============
export const userAPI = {
  getUsers: (params?: { role?: string; is_active?: boolean; search?: string }) =>
    api.get<{ count: number; results: User[] }>('/users/', { params }),

  createUser: (data: Partial<User>) =>
    api.post<User>('/users/', data),

  updateUser: (id: number, data: Partial<User>) =>
    api.patch<User>(`/users/${id}/`, data),

  deleteUser: (id: number) =>
    api.delete(`/users/${id}/`),

  toggleActive: (id: number) =>
    api.post<{ message: string; user: User }>(`/users/${id}/toggle_active/`),
};

// ============ ROOM ENDPOINTS ============
export const roomAPI = {
  getRooms: (params?: { status?: string; floor?: number; room_type?: number; search?: string }) =>
    api.get<{ count: number; results: any[] }>('/rooms/', { params }),

  getRoom: (id: number) =>
    api.get<any>(`/rooms/${id}/`),

  createRoom: (data: any) =>
    api.post<any>('/rooms/', data),

  updateRoom: (id: number, data: any) =>
    api.patch<any>(`/rooms/${id}/`, data),

  deleteRoom: (id: number) =>
    api.delete(`/rooms/${id}/`),

  updateStatus: (id: number, data: { status: string; notes?: string }) =>
    api.post<any>(`/rooms/${id}/update-status/`, data),

  getAvailableRooms: (params: { check_in_date: string; check_out_date: string; guests_count?: number; room_type_id?: number }) =>
    api.get<{
      available_count: number;
      rooms: any[];
      search_criteria: any;
      online_sales_closed?: boolean;
      notice?: string;
    }>('/rooms/public-availability/', { params }),

  getRoomTypes: () =>
    api.get<{ results: any[] }>('/rooms/types/'),

  getAmenities: () =>
    api.get<{ results: any[] }>('/rooms/amenities/'),

  // Room Type CRUD
  createRoomType: (data: any) =>
    api.post<any>('/rooms/types/', data),

  updateRoomType: (id: number, data: any) =>
    api.patch<any>(`/rooms/types/${id}/`, data),

  deleteRoomType: (id: number) =>
    api.delete(`/rooms/types/${id}/`),

  // Amenity CRUD
  createAmenity: (data: any) =>
    api.post<any>('/rooms/amenities/', data),

  updateAmenity: (id: number, data: any) =>
    api.patch<any>(`/rooms/amenities/${id}/`, data),

  deleteAmenity: (id: number) =>
    api.delete(`/rooms/amenities/${id}/`),

  // Room Temporary Hold (10-minute hold for online checkout)
  createRoomHold: (data: { room: number; check_in_date: string; check_out_date: string; session_id: string }) =>
    api.post<any>('/rooms/holds/', data),

  releaseRoomHold: (data: { session_id?: string; hold_id?: number }) =>
    api.post<any>('/rooms/holds/release/', data),
};

// ============ GUEST ENDPOINTS ============
export const guestAPI = {
  getGuests: (params?: { search?: string; phone_number?: string }) =>
    api.get<{ count: number; results: any[] }>('/guests/', { params }),

  getGuest: (id: number) =>
    api.get<any>(`/guests/${id}/`),

  createGuest: (data: any) =>
    api.post<any>('/guests/', data),

  updateGuest: (id: number, data: any) =>
    api.patch<any>(`/guests/${id}/`, data),

  deleteGuest: (id: number) =>
    api.delete(`/guests/${id}/`),

  getByPhone: (phone_number: string) =>
    api.get<{ count: number; results: any[] }>('/guests/by-phone/', { params: { phone_number } }),
};

// ============ BOOKING ENDPOINTS ============
export const bookingAPI = {
  getBookings: (params?: { 
    status?: string; 
    phone_number?: string; 
    room_number?: string; 
    search?: string;
    page?: number;
    page_size?: number;
  }) =>
    api.get<{ count: number; results: any[] }>('/bookings/', { params }),

  getBooking: (id: number) =>
    api.get<any>(`/bookings/${id}/`),

  createOnlineBooking: (data: FormData) =>
    api.post<{ message: string; booking: any }>('/bookings/online-book/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  walkInCheckin: (data: any) =>
    api.post<{ message: string; booking: any }>('/bookings/reception/walk-in-checkin/', data),

  reservationCheckin: (data: any) =>
    api.post<{ message: string; booking: any }>('/bookings/reception/checkin/', data),

  checkout: (data: any) =>
    api.post<{ message: string; booking: any }>('/bookings/reception/checkout/', data),

  extendStay: (data: {
    booking_id: number;
    new_check_out_date: string;
    money_received?: number | string;
    payment_method?: string;
    receptionist_name?: string;
    notes?: string;
  }) =>
    api.post<{
      message: string;
      extension_days: number;
      additional_amount: number;
      old_check_out_date: string;
      new_check_out_date: string;
      booking: any;
    }>('/bookings/reception/extend-stay/', data),

  getLiveBoard: () =>
    api.get<{
      date: string;
      summary: {
        total_rooms: number;
        available_count: number;
        occupied_count: number;
        cleaning_count: number;
        maintenance_count: number;
        pending_payment_verification_count: number;
      };
      active_stay_count: number;
      expected_arrivals_today: any[];
      expected_departures_today: any[];
      pending_payment_verifications: any[];
      rooms_live_state: any[];
    }>('/bookings/reception/live-board/'),

  getHotelBankDetails: () =>
    api.get<{
      bank_name: string;
      account_name: string;
      account_number: string;
      swift_code: string;
      instructions: string;
    }>('/bookings/hotel-bank-details/'),

  getPendingVerification: () =>
    api.get<{ count: number; results: any[] }>('/bookings/pending-verification/'),

  lookupBooking: (params: { phone_number: string; booking_reference?: string }) =>
    api.get<{ count: number; bookings: any[] }>('/bookings/online-lookup/', { params }),
};

// ============ PAYMENT ENDPOINTS ============
export const paymentAPI = {
  getPayments: (params?: { status?: string; booking?: number; payment_type?: string }) =>
    api.get<{ count: number; results: any[] }>('/payments/', { params }),

  getPayment: (id: number) =>
    api.get<any>(`/payments/${id}/`),

  verifyPayment: (data: { payment_id: number; action: 'APPROVE' | 'REJECT'; receptionist_name?: string; notes?: string }) =>
    api.post<{
      message: string;
      action: string;
      booking: any;
      payment: any;
      sms_notification_sent: any;
    }>('/bookings/reception/verify-payment/', data),
};

// ============ ANALYTICS ENDPOINTS ============
export const analyticsAPI = {
  getDaily: (params?: { date?: string }) =>
    api.get<{
      date: string;
      total_rooms: number;
      maintenance_rooms: number;
      available_capacity: number;
      rooms_sold: number;
      occupancy_rate_percentage: number;
      check_ins_count: number;
      check_outs_count: number;
      total_revenue: number;
      average_daily_rate_adr: number;
      revenue_per_available_room_revpar: number;
      revenue_by_payment_method: Record<string, number>;
      booking_source_breakdown: Record<string, number>;
    }>('/analytics/daily/', { params }),

  getWeekly: (params?: { start_date?: string }) =>
    api.get<{
      week_start_date: string;
      week_end_date: string;
      total_weekly_revenue: number;
      average_weekly_occupancy_percentage: number;
      total_weekly_check_ins: number;
      total_weekly_check_outs: number;
      room_types_performance: Array<{
        room_type_id: number;
        room_type_name: string;
        bookings_count: number;
        total_revenue: number;
      }>;
      daily_breakdown: any[];
    }>('/analytics/weekly/', { params }),

  getSummary: () =>
    api.get<{
      today_date: string;
      today_revenue: number;
      today_occupancy_rate: number;
      this_week_revenue: number;
      this_month_revenue: number;
      rooms_summary: {
        total: number;
        occupied: number;
        available: number;
        maintenance: number;
      };
    }>('/analytics/summary/'),
};

// ============ CONTENT ENDPOINTS ============
export const contentAPI = {
  getLandingPage: () =>
    api.get<{
      hotel_profile: any;
      room_types: any[];
      amenities: any[];
      testimonials: any[];
      gallery: any[];
      partners: any[];
      faqs: any[];
      bank_transfer_details: any;
    }>('/content/landing-page/'),

  getHotelProfile: () =>
    api.get<any>('/content/profile/'),

  updateHotelProfile: (data: any) =>
    api.put<any>('/content/profile/', data),

  getTestimonials: () =>
    api.get<{ results: any[] }>('/content/testimonials/'),

  createTestimonial: (data: any) =>
    api.post<any>('/content/testimonials/', data),

  updateTestimonial: (id: number, data: any) =>
    api.patch<any>(`/content/testimonials/${id}/`, data),

  deleteTestimonial: (id: number) =>
    api.delete(`/content/testimonials/${id}/`),

  getGallery: () =>
    api.get<{ results: any[] }>('/content/gallery/'),

  getPartners: () =>
    api.get<{ results: any[] }>('/content/partners/'),

  getFAQs: () =>
    api.get<{ results: any[] }>('/content/faqs/'),

  submitContact: (data: { name: string; email: string; phone?: string; subject: string; message: string }) =>
    api.post<{ message: string; inquiry: any }>('/content/contact-inquiry/', data),
};

// ============ CONTACT INQUIRY ENDPOINTS ============
export const inquiryAPI = {
  getInquiries: (params?: { status?: string }) =>
    api.get<{ results: any[] }>('/content/contact-inquiry/', { params }),

  getInquiry: (id: number) =>
    api.get<any>(`/content/contact-inquiry/${id}/`),

  updateInquiry: (id: number, data: any) =>
    api.patch<any>(`/content/contact-inquiry/${id}/`, data),

  getInquiryStats: () =>
    api.get<{
      total: number;
      new: number;
      read: number;
      in_progress: number;
      resolved: number;
      closed: number;
      pending: number;
    }>('/content/contact-inquiry/stats/'),
};

// ============ EXPORT ENDPOINTS ============
export const exportAPI = {
  exportBookings: (params?: { start_date?: string; end_date?: string; status?: string }) =>
    api.get('/analytics/export/bookings/', { params, responseType: 'blob' }),

  exportPayments: (params?: { start_date?: string; end_date?: string; status?: string }) =>
    api.get('/analytics/export/payments/', { params, responseType: 'blob' }),

  exportGuests: (params?: { start_date?: string; end_date?: string }) =>
    api.get('/analytics/export/guests/', { params, responseType: 'blob' }),
};

// ============ BANK DETAILS ENDPOINTS ============
export const bankAPI = {
  getBankDetails: () =>
    api.get<{
      id: number;
      bank_name: string;
      account_name: string;
      account_number: string;
      swift_code: string;
      instructions: string;
      created_at: string;
      updated_at: string;
    }>('/content/bank-details/'),

  updateBankDetails: (data: {
    bank_name?: string;
    account_name?: string;
    account_number?: string;
    swift_code?: string;
    instructions?: string;
  }) =>
    api.put<{
      id: number;
      bank_name: string;
      account_name: string;
      account_number: string;
      swift_code: string;
      instructions: string;
      created_at: string;
      updated_at: string;
    }>('/content/bank-details/', data),

  getPublicBankDetails: () =>
    api.get<{
      id: number;
      bank_name: string;
      account_name: string;
      account_number: string;
      swift_code: string;
      instructions: string;
      accounts?: any[];
    }>('/content/public-bank-details/'),

  getBankAccounts: () =>
    api.get<{ results: any[] }>('/content/bank-accounts/'),

  createBankAccount: (data: FormData | any) =>
    api.post<any>('/content/bank-accounts/', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    }),

  updateBankAccount: (id: number, data: FormData | any) =>
    api.patch<any>(`/content/bank-accounts/${id}/`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    }),

  deleteBankAccount: (id: number) =>
    api.delete(`/content/bank-accounts/${id}/`),
};

// ============ IN-APP NOTIFICATIONS ENDPOINTS ============
export interface AppNotification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  notification_type_display: string;
  target_role: string;
  link: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export const notificationsAPI = {
  getNotifications: (params?: { page?: number; is_read?: boolean }) =>
    api.get<{ count: number; unread_count: number; results: AppNotification[] }>('/notifications/', { params }),

  markAsRead: (id: number) =>
    api.post<{ notification: AppNotification; unread_count: number }>(`/notifications/${id}/mark-read/`),

  markAllAsRead: () =>
    api.post<{ detail: string; unread_count: number }>('/notifications/mark-all-read/'),
};

// ============ AUDIT LOG ENDPOINTS ============
export interface AuditLogItem {
  id: number;
  actor: number | null;
  actor_name: string;
  actor_email: string;
  actor_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  description: string;
  changes: Record<string, any>;
  ip_address: string | null;
  user_agent: string;
  created_at: string;
}

export const auditAPI = {
  getAuditLogs: (params?: {
    page?: number;
    action?: string;
    entity_type?: string;
    search?: string;
    start_date?: string;
    end_date?: string;
  }) =>
    api.get<{
      count: number;
      total_pages: number;
      current_page: number;
      results: AuditLogItem[];
    }>('/audit-logs/', { params }),
};

