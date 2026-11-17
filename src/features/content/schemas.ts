import { z } from 'zod';

export const inquirySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional().nullable(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(5, 'Message must be at least 5 characters'),
});

export const hotelProfileSchema = z.object({
  name: z.string().min(1, 'Hotel name is required'),
  tagline: z.string().optional().nullable(),
  about_us: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
export type HotelProfileInput = z.infer<typeof hotelProfileSchema>;
