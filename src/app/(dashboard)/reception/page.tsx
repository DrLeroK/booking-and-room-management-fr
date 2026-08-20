"use client";

import { useState, useEffect } from "react";
import { bookingAPI } from "@/lib/api/endpoints";
import {
  BuildingOfficeIcon,
  UsersIcon,
  CalendarIcon,
  CreditCardIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { ExtendStayModal } from "@/components/modals/ExtendStayModal";

interface LiveBoardData {
  date: string;
  summary: {
    total_rooms: number;
    available_count: number;
    occupied_count: number;
    cleaning_count: number;
    maintenance_count: number;
    pending_payment_verification_count: number;
  };
  active_stay_count: number;
  expected_arrivals_today: any[];
  expected_departures_today: any[];
  pending_payment_verifications: any[];
  rooms_live_state: any[];
}

export default function ReceptionDashboard() {
  const [data, setData] = useState<LiveBoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [selectedBookingForExtension, setSelectedBookingForExtension] = useState<any | null>(null);

  useEffect(() => {
    fetchLiveBoard();
    const interval = setInterval(fetchLiveBoard, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveBoard = async () => {
    try {
      const response = await bookingAPI.getLiveBoard();
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch live board:", err);
      setError("Failed to load live board data");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenExtendModal = (booking: any) => {
    setSelectedBookingForExtension(booking);
    setExtendModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading live board...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-gray-600">{error || "No data available"}</p>
          <button onClick={fetchLiveBoard} className="btn-primary mt-4">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Available Rooms",
      value: data.summary?.available_count || 0,
      icon: BuildingOfficeIcon,
      color: "green",
    },
    {
      label: "Occupied Rooms",
      value: data.summary?.occupied_count || 0,
      icon: BuildingOfficeIcon,
      color: "blue",
    },
    {
      label: "Active Stays",
      value: data.active_stay_count || 0,
      icon: UsersIcon,
      color: "purple",
    },
    {
      label: "Pending Verifications",
      value: data.summary?.pending_payment_verification_count || 0,
      icon: CreditCardIcon,
      color: "yellow",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reception Live Board</h2>
          <p className="text-sm text-gray-500">Real-time overview of hotel operations & active stays</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-xl">
            {format(new Date(data.date), "EEEE, MMMM d, yyyy")}
          </span>
          <button
            onClick={fetchLiveBoard}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <ArrowTrendingUpIcon className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 text-blue-600">
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Room Status Overview */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <BuildingOfficeIcon className="h-5 w-5 mr-2 text-blue-600" />
          Room Inventory Status Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50/80 rounded-xl border border-green-200/50">
            <p className="text-3xl font-bold text-green-700">{data.summary?.available_count || 0}</p>
            <p className="text-xs font-semibold text-green-800 uppercase mt-1">Available</p>
          </div>
          <div className="text-center p-4 bg-blue-50/80 rounded-xl border border-blue-200/50">
            <p className="text-3xl font-bold text-blue-700">{data.summary?.occupied_count || 0}</p>
            <p className="text-xs font-semibold text-blue-800 uppercase mt-1">Occupied</p>
          </div>
          <div className="text-center p-4 bg-amber-50/80 rounded-xl border border-amber-200/50">
            <p className="text-3xl font-bold text-amber-700">{data.summary?.cleaning_count || 0}</p>
            <p className="text-xs font-semibold text-amber-800 uppercase mt-1">Cleaning</p>
          </div>
          <div className="text-center p-4 bg-rose-50/80 rounded-xl border border-rose-200/50">
            <p className="text-3xl font-bold text-rose-700">{data.summary?.maintenance_count || 0}</p>
            <p className="text-xs font-semibold text-rose-800 uppercase mt-1">Maintenance</p>
          </div>
        </div>
      </div>

      {/* Arrivals & Departures */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center">
            <CalendarIcon className="h-5 w-5 text-green-600 mr-2" />
            Expected Arrivals Today ({data.expected_arrivals_today?.length || 0})
          </h3>
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {data.expected_arrivals_today?.length > 0 ? (
              data.expected_arrivals_today.map((booking: any) => (
                <div key={booking.id} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2.5 pt-1">
                  <div>
                    <span className="font-semibold text-gray-900 block">{booking.guest_details?.full_name || booking.guest_details?.first_name}</span>
                    <span className="text-xs text-blue-600 font-medium">Room {booking.room_details?.room_number}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                    Arrival Today
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center">No expected arrivals for today</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center justify-between">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-rose-600 mr-2" />
              <span>Expected Departures Today ({data.expected_departures_today?.length || 0})</span>
            </div>
          </h3>
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {data.expected_departures_today?.length > 0 ? (
              data.expected_departures_today.map((booking: any) => (
                <div key={booking.id} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2.5 pt-1">
                  <div>
                    <span className="font-semibold text-gray-900 block">{booking.guest_details?.full_name || booking.guest_details?.first_name}</span>
                    <span className="text-xs text-rose-600 font-medium">Room {booking.room_details?.room_number}</span>
                  </div>
                  <button
                    onClick={() => handleOpenExtendModal(booking)}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-lg transition-colors border border-blue-200/60 flex items-center space-x-1"
                  >
                    <CalendarDaysIcon className="h-3.5 w-3.5" />
                    <span>Extend Stay</span>
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center">No expected departures for today</p>
            )}
          </div>
        </div>
      </div>

      {/* Pending Verifications */}
      {data.pending_payment_verifications?.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-yellow-200/80 bg-yellow-50/20 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center">
            <ClockIcon className="h-5 w-5 text-amber-500 mr-2" />
            Pending Payment Verifications ({data.pending_payment_verifications.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="text-left py-2.5 font-semibold">Guest</th>
                  <th className="text-left py-2.5 font-semibold">Room</th>
                  <th className="text-left py-2.5 font-semibold">Booking Ref</th>
                  <th className="text-right py-2.5 font-semibold">Amount</th>
                  <th className="text-right py-2.5 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.pending_payment_verifications.map((booking: any) => (
                  <tr key={booking.id} className="border-b border-gray-100 hover:bg-yellow-50/50">
                    <td className="py-2.5 font-medium text-gray-900">{booking.guest_details?.full_name}</td>
                    <td className="py-2.5 font-medium">Room {booking.room_details?.room_number}</td>
                    <td className="py-2.5 font-mono text-xs text-blue-700">{booking.booking_reference}</td>
                    <td className="py-2.5 text-right font-bold text-gray-900">${booking.total_amount}</td>
                    <td className="py-2.5 text-right">
                      <a
                        href="/reception/payments"
                        className="text-xs bg-amber-500 hover:bg-amber-600 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors inline-block"
                      >
                        Verify Transfer
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <a
          href="/reception/check-in"
          className="p-5 bg-white rounded-2xl border border-gray-100 hover:border-green-300 hover:bg-green-50/40 transition-all text-center group shadow-sm"
        >
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🏠</div>
          <p className="text-sm font-bold text-gray-900">Walk-In Check-In</p>
          <p className="text-xs text-gray-500 mt-0.5">Register walk-in guest arrival</p>
        </a>
        <a
          href="/reception/check-out"
          className="p-5 bg-white rounded-2xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50/40 transition-all text-center group shadow-sm"
        >
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🚪</div>
          <p className="text-sm font-bold text-gray-900">Check-Out Processing</p>
          <p className="text-xs text-gray-500 mt-0.5">Finalize bill & inspect room</p>
        </a>
        <a
          href="/reception/bookings"
          className="p-5 bg-white rounded-2xl border border-gray-100 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all text-center group shadow-sm"
        >
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📅</div>
          <p className="text-sm font-bold text-gray-900">Extend & Manage Stays</p>
          <p className="text-xs text-gray-500 mt-0.5">Adjust departure dates</p>
        </a>
        <a
          href="/reception/guests"
          className="p-5 bg-white rounded-2xl border border-gray-100 hover:border-purple-300 hover:bg-purple-50/40 transition-all text-center group shadow-sm"
        >
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">👤</div>
          <p className="text-sm font-bold text-gray-900">Guest Database</p>
          <p className="text-xs text-gray-500 mt-0.5">View & search guest records</p>
        </a>
      </div>

      {/* Extend Stay Modal */}
      <ExtendStayModal
        isOpen={extendModalOpen}
        onClose={() => {
          setExtendModalOpen(false);
          setSelectedBookingForExtension(null);
        }}
        booking={selectedBookingForExtension}
        onSuccess={fetchLiveBoard}
      />
    </div>
  );
}
