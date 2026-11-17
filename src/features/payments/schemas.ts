import { z } from 'zod';

export const paymentSchema = z.object({
  booking: z.number().int().positive('Booking is required'),
  amount: z.number().positive('Amount must be positive'),
  payment_type: z.enum(['ROOM_PAYMENT', 'ADDITIONAL_CHARGES', 'SECURITY_DEPOSIT', 'REFUND']).default('ROOM_PAYMENT'),
  payment_method: z.enum(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'TELEBIRR', 'CBE_BIRR', 'OTHER']),
  transaction_reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type PaymentInput = z.infer<typeof paymentSchema>;
