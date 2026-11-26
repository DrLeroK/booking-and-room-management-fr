"use client";

import { useState, useEffect } from "react";
import { roomAPI } from "@/lib/api/endpoints";
import {
  BuildingOfficeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  XMarkIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

interface RoomType {
  id: number;
  name: string;
  code: string;
  base_price_per_night: number;
  max_occupancy: number;
}

interface Amenity {
  id: number;
  name: string;
  code: string;
  icon: string;
}

interface Room {
  id: number;
  room_number: string;
  floor: number;
  room_type: number;
  room_type_details?: RoomType;
  amenities?: number[];
  amenities_details?: Amenity[];
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'DIRTY_CLEANING';
  effective_price_per_night: number;
  is_active: boolean;
  notes?: string;
}

export default function RoomsManagementPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [allAmenities, setAllAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    room_number: "",
    floor: 1,
    room_type: "",
    price_per_night_override: "",
    amenities: [] as number[],
    notes: "",
  });

  useEffect(() => {
    fetchRooms();
    fetchRoomTypes();
    fetchAmenities();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await roomAPI.getRooms();
      setRooms(response.data.results || []);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      toast.error("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomTypes = async () => {
    try {
      const response = await roomAPI.getRoomTypes();
      setRoomTypes(response.data.results || []);
    } catch (error) {
      console.error("Failed to fetch room types:", error);
    }
  };

  const fetchAmenities = async () => {
    try {
      const response = await roomAPI.getAmenities();
      setAllAmenities(response.data.results || []);
    } catch (error) {
      console.error("Failed to fetch amenities:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: any; label: string }> = {
      AVAILABLE: { color: "bg-green-100 text-green-800", icon: CheckCircleIcon, label: "Available" },
      OCCUPIED: { color: "bg-blue-100 text-blue-800", icon: BuildingOfficeIcon, label: "Occupied" },
      MAINTENANCE: { color: "bg-red-100 text-red-800", icon: ExclamationTriangleIcon, label: "Maintenance" },
      DIRTY_CLEANING: { color: "bg-yellow-100 text-yellow-800", icon: ArrowPathIcon, label: "Cleaning" },
    };
    return config[status] || config.AVAILABLE;
  };

  const resetForm = () => {
    setFormData({
      room_number: "",
      floor: 1,
      room_type: "",
      price_per_night_override: "",
      amenities: [],
      notes: "",
    });
    setEditingRoom(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      room_number: room.room_number,
      floor: room.floor,
      room_type: room.room_type.toString(),
      price_per_night_override: room.effective_price_per_night?.toString() || "",
      amenities: room.amenities || [],
      notes: room.notes || "",
    });
    setShowModal(true);
  };

  const toggleAmenity = (amenityId: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        room_number: formData.room_number,
        floor: parseInt(formData.floor.toString()),
        room_type: parseInt(formData.room_type),
        price_per_night_override: formData.price_per_night_override ? parseFloat(formData.price_per_night_override) : null,
        amenities: formData.amenities,
        notes: formData.notes,
        is_active: true,
      };

      if (editingRoom) {
        await roomAPI.updateRoom(editingRoom.id, payload);
        toast.success("Room updated successfully!");
      } else {
        await roomAPI.createRoom(payload);
        toast.success("Room created successfully!");
      }

      setShowModal(false);
      resetForm();
      fetchRooms();
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to save room";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoom = async (roomId: number) => {
    if (!confirm("Are you sure you want to delete this room? This action cannot be undone.")) return;
    try {
      await roomAPI.deleteRoom(roomId);
      toast.success("Room deleted successfully");
      fetchRooms();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete room");
    }
  };

  const handleStatusChange = async (roomId: number, newStatus: string) => {
    try {
      await roomAPI.updateStatus(roomId, { status: newStatus });
      toast.success(`Room status updated to ${newStatus}`);
      fetchRooms();
    } catch (error) {
      toast.error("Failed to update room status");
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = 
      room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.room_type_details?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || room.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rooms Management</h2>
          <p className="text-sm text-gray-500">Manage all rooms, status, and pricing</p>
        </div>
        <div className="flex gap-2">
          <a href="/manager/rooms/types" className="btn-secondary flex items-center gap-2">
            <BuildingOfficeIcon className="h-5 w-5" />
            Room Types
          </a>
          <a href="/manager/rooms/amenities" className="btn-secondary flex items-center gap-2">
            <SparklesIcon className="h-5 w-5" />
            Amenities
          </a>
          <button
            onClick={openCreateModal}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add Room
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by room number or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field max-w-[200px]"
        >
          <option value="">All Status</option>
          <option value="AVAILABLE">Available</option>
          <option value="OCCUPIED">Occupied</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="DIRTY_CLEANING">Cleaning</option>
        </select>
        <button onClick={fetchRooms} className="btn-secondary flex items-center gap-2">
          <ArrowPathIcon className="h-5 w-5" />
          Refresh
        </button>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRooms.map((room) => {
          const statusConfig = getStatusBadge(room.status);
          const StatusIcon = statusConfig.icon;
          
          return (
            <div key={room.id} className="dashboard-card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Room {room.room_number}</h3>
                  <p className="text-sm text-gray-500">Floor {room.floor}</p>
                  <p className="text-sm font-medium text-gray-700 mt-1">
                    {room.room_type_details?.name || "Unknown Type"}
                  </p>
                  <p className="text-lg font-bold text-blue-600 mt-2">
                    ${room.effective_price_per_night}
                    <span className="text-sm font-normal text-gray-500">/night</span>
                  </p>
                  {room.amenities_details && room.amenities_details.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {room.amenities_details.map((amenity) => (
                        <span key={amenity.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          <i className={`fas ${amenity.icon || 'fa-star'} mr-1`}></i>
                          {amenity.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`badge ${statusConfig.color} flex items-center gap-1`}>
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig.label}
                  </span>
                  <div className="flex gap-1 mt-2">
                    <button
                      onClick={() => openEditModal(room)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit Room"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete Room"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Quick Status Change */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <select
                  value={room.status}
                  onChange={(e) => handleStatusChange(room.id, e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="AVAILABLE">Set Available</option>
                  <option value="OCCUPIED">Set Occupied</option>
                  <option value="MAINTENANCE">Set Maintenance</option>
                  <option value="DIRTY_CLEANING">Set Cleaning</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No rooms found</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">
                {editingRoom ? "Edit Room" : "Add New Room"}
              </h3>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.room_number}
                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                    className="input-field"
                    placeholder="e.g., 101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Floor *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={20}
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 1 })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type *
                </label>
                <select
                  required
                  value={formData.room_type}
                  onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select Room Type</option>
                  {roomTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} (${type.base_price_per_night}/night)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Override (optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_per_night_override}
                  onChange={(e) => setFormData({ ...formData, price_per_night_override: e.target.value })}
                  className="input-field"
                  placeholder="Leave empty to use room type price"
                />
              </div>

              {/* Amenities Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities
                </label>
                <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg">
                  {allAmenities.map((amenity) => (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors flex items-center gap-1 ${
                        formData.amenities.includes(amenity.id)
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <i className={`fas ${amenity.icon || 'fa-star'} text-xs`}></i>
                      {amenity.name}
                    </button>
                  ))}
                  {allAmenities.length === 0 && (
                    <p className="text-sm text-gray-500">No amenities available. Create some first!</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Any special notes about this room..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : (editingRoom ? "Update Room" : "Create Room")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
