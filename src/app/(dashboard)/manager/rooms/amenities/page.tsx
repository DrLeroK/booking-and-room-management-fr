"use client";

import { useState, useEffect } from "react";
import { roomAPI } from "@/lib/api/endpoints";
import {
  SparklesIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

interface Amenity {
  id: number;
  name: string;
  code: string;
  icon: string;
  description: string;
}

export default function AmenitiesPage() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    icon: "fa-star",
    description: "",
  });

  // Common icon options for amenities
  const iconOptions = [
    { value: "fa-wifi", label: "Wi-Fi" },
    { value: "fa-snowflake", label: "Air Conditioning" },
    { value: "fa-tv", label: "TV" },
    { value: "fa-wine-bottle", label: "Mini Bar" },
    { value: "fa-bath", label: "Bathtub" },
    { value: "fa-umbrella-beach", label: "Balcony" },
    { value: "fa-water", label: "Sea View" },
    { value: "fa-concierge-bell", label: "Room Service" },
    { value: "fa-star", label: "Star" },
    { value: "fa-heart", label: "Heart" },
    { value: "fa-fire", label: "Fire" },
    { value: "fa-mug-saucer", label: "Coffee" },
    { value: "fa-utensils", label: "Dining" },
    { value: "fa-dumbbell", label: "Gym" },
    { value: "fa-spa", label: "Spa" },
    { value: "fa-swimmer", label: "Pool" },
  ];

  useEffect(() => {
    fetchAmenities();
  }, []);

  const fetchAmenities = async () => {
    setLoading(true);
    try {
      const response = await roomAPI.getAmenities();
      setAmenities(response.data.results || []);
    } catch (error) {
      console.error("Failed to fetch amenities:", error);
      toast.error("Failed to load amenities");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      icon: "fa-star",
      description: "",
    });
    setEditingAmenity(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (amenity: Amenity) => {
    setEditingAmenity(amenity);
    setFormData({
      name: amenity.name,
      code: amenity.code,
      icon: amenity.icon || "fa-star",
      description: amenity.description || "",
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
        icon: formData.icon,
        description: formData.description,
      };

      if (editingAmenity) {
        await roomAPI.updateAmenity(editingAmenity.id, payload);
        toast.success("Amenity updated successfully!");
      } else {
        await roomAPI.createAmenity(payload);
        toast.success("Amenity created successfully!");
      }

      setShowModal(false);
      resetForm();
      fetchAmenities();
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to save amenity";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this amenity?")) return;
    try {
      await roomAPI.deleteAmenity(id);
      toast.success("Amenity deleted successfully");
      fetchAmenities();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete amenity");
    }
  };

  const getIconDisplay = (iconClass: string) => {
    const found = iconOptions.find(opt => opt.value === iconClass);
    return found ? found.label : iconClass.replace('fa-', '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading amenities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Amenities</h2>
          <p className="text-sm text-gray-500">Manage room features and facilities</p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Add Amenity
        </button>
      </div>

      {/* Amenities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {amenities.map((amenity) => (
          <div key={amenity.id} className="dashboard-card hover:shadow-lg transition-shadow text-center">
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-3">
                <i className={`fas ${amenity.icon || 'fa-star'}`}></i>
              </div>
              <h3 className="font-semibold text-gray-900">{amenity.name}</h3>
              <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded mt-1">
                {amenity.code}
              </span>
              {amenity.description && (
                <p className="text-sm text-gray-500 mt-2">{amenity.description}</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center gap-2">
              <button
                onClick={() => openEditModal(amenity)}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Edit"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDelete(amenity.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Delete"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {amenities.length === 0 && (
        <div className="text-center py-12">
          <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No amenities found. Add your first one!</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">
                {editingAmenity ? "Edit Amenity" : "Add New Amenity"}
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
                  Amenity Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Free Wi-Fi"
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
                  placeholder="e.g., WIFI"
                />
                <p className="text-xs text-gray-500 mt-1">Short code (will be auto-uppercase)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon *
                </label>
                <select
                  required
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="input-field"
                >
                  {iconOptions.map((icon) => (
                    <option key={icon.value} value={icon.value}>
                      {icon.label} ({icon.value})
                    </option>
                  ))}
                </select>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg text-center">
                  <span className="text-sm text-gray-600 mr-2">Preview:</span>
                  <i className={`fas ${formData.icon} text-2xl`}></i>
                  <span className="ml-3 text-sm text-gray-600">
                    {iconOptions.find(i => i.value === formData.icon)?.label || formData.icon}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  placeholder="Brief description of the amenity..."
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
                  {isSubmitting ? "Saving..." : (editingAmenity ? "Update" : "Create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
