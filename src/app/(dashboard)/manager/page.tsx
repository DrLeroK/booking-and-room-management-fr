"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  CheckCircleIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon,
  UserGroupIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

interface DashboardData {
  daily: any;
  weekly: any;
  summary: any;
  roomTypes: any[];
  bookings: any[];
  recentActivity: any[];
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
        const [daily, weekly, summary, roomTypes, activeBookings, recentBookings, liveBoard] =
          await Promise.all([
            analyticsAPI.getDaily(),
            analyticsAPI.getWeekly(),
            analyticsAPI.getSummary(),
            roomAPI.getRoomTypes(),
            bookingAPI.getBookings({ status: "CHECKED_IN" }),
            bookingAPI.getBookings({ page_size: 8 }),
            bookingAPI.getLiveBoard(),
          ]);

        setData({
          daily: daily.data,
          weekly: weekly.data,
          summary: summary.data,
          roomTypes: roomTypes.data?.results || [],
          bookings: activeBookings.data?.results || [],
          recentActivity: recentBookings.data?.results || [],
          liveBoard: liveBoard.data,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load operations dashboard data. Please try again.");
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
          <p className="mt-4 text-gray-600">Loading operations overview...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-gray-600">{error || "No data available."}</p>
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

  // Key operations & hospitality stats
  const kpiStats = [
    {
      label: "Today's Revenue",
      value: formatCurrency(data.daily?.total_revenue || 0),
      subtext: `ADR: ${formatCurrency(data.daily?.adr || 0)}`,
      icon: CurrencyDollarIcon,
      color: "emerald",
      trend: "up",
    },
    {
      label: "Occupancy Rate",
      value: `${data.daily?.occupancy_rate_percentage || 0}%`,
      subtext: `${data.daily?.rooms_sold || 0} of ${data.daily?.available_capacity || data.liveBoard?.summary?.total_rooms || 0} occupied`,
      icon: ChartBarIcon,
      color: "blue",
      trend: "up",
    },
    {
      label: "Active In-House",
      value: data.bookings?.length || data.liveBoard?.active_stay_count || 0,
      subtext: "Currently checked-in guests",
      icon: UsersIcon,
      color: "indigo",
      trend: "neutral",
    },
    {
      label: "Turnaround Queue",
      value: data.liveBoard?.summary?.cleaning_count || 0,
      subtext: `${data.liveBoard?.summary?.available_count || 0} clean & ready`,
      icon: SparklesIcon,
      color: "amber",
      trend: "neutral",
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING_PAYMENT_VERIFICATION: "bg-amber-100 text-amber-800 border-amber-200",
      CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
      CHECKED_IN: "bg-emerald-100 text-emerald-800 border-emerald-200",
      CHECKED_OUT: "bg-gray-100 text-gray-800 border-gray-200",
      CANCELLED: "bg-rose-100 text-rose-800 border-rose-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusDisplay = (status: string) => {
    const displays: Record<string, string> = {
      PENDING_PAYMENT_VERIFICATION: "Pending Proof",
      CONFIRMED: "Confirmed",
      CHECKED_IN: "Checked In",
      CHECKED_OUT: "Checked Out",
      CANCELLED: "Cancelled",
    };
    return displays[status] || status;
  };

  const arrivalsCount = data.liveBoard?.expected_arrivals_today?.length || 0;
  const departuresCount = data.liveBoard?.expected_departures_today?.length || 0;
  const pendingProofCount = data.liveBoard?.pending_payment_verifications?.length || 0;
  const checkInsToday = data.daily?.check_ins_count || 0;
  const checkOutsToday = data.daily?.check_outs_count || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Operations & Front Desk Center</h2>
          <p className="text-sm text-gray-500">
            Welcome back, {user?.full_name || user?.username}! Real-time receptionist oversight and operational reports.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/reception"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold transition"
          >
            <span>Live Reception Board</span>
            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
          </Link>
          <div className="text-xs font-medium text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="dashboard-card bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.subtext}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Receptionist Oversight & Front Desk Shift Metrics */}
      <div className="dashboard-card bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-blue-600" />
              Receptionist Operations Oversight (Today&apos;s Shifts)
            </h3>
            <p className="text-xs text-gray-500">Live monitoring of front desk activities, arrivals, and guest turnover</p>
          </div>
          <Link
            href="/reception"
            className="text-xs font-semibold text-blue-600 hover:text-blue-500 flex items-center gap-1"
          >
            View Live Desk &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 text-blue-700 text-xs font-semibold">
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              Arrivals & Check-ins
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">{checkInsToday}</span>
              <span className="text-xs text-gray-500">completed / {arrivalsCount} expected</span>
            </div>
          </div>

          <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-100">
            <div className="flex items-center gap-2 text-purple-700 text-xs font-semibold">
              <ArrowLeftOnRectangleIcon className="w-4 h-4" />
              Departures & Check-outs
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">{checkOutsToday}</span>
              <span className="text-xs text-gray-500">completed / {departuresCount} expected</span>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-100">
            <div className="flex items-center gap-2 text-amber-700 text-xs font-semibold">
              <ClockIcon className="w-4 h-4" />
              Proof Verification Queue
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">{pendingProofCount}</span>
              <span className="text-xs text-gray-500">awaiting review</span>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold">
              <BuildingOfficeIcon className="w-4 h-4" />
              Room Inventory Ready
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">{data.liveBoard?.summary?.available_count || 0}</span>
              <span className="text-xs text-gray-500">of {data.liveBoard?.summary?.total_rooms || 0} total rooms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Operations Layout: Recent Activity & Pending Verification Queue */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Front Desk Activity Feed */}
        <div className="dashboard-card bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-gray-600" />
                Recent Front Desk Guest Activity
              </h3>
              <Link
                href="/reception/bookings"
                className="text-xs font-medium text-blue-600 hover:text-blue-500"
              >
                All Bookings &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {data.recentActivity?.slice(0, 5).map((b: any) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900 truncate">
                        {b.guest?.full_name || "Guest"}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">#{b.booking_reference}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Room {b.room?.room_number || "Unassigned"} ({b.room?.room_type?.name || "Standard"}) &bull; {b.check_in_date} to {b.check_out_date}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getStatusColor(b.status)}`}>
                      {getStatusDisplay(b.status)}
                    </span>
                    <p className="text-xs font-bold text-gray-900 mt-1">{formatCurrency(b.total_amount)}</p>
                  </div>
                </div>
              ))}
              {(!data.recentActivity || data.recentActivity.length === 0) && (
                <p className="text-sm text-gray-500 py-4 text-center">No recent guest transactions recorded.</p>
              )}
            </div>
          </div>
        </div>

        {/* Pending Bank Proof Verification Queue */}
        <div className="dashboard-card bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-amber-500" />
                Pending Payment Verifications ({pendingProofCount})
              </h3>
              <Link
                href="/reception/payments"
                className="text-xs font-medium text-blue-600 hover:text-blue-500"
              >
                Go to Payments &rarr;
              </Link>
            </div>

            {pendingProofCount > 0 ? (
              <div className="space-y-3">
                {data.liveBoard?.pending_payment_verifications?.slice(0, 4).map((booking: any) => (
                  <div
                    key={booking.id}
                    className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/40 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">
                          {booking.guest_details?.full_name || "Guest"}
                        </span>
                        <span className="text-xs text-amber-800 font-mono">#{booking.booking_reference}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Room {booking.room_details?.room_number} &bull; Phone: {booking.guest_details?.phone_number}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(booking.total_amount)}</p>
                      <Link
                        href="/reception"
                        className="inline-block mt-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 underline"
                      >
                        Inspect Proof
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <CheckCircleIcon className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-800">Verification Queue Clear</p>
                <p className="text-xs text-gray-500 mt-1">
                  All online payments and bank screenshots have been reviewed by receptionists.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 7-Day Performance & Room Type Distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 7-Day Daily Breakdown */}
        <div className="dashboard-card bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-gray-500" />
              7-Day Operations & Revenue Trend
            </h3>
            <Link
              href="/manager/reports"
              className="text-xs font-semibold text-blue-600 hover:text-blue-500"
            >
              Export CSV &rarr;
            </Link>
          </div>
          <div className="space-y-2.5 max-h-80 overflow-y-auto">
            {data.weekly?.daily_breakdown?.slice(0, 7).map((day: any) => (
              <div key={day.date} className="flex items-center justify-between text-xs border-b border-gray-100 pb-2">
                <span className="font-medium text-gray-700">{format(new Date(day.date), "EEE, MMM d")}</span>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500">{day.rooms_sold || 0} rooms</span>
                  <span className="text-gray-500">{day.occupancy_rate_percentage}%</span>
                  <span className="font-semibold text-blue-600">{formatCurrency(day.total_revenue || 0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Room Types Catalog Performance */}
        <div className="dashboard-card bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <BuildingOfficeIcon className="h-5 w-5 text-gray-500" />
              Room Types Active Capacity
            </h3>
            <Link
              href="/manager/rooms"
              className="text-xs font-semibold text-blue-600 hover:text-blue-500"
            >
              Manage Catalog &rarr;
            </Link>
          </div>
          <div className="space-y-2.5 max-h-80 overflow-y-auto">
            {data.roomTypes?.map((type: any) => (
              <div key={type.id} className="flex items-center justify-between text-xs border-b border-gray-100 pb-2">
                <div>
                  <span className="font-semibold text-gray-900">{type.name}</span>
                  <span className="text-gray-400 ml-1.5 font-mono">({type.code})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">{type.active_rooms_count || 0} active rooms</span>
                  <span className="font-bold text-blue-600">{formatCurrency(type.base_price_per_night)}/night</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Clean Quick Operations Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/reception"
          className="dashboard-card bg-white p-4 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50/50 transition text-center group"
        >
          <div className="text-2xl mb-2">🏨</div>
          <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition">Live Front Desk</p>
          <p className="text-xs text-gray-500 mt-0.5">Real-time room board</p>
        </Link>

        <Link
          href="/manager/staff"
          className="dashboard-card bg-white p-4 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50/50 transition text-center group"
        >
          <div className="text-2xl mb-2">👥</div>
          <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition">Staff Management</p>
          <p className="text-xs text-gray-500 mt-0.5">Receptionists & shifts</p>
        </Link>

        <Link
          href="/manager/reports"
          className="dashboard-card bg-white p-4 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50/50 transition text-center group"
        >
          <div className="text-2xl mb-2">📊</div>
          <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition">Reports & CSV Export</p>
          <p className="text-xs text-gray-500 mt-0.5">Financial & audit logs</p>
        </Link>

        <Link
          href="/manager/rooms"
          className="dashboard-card bg-white p-4 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50/50 transition text-center group"
        >
          <div className="text-2xl mb-2">🛏️</div>
          <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition">Room Inventory</p>
          <p className="text-xs text-gray-500 mt-0.5">Pricing & status rules</p>
        </Link>
      </div>
    </div>
  );
}
