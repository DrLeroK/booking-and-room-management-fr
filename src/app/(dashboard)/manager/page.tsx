"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { analyticsAPI, bookingAPI, roomAPI } from "@/lib/api/endpoints";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";

interface DashboardData {
  daily: any;
  weekly: any;
  summary: any;
  roomTypes: any[];
  bookings: any[];
  liveBoard: any;
}

export default function ManagerDashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching dashboard data...");
        
        const [daily, weekly, summary, roomTypes, bookings, liveBoard] = await Promise.all([
          analyticsAPI.getDaily(),
          analyticsAPI.getWeekly(),
          analyticsAPI.getSummary(),
          roomAPI.getRoomTypes(),
          bookingAPI.getBookings({ status: "CHECKED_IN" }),
          bookingAPI.getLiveBoard(),
        ]);

        console.log("Data fetched successfully:", {
          daily: daily.data,
          weekly: weekly.data,
          summary: summary.data,
          roomTypes: roomTypes.data,
          bookings: bookings.data,
          liveBoard: liveBoard.data,
        });

        setData({
          daily: daily.data,
          weekly: weekly.data,
          summary: summary.data,
          roomTypes: roomTypes.data?.results || [],
          bookings: bookings.data?.results || [],
          liveBoard: liveBoard.data,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary mt-4"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No data available.</p>
      </div>
    );
  }

  const stats = [
    {
      label: "Today's Revenue",
      value: `$${data.daily?.total_revenue?.toFixed(2) || "0.00"}`,
      icon: CurrencyDollarIcon,
      color: "green",
      change: "+12.5%",
      trend: "up",
    },
    {
      label: "Occupancy Rate",
      value: `${data.daily?.occupancy_rate_percentage || 0}%`,
      icon: ChartBarIcon,
      color: "blue",
      change: "+5.2%",
      trend: "up",
    },
    {
      label: "Active Guests",
      value: data.bookings?.length || 0,
      icon: UsersIcon,
      color: "purple",
      change: "-2.1%",
      trend: "down",
    },
    {
      label: "Available Rooms",
      value: data.summary?.rooms_summary?.available || 0,
      icon: BuildingOfficeIcon,
      color: "orange",
      change: "+8",
      trend: "up",
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING_PAYMENT_VERIFICATION: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      CHECKED_IN: "bg-green-100 text-green-800",
      CHECKED_OUT: "bg-gray-100 text-gray-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusDisplay = (status: string) => {
    const displays: Record<string, string> = {
      PENDING_PAYMENT_VERIFICATION: "Pending Verification",
      CONFIRMED: "Confirmed",
      CHECKED_IN: "Checked In",
      CHECKED_OUT: "Checked Out",
      CANCELLED: "Cancelled",
    };
    return displays[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manager Dashboard</h2>
          <p className="text-sm text-gray-500">
            Welcome back, {user?.full_name || user?.username}! Here's your daily overview.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="dashboard-card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1">
                {stat.trend === "up" ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500">from last period</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily Breakdown */}
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-gray-500" />
            Daily Breakdown
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {data.weekly?.daily_breakdown?.slice(0, 7).map((day: any) => (
              <div key={day.date} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                <span className="font-medium">{format(new Date(day.date), "EEE, MMM d")}</span>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500">{day.rooms_sold || 0} rooms</span>
                  <span className="text-gray-500">{day.occupancy_rate_percentage}%</span>
                  <span className="font-semibold text-blue-600">${day.total_revenue?.toFixed(2) || "0.00"}</span>
                </div>
              </div>
            ))}
            {(!data.weekly?.daily_breakdown || data.weekly.daily_breakdown.length === 0) && (
              <p className="text-gray-500 text-sm">No daily data available</p>
            )}
          </div>
        </div>

        {/* Room Types Performance */}
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BuildingOfficeIcon className="h-5 w-5 mr-2 text-gray-500" />
            Room Types Performance
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {data.roomTypes?.slice(0, 5).map((type: any) => (
              <div key={type.id} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                <div>
                  <span className="font-medium">{type.name}</span>
                  <span className="text-gray-500 text-xs ml-2">({type.code})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">{type.active_rooms_count || 0} rooms</span>
                  <span className="font-semibold text-blue-600">${type.base_price_per_night}</span>
                </div>
              </div>
            ))}
            {(!data.roomTypes || data.roomTypes.length === 0) && (
              <p className="text-gray-500 text-sm">No room types available</p>
            )}
          </div>
        </div>
      </div>

      {/* Pending Verifications */}
      {data.liveBoard?.pending_payment_verifications?.length > 0 && (
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold mb-4">
            Pending Verifications ({data.liveBoard.pending_payment_verifications.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-500">Booking</th>
                  <th className="text-left py-2 font-medium text-gray-500">Guest</th>
                  <th className="text-left py-2 font-medium text-gray-500">Room</th>
                  <th className="text-right py-2 font-medium text-gray-500">Amount</th>
                  <th className="text-right py-2 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.liveBoard.pending_payment_verifications.map((booking: any) => (
                  <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 font-medium">{booking.booking_reference}</td>
                    <td className="py-2">{booking.guest_details?.full_name}</td>
                    <td className="py-2">Room {booking.room_details?.room_number}</td>
                    <td className="py-2 text-right font-medium">${booking.total_amount}</td>
                    <td className="py-2 text-right">
                      <span className={`badge ${getStatusColor(booking.status)}`}>
                        {getStatusDisplay(booking.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="dashboard-card hover:bg-blue-50 transition-colors text-center">
          <div className="text-2xl mb-2">👤</div>
          <p className="text-sm font-medium">New Guest</p>
          <p className="text-xs text-gray-500">Create guest profile</p>
        </button>
        <button className="dashboard-card hover:bg-blue-50 transition-colors text-center">
          <div className="text-2xl mb-2">🏠</div>
          <p className="text-sm font-medium">Add Room</p>
          <p className="text-xs text-gray-500">Create new room</p>
        </button>
        <button className="dashboard-card hover:bg-blue-50 transition-colors text-center">
          <div className="text-2xl mb-2">📊</div>
          <p className="text-sm font-medium">View Reports</p>
          <p className="text-xs text-gray-500">Analytics & insights</p>
        </button>
        <button className="dashboard-card hover:bg-blue-50 transition-colors text-center">
          <div className="text-2xl mb-2">⚙️</div>
          <p className="text-sm font-medium">Settings</p>
          <p className="text-xs text-gray-500">Configure hotel</p>
        </button>
      </div>
    </div>
  );
}
