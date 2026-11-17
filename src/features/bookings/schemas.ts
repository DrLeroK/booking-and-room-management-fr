import { z } from 'zod';

export const bookingReservationSchema = z.object({
  room_id: z.number().int().positive('Room is required'),
  check_in_date: z.string().min(1, 'Check-in date is required'),
  check_out_date: z.string().min(1, 'Check-out date is required'),
  adults_count: z.number().int().min(1).default(1),
  children_count: z.number().int().min(0).default(0),
  special_requests: z.string().optional().nullable(),
  guest: z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email required'),
    phone_number: z.string().min(6, 'Valid phone number required'),
    identification_type: z.string().default('PASSPORT'),
    identification_number: z.string().optional().nullable(),
  }),
});

export const checkInSchema = z.object({
  booking_id: z.number().int().positive(),
  money_received: z.number().min(0, 'Received amount must be 0 or positive'),
  deposit_amount: z.number().min(0).default(0),
  payment_method: z.enum(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'TELEBIRR', 'CBE_BIRR', 'OTHER']),
  key_card_number: z.string().optional().nullable(),
  receptionist_name: z.string().min(1, 'Receptionist name is required'),
  notes: z.string().optional().nullable(),
});

export const checkOutSchema = z.object({
  booking_id: z.number().int().positive(),
  additional_charges: z.number().min(0).default(0),
  additional_charges_notes: z.string().optional().nullable(),
  final_amount_paid: z.number().min(0).default(0),
  payment_method: z.string().default('CASH'),
  room_inspected: z.boolean().default(true),
  receptionist_name: z.string().default('Receptionist'),
  notes: z.string().optional().nullable(),
});

export const extendStaySchema = z.object({
  booking_id: z.number().int().positive(),
  new_check_out_date: z.string().min(1, 'New check-out date is required'),
  additional_amount: z.number().min(0),
  payment_method: z.string().default('CASH'),
  notes: z.string().optional().nullable(),
});

export type BookingReservationInput = z.infer<typeof bookingReservationSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
export type CheckOutInput = z.infer<typeof checkOutSchema>;
export type ExtendStayInput = z.infer<typeof extendStaySchema>;
