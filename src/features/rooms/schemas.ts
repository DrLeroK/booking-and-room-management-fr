import { z } from 'zod';

export const roomSchema = z.object({
  room_number: z.string().min(1, 'Room number is required'),
  floor: z.number().int().min(0, 'Floor must be 0 or higher'),
  room_type: z.number().int().positive('Please select a room type'),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'DIRTY_CLEANING']),
  price_per_night_override: z.number().optional().nullable(),
  amenities: z.array(z.number()).default([]),
  is_active: z.boolean().default(true),
  notes: z.string().optional().nullable(),
});

export const roomTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional().nullable(),
  base_price_per_night: z.number().positive('Price must be greater than 0'),
  max_occupancy: z.number().int().min(1, 'Max occupancy must be at least 1'),
  is_active: z.boolean().default(true),
});

export const amenitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  icon: z.string().default('sparkles'),
  description: z.string().optional().nullable(),
});

export type RoomInput = z.infer<typeof roomSchema>;
export type RoomTypeInput = z.infer<typeof roomTypeSchema>;
export type AmenityInput = z.infer<typeof amenitySchema>;
