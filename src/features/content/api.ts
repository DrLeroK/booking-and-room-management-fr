import { ApiClient } from '@/lib/api';
import { HotelProfile, HotelBankDetails, ContactInquiry } from '@/types';
import { InquiryInput } from './schemas';

export const contentFeatureApi = {
  getHotelProfile: () => ApiClient.get<HotelProfile>('/content/hotel-profile/'),

  updateHotelProfile: (data: FormData | Partial<HotelProfile>) =>
    ApiClient.patch<HotelProfile>('/content/hotel-profile/', data),

  getBankDetails: () => ApiClient.get<HotelBankDetails>('/content/bank-details/'),

  updateBankDetails: (data: Partial<HotelBankDetails>) =>
    ApiClient.put<HotelBankDetails>('/content/bank-details/', data),

  getInquiries: (params?: { is_resolved?: boolean; search?: string }) =>
    ApiClient.get<{ count: number; results: ContactInquiry[] }>('/content/contact-inquiries/', params),

  submitInquiry: (data: InquiryInput) =>
    ApiClient.post<ContactInquiry>('/content/contact-inquiries/', data),

  resolveInquiry: (id: number) =>
    ApiClient.post<ContactInquiry>(`/content/contact-inquiries/${id}/resolve/`),
};
