import { ApiClient } from '@/lib/api';
import { Room, RoomType, Amenity } from '@/types';
import { RoomInput, RoomTypeInput, AmenityInput } from './schemas';

export const roomsFeatureApi = {
  getRooms: (params?: { status?: string; floor?: number; room_type?: number; search?: string }) =>
    ApiClient.get<{ count: number; results: Room[] }>('/rooms/', params),

  getRoom: (id: number) => ApiClient.get<Room>(`/rooms/${id}/`),

  createRoom: (data: Partial<RoomInput>) => ApiClient.post<Room>('/rooms/', data),

  updateRoom: (id: number, data: Partial<RoomInput>) => ApiClient.patch<Room>(`/rooms/${id}/`, data),

  deleteRoom: (id: number) => ApiClient.delete(`/rooms/${id}/`),

  updateStatus: (id: number, data: { status: string; notes?: string }) =>
    ApiClient.post<Room>(`/rooms/${id}/update-status/`, data),

  getAvailableRooms: (params: {
    check_in_date: string;
    check_out_date: string;
    guests_count?: number;
    room_type_id?: number;
  }) =>
    ApiClient.get<{ available_count: number; rooms: Room[]; search_criteria: any }>(
      '/rooms/public-availability/',
      params
    ),

  getRoomTypes: () => ApiClient.get<{ results: RoomType[] }>('/rooms/types/'),

  createRoomType: (data: Partial<RoomTypeInput>) => ApiClient.post<RoomType>('/rooms/types/', data),

  updateRoomType: (id: number, data: Partial<RoomTypeInput>) =>
    ApiClient.patch<RoomType>(`/rooms/types/${id}/`, data),

  deleteRoomType: (id: number) => ApiClient.delete(`/rooms/types/${id}/`),

  getAmenities: () => ApiClient.get<{ results: Amenity[] }>('/rooms/amenities/'),

  createAmenity: (data: Partial<AmenityInput>) => ApiClient.post<Amenity>('/rooms/amenities/', data),

  updateAmenity: (id: number, data: Partial<AmenityInput>) =>
    ApiClient.patch<Amenity>(`/rooms/amenities/${id}/`, data),

  deleteAmenity: (id: number) => ApiClient.delete(`/rooms/amenities/${id}/`),
};
