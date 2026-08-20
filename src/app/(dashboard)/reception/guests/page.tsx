"use client";

import { useState, useEffect } from "react";
import { guestAPI } from "@/lib/api/endpoints";
import {
  UsersIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

interface Guest {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  email?: string;
  identification_type: string;
  identification_number?: string;
  address?: string;
  created_at: string;
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    identification_type: "NATIONAL_ID",
    identification_number: "",
    address: "",
  });

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const response = await guestAPI.getGuests();
      setGuests(response.data.results || []);
    } catch (error) {
      toast.error("Failed to load guests");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.length < 2) {
      fetchGuests();
      return;
    }
    setLoading(true);
    try {
      const response = await guestAPI.getGuests({ search: searchTerm });
      setGuests(response.data.results || []);
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      phone_number: "",
      email: "",
      identification_type: "NATIONAL_ID",
      identification_number: "",
      address: "",
    });
    setEditingGuest(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData({
      first_name: guest.first_name,
      last_name: guest.last_name || "",
      phone_number: guest.phone_number,
      email: guest.email || "",
      identification_type: guest.identification_type,
      identification_number: guest.identification_number || "",
      address: guest.address || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingGuest) {
        await guestAPI.updateGuest(editingGuest.id, formData);
        toast.success("Guest updated successfully!");
      } else {
        await guestAPI.createGuest(formData);
        toast.success("Guest created successfully!");
      }
      setShowModal(false);
      resetForm();
      fetchGuests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save guest");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this guest?")) return;
    try {
      await guestAPI.deleteGuest(id);
      toast.success("Guest deleted successfully");
      fetchGuests();
    } catch (error) {
      toast.error("Failed to delete guest");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading guests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Guest Management</h2>
          <p className="text-sm text-gray-500">View, search, and manage all guests</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Add Guest
        </button>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by name, phone, or email..."
            className="input-field"
          />
          <button onClick={handleSearch} className="btn-secondary flex items-center gap-2">
            <MagnifyingGlassIcon className="h-5 w-5" />
            Search
          </button>
        </div>
        <button onClick={fetchGuests} className="btn-secondary">
          Refresh
        </button>
      </div>

      <div className="dashboard-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 font-medium text-gray-500">Name</th>
                <th className="text-left py-3 font-medium text-gray-500">Phone</th>
                <th className="text-left py-3 font-medium text-gray-500">Email</th>
                <th className="text-left py-3 font-medium text-gray-500">ID Type</th>
                <th className="text-right py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => (
                <tr key={guest.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 font-medium">{guest.full_name}</td>
                  <td className="py-3">{guest.phone_number}</td>
                  <td className="py-3">{guest.email || "-"}</td>
                  <td className="py-3">{guest.identification_type}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => openEditModal(guest)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(guest.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors ml-1"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {guests.length === 0 && (
          <div className="text-center py-8">
            <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No guests found</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{editingGuest ? "Edit Guest" : "Add Guest"}</h3>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
                  <select
                    value={formData.identification_type}
                    onChange={(e) => setFormData({ ...formData, identification_type: e.target.value })}
                    className="input-field"
                  >
                    <option value="NATIONAL_ID">National ID</option>
                    <option value="PASSPORT">Passport</option>
                    <option value="DRIVERS_LICENSE">Driver's License</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                  <input
                    type="text"
                    value={formData.identification_number}
                    onChange={(e) => setFormData({ ...formData, identification_number: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
                  {isSubmitting ? "Saving..." : (editingGuest ? "Update" : "Create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
