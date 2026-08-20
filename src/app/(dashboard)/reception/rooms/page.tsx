"use client";

import { useState, useEffect } from "react";
import { roomAPI } from "@/lib/api/endpoints";
import {
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  SparklesIcon,
  UserIcon,
  HomeIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

interface Room {
  id: number;
  room_number: string;
  floor: number;
  room_type: number;
  room_type_details?: {
    id: number;
    name: string;
    code: string;
    base_price_per_night: number;
    max_occupancy: number;
  };
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'DIRTY_CLEANING';
  status_display?: string;
  effective_price_per_night: number;
  is_active: boolean;
  notes?: string;
  amenities_details?: Array<{
    id: number;
    name: string;
    code: string;
    icon: string;
  }>;
}

export default function ReceptionRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [floorFilter, setFloorFilter] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  useEffect(() => {
    fetchRooms();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchRooms, 30000);
    return () => clearInterval(interval);
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

  const getStatusConfig = (status: string) => {
    const config: Record<string, { color: string; icon: any; label: string; bgColor: string }> = {
      AVAILABLE: { 
        color: "text-green-600", 
        icon: CheckCircleIcon, 
        label: "Available",
        bgColor: "bg-green-50 border-green-200"
      },
      OCCUPIED: { 
        color: "text-blue-600", 
        icon: UserIcon, 
        label: "Occupied",
        bgColor: "bg-blue-50 border-blue-200"
      },
      MAINTENANCE: { 
        color: "text-red-600", 
        icon: WrenchScrewdriverIcon, 
        label: "Maintenance",
        bgColor: "bg-red-50 border-red-200"
      },
      DIRTY_CLEANING: { 
        color: "text-yellow-600", 
        icon: ArrowPathIcon, 
        label: "Dirty / Cleaning",
        bgColor: "bg-yellow-50 border-yellow-200"
      },
    };
    return config[status] || config.AVAILABLE;
  };

  const handleStatusChange = async (roomId: number, newStatus: string) => {
    setUpdatingStatus(roomId);
    try {
      await roomAPI.updateStatus(roomId, { 
        status: newStatus,
        notes: `Status changed to ${newStatus} by Receptionist`
      });
      toast.success(`Room status updated to ${newStatus}`);
      fetchRooms();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update room status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusOptions = (currentStatus: string) => {
    const allStatuses = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'DIRTY_CLEANING'];
    return allStatuses.filter(status => status !== currentStatus);
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = 
      room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.room_type_details?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || room.status === statusFilter;
    const matchesFloor = !floorFilter || room.floor === parseInt(floorFilter);
    return matchesSearch && matchesStatus && matchesFloor;
  });

  // Get unique floors for filter
  const floors = [...new Set(rooms.map(r => r.floor))].sort((a, b) => a - b);

  // Status counts
  const statusCounts = rooms.reduce((acc, room) => {
    acc[room.status] = (acc[room.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
          <h2 className="text-2xl font-bold text-gray-900">Room Status Board</h2>
          <p className="text-sm text-gray-500">View and manage all room statuses</p>
        </div>
        <button onClick={fetchRooms} className="btn-secondary flex items-center gap-2">
          <ArrowPathIcon className="h-5 w-5" />
          Refresh
        </button>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="dashboard-card bg-green-50 border border-green-200">
          <p className="text-sm text-gray-600">Available</p>
          <p className="text-2xl font-bold text-green-600">{statusCounts.AVAILABLE || 0}</p>
        </div>
        <div className="dashboard-card bg-blue-50 border border-blue-200">
          <p className="text-sm text-gray-600">Occupied</p>
          <p className="text-2xl font-bold text-blue-600">{statusCounts.OCCUPIED || 0}</p>
        </div>
        <div className="dashboard-card bg-yellow-50 border border-yellow-200">
          <p className="text-sm text-gray-600">Dirty / Cleaning</p>
          <p className="text-2xl font-bold text-yellow-600">{statusCounts.DIRTY_CLEANING || 0}</p>
        </div>
        <div className="dashboard-card bg-red-50 border border-red-200">
          <p className="text-sm text-gray-600">Maintenance</p>
          <p className="text-2xl font-bold text-red-600">{statusCounts.MAINTENANCE || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by room number or type..."
            className="input-field"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field max-w-[180px]"
        >
          <option value="">All Status</option>
          <option value="AVAILABLE">Available</option>
          <option value="OCCUPIED">Occupied</option>
          <option value="DIRTY_CLEANING">Dirty / Cleaning</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>
        <select
          value={floorFilter}
          onChange={(e) => setFloorFilter(e.target.value)}
          className="input-field max-w-[150px]"
        >
          <option value="">All Floors</option>
          {floors.map((floor) => (
            <option key={floor} value={floor}>Floor {floor}</option>
          ))}
        </select>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRooms.map((room) => {
          const statusConfig = getStatusConfig(room.status);
          const StatusIcon = statusConfig.icon;
          const availableStatuses = getStatusOptions(room.status);

          return (
            <div 
              key={room.id} 
              className={`dashboard-card border-l-4 ${
                room.status === 'AVAILABLE' ? 'border-l-green-500' :
                room.status === 'OCCUPIED' ? 'border-l-blue-500' :
                room.status === 'DIRTY_CLEANING' ? 'border-l-yellow-500' :
                'border-l-red-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-900">Room {room.room_number}</h3>
                    <span className="text-xs text-gray-400">Floor {room.floor}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {room.room_type_details?.name || "Unknown Type"}
                  </p>
                  <p className="text-sm font-medium text-blue-600 mt-1">
                    ${room.effective_price_per_night}
                    <span className="text-xs font-normal text-gray-500">/night</span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig.label}
                  </span>
                </div>
              </div>

              {/* Amenities */}
              {room.amenities_details && room.amenities_details.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex flex-wrap gap-1">
                    {room.amenities_details.slice(0, 4).map((amenity) => (
                      <span
                        key={amenity.id}
                        className="text-xs bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1"
                      >
                        <i className={`fas ${amenity.icon || 'fa-star'} text-gray-500`}></i>
                        {amenity.name}
                      </span>
                    ))}
                    {room.amenities_details.length > 4 && (
                      <span className="text-xs text-gray-400">
                        +{room.amenities_details.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Status Change */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="text-xs font-medium text-gray-500">Change Status</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {availableStatuses.map((status) => {
                    const statusOption = getStatusConfig(status);
                    const OptionIcon = statusOption.icon;
                    return (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(room.id, status)}
                        disabled={updatingStatus === room.id}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                          statusOption.bgColor
                        } ${statusOption.color} hover:opacity-80 disabled:opacity-50`}
                      >
                        {updatingStatus === room.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                        ) : (
                          <OptionIcon className="h-3 w-3" />
                        )}
                        {statusOption.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {room.notes && (
                <p className="mt-2 text-xs text-gray-400 truncate">{room.notes}</p>
              )}
            </div>
          );
        })}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No rooms found matching your filters</p>
        </div>
      )}
    </div>
  );
}
