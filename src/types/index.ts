// ============ USER TYPES ============
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'ADMIN' | 'OWNER' | 'MANAGER' | 'RECEPTIONIST';
  phone_number?: string;
  employee_id?: string;
  notes?: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

// ============ ROOM TYPES ============
export interface RoomType {
  id: number;
  name: string;
  code: string;
  description?: string;
  base_price_per_night: number;
  max_occupancy: number;
  is_active: boolean;
  active_rooms_count: number;
  created_at: string;
  updated_at: string;
}

export interface Amenity {
  id: number;
  name: string;
  code: string;
  icon: string;
  description?: string;
}

export interface Room {
  id: number;
  room_number: string;
  floor: number;
  room_type: number;
  room_type_details?: RoomType;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'DIRTY_CLEANING';
  status_display?: string;
  price_per_night_override?: number;
  effective_price_per_night: number;
  amenities: number[];
  amenities_details?: Amenity[];
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ============ GUEST TYPES ============
export interface Guest {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  email?: string;
  identification_type: string;
  identification_number?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ============ BOOKING TYPES ============
export interface CheckInRecord {
  id: number;
  receptionist_name: string;
  actual_check_in_time: string;
  money_received: number;
  deposit_amount: number;
  payment_method: string;
  payment_method_display?: string;
  key_card_number?: string;
  notes?: string;
  created_at: string;
}

export interface CheckOutRecord {
  id: number;
  receptionist_name: string;
  actual_check_out_time: string;
  additional_charges: number;
  additional_charges_notes?: string;
  final_amount_paid: number;
  payment_method: string;
  payment_method_display?: string;
  room_inspected: boolean;
  notes?: string;
  created_at: string;
}

export interface Payment {
  id: number;
  transaction_id: string;
  booking: number;
  amount: number;
  payment_type: string;
  payment_type_display?: string;
  payment_method: string;
  payment_method_display?: string;
  status: string;
  status_display?: string;
  payment_proof?: string;
  payment_proof_url?: string;
  transaction_reference?: string;
  verified_at?: string;
  verified_by?: string;
  verification_notes?: string;
  recorded_by: string;
  payment_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: number;
  booking_reference: string;
  guest: number;
  guest_details: Guest;
  room: number;
  room_details: Room;
  booking_source: 'ONLINE' | 'WALK_IN' | 'PHONE';
  booking_source_display?: string;
  status: 'PENDING_PAYMENT_VERIFICATION' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW';
  status_display?: string;
  check_in_date: string;
  check_out_date: string;
  total_nights: number;
  adults_count: number;
  children_count: number;
  nightly_rate: number;
  total_amount: number;
  special_requests?: string;
  check_in_record?: CheckInRecord;
  check_out_record?: CheckOutRecord;
  payments: Payment[];
  created_at: string;
  updated_at: string;
}

// ============ ANALYTICS TYPES ============
export namespace Analytics {
  export interface Daily {
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
  }

  export interface Weekly {
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
    daily_breakdown: Daily[];
  }

  export interface Summary {
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
  }
}

// ============ CONTENT TYPES ============
export interface HotelProfile {
  id: number;
  name: string;
  tagline: string;
  about_us: string;
  hero_image?: string;
  hero_image_url?: string;
  address: string;
  contact_phone: string;
  contact_email: string;
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  google_maps_embed?: string;
}

export interface Testimonial {
  id: number;
  guest_name: string;
  guest_title: string;
  avatar?: string;
  avatar_url?: string;
  rating: number;
  comment: string;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface GalleryItem {
  id: number;
  title: string;
  category: number;
  category_name?: string;
  image: string;
  image_url?: string;
  caption: string;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
  is_active: boolean;
  display_order: number;
}

export interface ContactInquiry {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  is_resolved: boolean;
  response_notes?: string;
  created_at: string;
}

// ============ DASHBOARD TYPES ============
export interface DashboardSummary {
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
  expected_arrivals_today: Booking[];
  expected_departures_today: Booking[];
  pending_payment_verifications: Booking[];
  rooms_live_state: Room[];
}

// ============ API RESPONSE TYPES ============
export interface APIResponse<T> {
  count?: number;
  next?: string;
  previous?: string;
  results?: T[];
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  total_pages?: number;
  current_page?: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}

export interface HotelBankDetails {
  id?: number;
  bank_name: string;
  account_name: string;
  account_number: string;
  swift_code?: string;
  instructions?: string;
  is_active?: boolean;
}
