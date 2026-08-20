"use client";

import { useState, useEffect } from "react";
import { roomAPI } from "@/lib/api/endpoints";
import {
  BuildingOfficeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

interface RoomType {
  id: number;
  name: string;
  code: string;
  description: string;
  base_price_per_night: number;
  max_occupancy: number;
  is_active: boolean;
  active_rooms_count?: number;
}

export default function RoomTypesPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<RoomType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    base_price_per_night: "",
    max_occupancy: 2,
    is_active: true,
  });

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    setLoading(true);
    try {
      const response = await roomAPI.getRoomTypes();
      setRoomTypes(response.data.results || []);
    } catch (error) {
      console.error("Failed to fetch room types:", error);
      toast.error("Failed to load room types");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      base_price_per_night: "",
      max_occupancy: 2,
      is_active: true,
    });
    setEditingType(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (type: RoomType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      code: type.code,
      description: type.description || "",
      base_price_per_night: type.base_price_per_night.toString(),
      max_occupancy: type.max_occupancy,
      is_active: type.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        code: formData.code.toUpperCase(),
        description: formData.description,
        base_price_per_night: parseFloat(formData.base_price_per_night),
        max_occupancy: formData.max_occupancy,
        is_active: formData.is_active,
      };

      if (editingType) {
        await roomAPI.updateRoomType(editingType.id, payload);
        toast.success("Room type updated successfully!");
      } else {
        await roomAPI.createRoomType(payload);
        toast.success("Room type created successfully!");
      }

      setShowModal(false);
      resetForm();
      fetchRoomTypes();
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to save room type";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this room type? This will affect all rooms of this type.")) return;
    try {
      await roomAPI.deleteRoomType(id);
      toast.success("Room type deleted successfully");
      fetchRoomTypes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete room type");
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      await roomAPI.updateRoomType(id, { is_active: !currentStatus });
      toast.success(`Room type ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchRoomTypes();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading room types...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Room Types</h2>
          <p className="text-sm text-gray-500">Manage room categories, pricing, and occupancy limits</p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Add Room Type
        </button>
      </div>

      {/* Room Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roomTypes.map((type) => (
          <div key={type.id} className="dashboard-card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900">{type.name}</h3>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                    {type.code}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{type.description || "No description"}</p>
                <div className="mt-3 flex items-center gap-4">
                  <p className="text-xl font-bold text-blue-600">
                    ${type.base_price_per_night}
                    <span className="text-sm font-normal text-gray-500">/night</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Max: {type.max_occupancy} guests
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <span className={`badge ${type.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {type.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {type.active_rooms_count !== undefined && (
                    <span className="text-xs text-gray-500">
                      {type.active_rooms_count} rooms
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => handleToggleActive(type.id, type.is_active)}
                className={`p-1 rounded transition-colors ${
                  type.is_active 
                    ? 'text-yellow-600 hover:bg-yellow-50' 
                    : 'text-green-600 hover:bg-green-50'
                }`}
                title={type.is_active ? 'Deactivate' : 'Activate'}
              >
                {type.is_active ? <XCircleIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}
              </button>
              <button
                onClick={() => openEditModal(type)}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Edit"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDelete(type.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Delete"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {roomTypes.length === 0 && (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No room types found. Create your first one!</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">
                {editingType ? "Edit Room Type" : "Add New Room Type"}
              </h3>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Deluxe Suite"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="input-field"
                  placeholder="e.g., DLX"
                />
                <p className="text-xs text-gray-500 mt-1">Short code for identification (will be auto-uppercase)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field resize-none"
                  rows={2}
                  placeholder="Brief description of this room type..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Price / Night *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.base_price_per_night}
                    onChange={(e) => setFormData({ ...formData, base_price_per_night: e.target.value })}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Occupancy *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="10"
                    value={formData.max_occupancy}
                    onChange={(e) => setFormData({ ...formData, max_occupancy: parseInt(e.target.value) || 1 })}
                    className="input-field"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Active (available for booking)</span>
              </label>

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
                  {isSubmitting ? "Saving..." : (editingType ? "Update" : "Create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
