import { z } from 'zod';

export const guestSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().default(''),
  phone_number: z.string().min(6, 'Valid phone number required'),
  email: z.string().email('Valid email required').optional().or(z.literal('')),
  identification_type: z.string().default('PASSPORT'),
  identification_number: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export type GuestInput = z.infer<typeof guestSchema>;
