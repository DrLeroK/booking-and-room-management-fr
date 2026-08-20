"use client";

import { useState, useEffect } from "react";
import { inquiryAPI } from "@/lib/api/endpoints";
import {
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon as EmailIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'NEW' | 'READ' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  status_display: string;
  is_resolved: boolean;
  response_notes: string;
  assigned_to: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: number;
  new: number;
  read: number;
  in_progress: number;
  resolved: number;
  closed: number;
  pending: number;
}

const statusOptions = [
  { value: 'NEW', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { value: 'READ', label: 'Read', color: 'bg-gray-100 text-gray-800' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'RESOLVED', label: 'Resolved', color: 'bg-green-100 text-green-800' },
  { value: 'CLOSED', label: 'Closed', color: 'bg-gray-100 text-gray-600' },
];

const statusIcons = {
  NEW: ClockIcon,
  READ: EyeIcon,
  IN_PROGRESS: PencilIcon,
  RESOLVED: CheckCircleIcon,
  CLOSED: XCircleIcon,
};

export default function InquiryManagementPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyNotes, setReplyNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInquiries();
    fetchStats();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const response = await inquiryAPI.getInquiries();
      // Check if response.data is an array or has results property
      let data = response.data;
      if (data && typeof data === 'object' && 'results' in data) {
        setInquiries(data.results || []);
      } else if (Array.isArray(data)) {
        setInquiries(data);
      } else {
        setInquiries([]);
      }
    } catch (error: any) {
      console.error("Failed to fetch inquiries:", error);
      toast.error(error.response?.data?.message || "Failed to load inquiries");
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await inquiryAPI.getInquiryStats();
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleStatusUpdate = async (id: number, status: string, notes: string = "") => {
    setIsSubmitting(true);
    try {
      await inquiryAPI.updateInquiry(id, {
        status: status,
        response_notes: notes,
      });
      toast.success(`Inquiry status updated to ${status}`);
      fetchInquiries();
      fetchStats();
      setShowDetailModal(false);
      setShowReplyModal(false);
      setSelectedInquiry(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update inquiry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(s => s.value === status);
    return option?.color || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    const Icon = statusIcons[status as keyof typeof statusIcons] || ClockIcon;
    return Icon;
  };

  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch =
      inquiry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || inquiry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inquiry Management</h2>
          <p className="text-sm text-gray-500">Manage customer inquiries and messages</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="dashboard-card text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="dashboard-card text-center">
            <p className="text-2xl font-bold text-blue-500">{stats.new}</p>
            <p className="text-xs text-gray-500">New</p>
          </div>
          <div className="dashboard-card text-center">
            <p className="text-2xl font-bold text-gray-500">{stats.read}</p>
            <p className="text-xs text-gray-500">Read</p>
          </div>
          <div className="dashboard-card text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.in_progress}</p>
            <p className="text-xs text-gray-500">In Progress</p>
          </div>
          <div className="dashboard-card text-center">
            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            <p className="text-xs text-gray-500">Resolved</p>
          </div>
          <div className="dashboard-card text-center">
            <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
            <p className="text-xs text-gray-500">Closed</p>
          </div>
          <div className="dashboard-card text-center bg-yellow-50 border border-yellow-200">
            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, subject..."
            className="input-field"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field max-w-[180px]"
        >
          <option value="">All Status</option>
          {statusOptions.map((status) => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
        <button onClick={fetchInquiries} className="btn-secondary">
          Refresh
        </button>
      </div>

      {/* Inquiries Table */}
      <div className="dashboard-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 font-medium text-gray-500">Guest</th>
                <th className="text-left py-3 font-medium text-gray-500">Subject</th>
                <th className="text-left py-3 font-medium text-gray-500">Status</th>
                <th className="text-left py-3 font-medium text-gray-500">Date</th>
                <th className="text-center py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInquiries.length > 0 ? (
                filteredInquiries.map((inquiry) => {
                  const StatusIcon = getStatusIcon(inquiry.status);
                  return (
                    <tr key={inquiry.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3">
                        <div>
                          <p className="font-medium text-gray-900">{inquiry.name || "N/A"}</p>
                          <p className="text-xs text-gray-500">{inquiry.email || "N/A"}</p>
                          {inquiry.phone && (
                            <p className="text-xs text-gray-400">{inquiry.phone}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        <p className="font-medium">{inquiry.subject || "No Subject"}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">{inquiry.message || ""}</p>
                      </td>
                      <td className="py-3">
                        <span className={`badge ${getStatusBadge(inquiry.status)} flex items-center gap-1`}>
                          <StatusIcon className="h-3 w-3" />
                          {inquiry.status_display || inquiry.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <p className="text-xs">{inquiry.created_at ? format(new Date(inquiry.created_at), "MMM d, yyyy") : "N/A"}</p>
                        <p className="text-xs text-gray-400">{inquiry.created_at ? format(new Date(inquiry.created_at), "h:mm a") : ""}</p>
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedInquiry(inquiry);
                              setShowDetailModal(true);
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedInquiry(inquiry);
                              setReplyNotes("");
                              setNewStatus(inquiry.status);
                              setShowReplyModal(true);
                            }}
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Reply/Update"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    <EnvelopeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p>No inquiries found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                Inquiry Details
              </h3>
              <button
                onClick={() => { setShowDetailModal(false); setSelectedInquiry(null); }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <XCircleIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">From</p>
                  <p className="font-semibold">{selectedInquiry.name}</p>
                  <p className="text-sm text-gray-600">{selectedInquiry.email}</p>
                  {selectedInquiry.phone && (
                    <p className="text-sm text-gray-600">{selectedInquiry.phone}</p>
                  )}
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`badge ${getStatusBadge(selectedInquiry.status)} flex items-center gap-1`}>
                    {selectedInquiry.status_display || selectedInquiry.status}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {selectedInquiry.created_at ? format(new Date(selectedInquiry.created_at), "MMM d, yyyy h:mm a") : "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500">Subject</p>
                <p className="font-medium">{selectedInquiry.subject}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Message</p>
                <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>
              </div>

              {selectedInquiry.response_notes && (
                <div>
                  <p className="text-xs text-gray-500">Response Notes</p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm">{selectedInquiry.response_notes}</p>
                  </div>
                </div>
              )}

              {selectedInquiry.assigned_to && (
                <div>
                  <p className="text-xs text-gray-500">Assigned To</p>
                  <p className="text-sm">{selectedInquiry.assigned_to}</p>
                </div>
              )}

              {selectedInquiry.resolved_at && (
                <div>
                  <p className="text-xs text-gray-500">Resolved At</p>
                  <p className="text-sm">{format(new Date(selectedInquiry.resolved_at), "MMM d, yyyy h:mm a")}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedInquiry(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setReplyNotes("");
                    setNewStatus(selectedInquiry.status);
                    setShowReplyModal(true);
                    setShowDetailModal(false);
                  }}
                  className="btn-primary flex-1"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply/Update Modal */}
      {showReplyModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <PencilIcon className="h-6 w-6 text-blue-600" />
                Update Inquiry
              </h3>
              <button
                onClick={() => { setShowReplyModal(false); setSelectedInquiry(null); }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <XCircleIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">From:</span> {selectedInquiry.name}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Subject:</span> {selectedInquiry.subject}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="input-field"
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Response Notes
                </label>
                <textarea
                  value={replyNotes}
                  onChange={(e) => setReplyNotes(e.target.value)}
                  className="input-field resize-none"
                  rows={4}
                  placeholder="Add notes about this inquiry..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => { setShowReplyModal(false); setSelectedInquiry(null); }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedInquiry.id, newStatus, replyNotes)}
                  disabled={isSubmitting}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {isSubmitting ? "Updating..." : "Update Inquiry"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
