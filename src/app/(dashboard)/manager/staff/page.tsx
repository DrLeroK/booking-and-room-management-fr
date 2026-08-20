"use client";

import { useState, useEffect } from "react";
import { userAPI } from "@/lib/api/endpoints";
import {
  UsersIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  UserIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

interface Staff {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'ADMIN' | 'OWNER' | 'MANAGER' | 'RECEPTIONIST';
  role_display?: string;
  phone_number?: string;
  employee_id?: string;
  is_active: boolean;
  date_joined: string;
  last_login?: string;
}

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Staff | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    role: "RECEPTIONIST",
    phone_number: "",
    employee_id: "",
    password: "",
    password_confirm: "",
  });

  const roleOptions = [
    { value: "ADMIN", label: "System Admin" },
    { value: "OWNER", label: "Hotel Owner" },
    { value: "MANAGER", label: "Hotel Manager" },
    { value: "RECEPTIONIST", label: "Receptionist" },
  ];

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getUsers();
      setStaff(response.data.results || []);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      toast.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const config: Record<string, { color: string; icon: any }> = {
      ADMIN: { color: "bg-purple-100 text-purple-800", icon: ShieldCheckIcon },
      OWNER: { color: "bg-amber-100 text-amber-800", icon: ShieldCheckIcon },
      MANAGER: { color: "bg-blue-100 text-blue-800", icon: ShieldExclamationIcon },
      RECEPTIONIST: { color: "bg-green-100 text-green-800", icon: UserIcon },
    };
    return config[role] || config.RECEPTIONIST;
  };

  const getRoleDisplay = (role: string) => {
    const map: Record<string, string> = {
      ADMIN: "System Admin",
      OWNER: "Hotel Owner",
      MANAGER: "Hotel Manager",
      RECEPTIONIST: "Receptionist",
    };
    return map[role] || role;
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      role: "RECEPTIONIST",
      phone_number: "",
      employee_id: "",
      password: "",
      password_confirm: "",
    });
    setEditingUser(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (user: Staff) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email || "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      role: user.role,
      phone_number: user.phone_number || "",
      employee_id: user.employee_id || "",
      password: "",
      password_confirm: "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation
      if (!editingUser && formData.password !== formData.password_confirm) {
        toast.error("Passwords do not match");
        setIsSubmitting(false);
        return;
      }

      if (!editingUser && formData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        setIsSubmitting(false);
        return;
      }

      const payload: any = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        phone_number: formData.phone_number,
        employee_id: formData.employee_id,
      };

      if (!editingUser) {
        payload.password = formData.password;
        payload.password_confirm = formData.password_confirm;
      }

      if (editingUser) {
        await userAPI.updateUser(editingUser.id, payload);
        toast.success("Staff updated successfully!");
      } else {
        await userAPI.createUser(payload);
        toast.success("Staff created successfully!");
      }

      setShowModal(false);
      resetForm();
      fetchStaff();
    } catch (error: any) {
      const message = error.response?.data?.errors || error.response?.data?.message || "Failed to save staff";
      if (typeof message === 'object') {
        const errors = Object.values(message).flat().join(', ');
        toast.error(errors);
      } else {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (userId: number, currentStatus: boolean) => {
    try {
      await userAPI.toggleActive(userId);
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchStaff();
    } catch (error) {
      toast.error("Failed to toggle user status");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await userAPI.deleteUser(userId);
      toast.success("User deleted successfully");
      fetchStaff();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
          <p className="text-sm text-gray-500">Manage all hotel staff and their roles</p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Add Staff
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="dashboard-card">
          <p className="text-sm text-gray-500">Total Staff</p>
          <p className="text-2xl font-bold">{staff.length}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {staff.filter(s => s.is_active).length}
          </p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-gray-500">Managers</p>
          <p className="text-2xl font-bold text-blue-600">
            {staff.filter(s => s.role === 'MANAGER').length}
          </p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-gray-500">Receptionists</p>
          <p className="text-2xl font-bold text-green-600">
            {staff.filter(s => s.role === 'RECEPTIONIST').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by name, email, or employee ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="input-field max-w-[200px]"
        >
          <option value="">All Roles</option>
          {roleOptions.map((role) => (
            <option key={role.value} value={role.value}>{role.label}</option>
          ))}
        </select>
        <button onClick={fetchStaff} className="btn-secondary flex items-center gap-2">
          <UserGroupIcon className="h-5 w-5" />
          Refresh
        </button>
      </div>

      {/* Staff Table */}
      <div className="dashboard-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 font-medium text-gray-500">Staff</th>
                <th className="text-left py-3 font-medium text-gray-500">Role</th>
                <th className="text-left py-3 font-medium text-gray-500">Contact</th>
                <th className="text-left py-3 font-medium text-gray-500">Status</th>
                <th className="text-right py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((member) => {
                const roleConfig = getRoleBadge(member.role);
                const RoleIcon = roleConfig.icon;
                
                return (
                  <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-gray-900">{member.full_name || member.username}</p>
                        <p className="text-xs text-gray-500">@{member.username}</p>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`badge ${roleConfig.color} flex items-center gap-1`}>
                        <RoleIcon className="h-3 w-3" />
                        {getRoleDisplay(member.role)}
                      </span>
                    </td>
                    <td className="py-3">
                      <p className="text-gray-600">{member.email}</p>
                      {member.phone_number && (
                        <p className="text-xs text-gray-500">{member.phone_number}</p>
                      )}
                      {member.employee_id && (
                        <p className="text-xs text-gray-400">ID: {member.employee_id}</p>
                      )}
                    </td>
                    <td className="py-3">
                      <span className={`badge ${member.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(member.id, member.is_active)}
                          className={`p-1 rounded transition-colors ${
                            member.is_active 
                              ? 'text-yellow-600 hover:bg-yellow-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={member.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {member.is_active ? <XCircleIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}
                        </button>
                        <button
                          onClick={() => openEditModal(member)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(member.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredStaff.length === 0 && (
          <div className="text-center py-8">
            <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No staff members found</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">
                {editingUser ? "Edit Staff Member" : "Add New Staff"}
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
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="input-field"
                  placeholder="e.g., johndoe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="e.g., john@hotel.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="input-field"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="input-field"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input-field"
                >
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="input-field"
                    placeholder="+251 911 000 000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    className="input-field"
                    placeholder="EMP-2026-001"
                  />
                </div>
              </div>

              {!editingUser && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input-field"
                      placeholder="Min 6 characters"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password_confirm}
                      onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                      className="input-field"
                      placeholder="Confirm password"
                    />
                  </div>
                </div>
              )}

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
                  {isSubmitting ? "Saving..." : (editingUser ? "Update Staff" : "Create Staff")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
