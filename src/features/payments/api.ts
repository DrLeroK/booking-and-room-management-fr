import { ApiClient } from '@/lib/api';
import { Payment } from '@/types';
import { PaymentInput } from './schemas';

export const paymentsFeatureApi = {
  getPayments: (params?: { booking?: number; status?: string; payment_method?: string }) =>
    ApiClient.get<{ count: number; results: Payment[] }>('/payments/', params),

  getPayment: (id: number) => ApiClient.get<Payment>(`/payments/${id}/`),

  recordPayment: (data: Partial<PaymentInput> | any) => ApiClient.post<Payment>('/payments/', data),

  verifyPayment: (id: number, data?: { notes?: string }) =>
    ApiClient.post<Payment>(`/payments/${id}/verify/`, data),

  rejectPayment: (id: number, data?: { notes?: string }) =>
    ApiClient.post<Payment>(`/payments/${id}/reject/`, data),

  uploadProof: (id: number, formData: FormData) =>
    ApiClient.post<Payment>(`/payments/${id}/upload_proof/`, formData),
};
