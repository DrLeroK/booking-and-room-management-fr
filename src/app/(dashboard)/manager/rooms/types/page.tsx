"use client";

import { useState, useEffect, useRef } from "react";
import { roomAPI } from "@/lib/api/endpoints";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import {
  BuildingOfficeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

interface RoomType {
  id: number;
  name: string;
  code: string;
  description: string;
  base_price_per_night: number;
  max_occupancy: number;
  image?: string;
  image_url?: string;
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

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
    const currentImg = getImageUrl(type.image_url || type.image);
    setImagePreview(currentImg || null);
    setImageFile(null);
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image file size must be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (imageFile) {
        // Multipart Form-Data submission
        const data = new FormData();
        data.append("name", formData.name);
        data.append("code", formData.code.toUpperCase());
        data.append("description", formData.description);
        data.append("base_price_per_night", formData.base_price_per_night);
        data.append("max_occupancy", formData.max_occupancy.toString());
        data.append("is_active", formData.is_active ? "true" : "false");
        data.append("image", imageFile);

        if (editingType) {
          await roomAPI.updateRoomType(editingType.id, data);
          toast.success("Room type updated successfully!");
        } else {
          await roomAPI.createRoomType(data);
          toast.success("Room type created successfully!");
        }
      } else {
        // Standard JSON payload
        const payload: any = {
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
      toast.success(`Room type ${!currentStatus ? "activated" : "deactivated"}`);
      fetchRoomTypes();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading room types...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Room Types &amp; Suites</h2>
          <p className="text-sm text-gray-500">Manage room categories, photography, ETB rates, and occupancy limits</p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold border-none shadow-md"
        >
          <PlusIcon className="h-5 w-5" />
          Add Room Type
        </button>
      </div>

      {/* Room Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roomTypes.map((type) => {
          const imgSrc =
            getImageUrl(type.image_url || type.image) ||
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80";

          return (
            <div key={type.id} className="dashboard-card hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden border border-slate-200">
              <div>
                {/* Room Type Image Banner */}
                <div className="relative h-48 w-full bg-slate-900 overflow-hidden rounded-lg mb-4">
                  <img
                    src={imgSrc}
                    alt={type.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <span className={`badge ${type.is_active ? "badge-success" : "badge-danger"}`}>
                      {type.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-mono font-bold text-amber-300">
                    {type.code}
                  </div>
                </div>

                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{type.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{type.description || "No description provided."}</p>

                    <div className="mt-3 flex items-baseline justify-between">
                      <p className="text-lg font-extrabold text-amber-600">
                        {formatCurrency(type.base_price_per_night)}
                        <span className="text-xs font-normal text-gray-500"> / night</span>
                      </p>
                      <p className="text-xs font-medium text-gray-500 bg-slate-100 px-2.5 py-1 rounded-full">
                        Max: {type.max_occupancy} {type.max_occupancy === 1 ? "guest" : "guests"}
                      </p>
                    </div>

                    {type.active_rooms_count !== undefined && (
                      <p className="text-xs text-gray-500 mt-2">
                        Inventory: <span className="font-semibold text-gray-700">{type.active_rooms_count} rooms</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  onClick={() => handleToggleActive(type.id, type.is_active)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    type.is_active
                      ? "text-yellow-600 hover:bg-yellow-50"
                      : "text-emerald-600 hover:bg-emerald-50"
                  }`}
                  title={type.is_active ? "Deactivate" : "Activate"}
                >
                  {type.is_active ? <XCircleIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => openEditModal(type)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Room Type"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(type.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Room Type"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {roomTypes.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
          <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No room types found. Create your first one!</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-5">
              <h3 className="text-xl font-bold text-gray-900">
                {editingType ? "Edit Room Type & Photo" : "Add New Room Type"}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Picture Upload / Preview Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Room Type Picture (Public &amp; Booking Showcase)
                </label>
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden h-44 bg-slate-900 border border-slate-200 group">
                    <img
                      src={imagePreview}
                      alt="Room preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-white/90 text-slate-900 text-xs font-semibold hover:bg-white"
                      >
                        Change Photo
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 hover:border-amber-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-amber-50/30"
                  >
                    <ArrowUpTrayIcon className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">Click to upload room photograph</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, or WEBP up to 5MB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

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
                  placeholder="e.g., Executive King Suite"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="input-field uppercase font-mono"
                  placeholder="e.g., EXEC_KNG"
                />
                <p className="text-xs text-gray-500 mt-1">Short code used for operational identification</p>
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
                  placeholder="Describe amenities, bed type, view, and features..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Rate / Night (ETB) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.base_price_per_night}
                    onChange={(e) => setFormData({ ...formData, base_price_per_night: e.target.value })}
                    className="input-field"
                    placeholder="e.g., 4500.00"
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

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-amber-600 rounded"
                />
                <span className="text-sm text-gray-700 font-medium">Active (visible on public booking engine)</span>
              </label>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex-1 disabled:opacity-50 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold border-none"
                >
                  {isSubmitting ? "Saving..." : editingType ? "Update Room Type" : "Create Room Type"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
