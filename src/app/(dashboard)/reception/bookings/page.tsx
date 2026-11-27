"use client";

import { useState, useEffect } from "react";
import { bookingAPI } from "@/lib/api/endpoints";
import {
  CalendarIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { ExtendStayModal } from "@/components/modals/ExtendStayModal";
import { formatCurrency } from "@/lib/utils";

interface Booking {
  id: number;
  booking_reference: string;
  guest_details?: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    phone_number?: string;
  };
  room_details?: {
    room_number?: string;
    room_type_details?: {
      name?: string;
      base_price_per_night?: number;
    };
  };
  status: string;
  check_in_date: string;
  check_out_date: string;
  nightly_rate?: number;
  total_amount: number;
  created_at: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [bookingToExtend, setBookingToExtend] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingAPI.getBookings();
      setBookings(response.data.results || []);
    } catch (error) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: any; label: string }> = {
      PENDING_PAYMENT_VERIFICATION: { color: "bg-yellow-100 text-yellow-800", icon: ClockIcon, label: "Pending Verification" },
      CONFIRMED: { color: "bg-blue-100 text-blue-800", icon: CheckCircleIcon, label: "Confirmed" },
      CHECKED_IN: { color: "bg-green-100 text-green-800", icon: CheckCircleIcon, label: "Checked In" },
      CHECKED_OUT: { color: "bg-gray-100 text-gray-800", icon: XCircleIcon, label: "Checked Out" },
      CANCELLED: { color: "bg-red-100 text-red-800", icon: XCircleIcon, label: "Cancelled" },
    };
    return config[status] || config.CONFIRMED;
  };

  const handleOpenExtendModal = (booking: Booking) => {
    setBookingToExtend(booking);
    setExtendModalOpen(true);
  };

  const filteredBookings = bookings.filter((booking) => {
    const guestName = booking.guest_details?.full_name || `${booking.guest_details?.first_name || ""} ${booking.guest_details?.last_name || ""}`;
    const matchesSearch =
      booking.booking_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.room_details?.room_number && booking.room_details.room_number.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = !statusFilter || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reservations & Stays</h2>
          <p className="text-sm text-gray-500">View, manage, and extend guest stays</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by reference, guest, or room..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm max-w-[200px]"
        >
          <option value="">All Statuses</option>
          <option value="CHECKED_IN">Checked In (Active)</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PENDING_PAYMENT_VERIFICATION">Pending Verification</option>
          <option value="CHECKED_OUT">Checked Out</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button onClick={fetchBookings} className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition-colors">
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left p-4 font-semibold text-gray-600">Booking</th>
                <th className="text-left p-4 font-semibold text-gray-600">Guest</th>
                <th className="text-left p-4 font-semibold text-gray-600">Room</th>
                <th className="text-left p-4 font-semibold text-gray-600">Dates</th>
                <th className="text-right p-4 font-semibold text-gray-600">Amount</th>
                <th className="text-center p-4 font-semibold text-gray-600">Status</th>
                <th className="text-center p-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => {
                const statusConfig = getStatusBadge(booking.status);
                const StatusIcon = statusConfig.icon;
                const isExtendable = booking.status === "CHECKED_IN" || booking.status === "CONFIRMED";
                const guestName = booking.guest_details?.full_name || `${booking.guest_details?.first_name || ""} ${booking.guest_details?.last_name || ""}`.trim() || "Guest";

                return (
                  <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 font-mono font-medium text-blue-700">{booking.booking_reference}</td>
                    <td className="p-4 font-medium text-gray-900">{guestName}</td>
                    <td className="p-4 font-medium">Room {booking.room_details?.room_number}</td>
                    <td className="p-4">
                      <div className="text-xs">
                        <span className="font-semibold text-gray-800">{format(new Date(booking.check_in_date), "MMM d")}</span>
                        <span className="text-gray-400 mx-1">→</span>
                        <span className="font-semibold text-blue-600">{format(new Date(booking.check_out_date), "MMM d, yyyy")}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right font-bold text-gray-900">{formatCurrency(booking.total_amount)}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.color} inline-flex items-center gap-1`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {isExtendable && (
                          <button
                            onClick={() => handleOpenExtendModal(booking)}
                            title="Extend Stay Window"
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors flex items-center space-x-1 border border-blue-200/60"
                          >
                            <CalendarDaysIcon className="h-4 w-4" />
                            <span>Extend</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          title="View Details"
                          className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">No bookings found</p>
          </div>
        )}
      </div>

      {/* Extend Stay Modal */}
      <ExtendStayModal
        isOpen={extendModalOpen}
        onClose={() => {
          setExtendModalOpen(false);
          setBookingToExtend(null);
        }}
        booking={bookingToExtend}
        onSuccess={fetchBookings}
      />
    </div>
  );
}
