"use client";

import { useState, useEffect } from "react";
import { analyticsAPI, bookingAPI, paymentAPI, userAPI } from "@/lib/api/endpoints";
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  CalendarIcon,
  CreditCardIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { formatCurrency } from "@/lib/utils";

interface DashboardData {
  daily: any;
  weekly: any;
  monthly: any;
  summary: any;
  payments: any[];
  users: any[];
  bookings: any[];
  roomTypes: any[];
}

export default function OwnerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<"today" | "week" | "month" | "year">("month");

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [daily, weekly, summary, payments, users, bookings] = await Promise.all([
        analyticsAPI.getDaily(),
        analyticsAPI.getWeekly(),
        analyticsAPI.getSummary(),
        paymentAPI.getPayments({ status: "SUCCESS" }),
        userAPI.getUsers(),
        bookingAPI.getBookings(),
      ]);

      // Safely extract room types from weekly data
      const roomTypes = weekly.data?.room_types_performance || [];

      setData({
        daily: daily.data || {},
        weekly: weekly.data || {},
        monthly: weekly.data || {},
        summary: summary.data || {},
        payments: payments.data?.results || [],
        users: users.data?.results || [],
        bookings: bookings.data?.results || [],
        roomTypes: roomTypes,
      });
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Safely calculate total revenue
  const calculateTotalRevenue = () => {
    if (!data?.payments || data.payments.length === 0) return 0;
    return data.payments.reduce((sum, p) => {
      const amount = typeof p.amount === 'number' ? p.amount : parseFloat(p.amount) || 0;
      return sum + amount;
    }, 0);
  };

  const totalRevenue = calculateTotalRevenue();
  const activeUsers = data?.users?.filter(u => u.is_active).length || 0;
  const totalBookings = data?.bookings?.length || 0;
  const totalRooms = data?.summary?.rooms_summary?.total || 0;
  const occupancyRate = data?.daily?.occupancy_rate_percentage || 0;

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

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-gray-600">{error || "No data available"}</p>
          <button onClick={fetchDashboardData} className="btn-primary mt-4">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: CurrencyDollarIcon,
      color: "green",
      change: "+18.5%",
      trend: "up",
    },
    {
      label: "Total Bookings",
      value: totalBookings,
      icon: CalendarIcon,
      color: "blue",
      change: "+12.3%",
      trend: "up",
    },
    {
      label: "Active Users",
      value: activeUsers,
      icon: UserGroupIcon,
      color: "purple",
      change: "+5.2%",
      trend: "up",
    },
    {
      label: "Occupancy Rate",
      value: `${occupancyRate}%`,
      icon: BuildingOfficeIcon,
      color: "orange",
      change: "+8.1%",
      trend: "up",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Owner Dashboard</h2>
          <p className="text-sm text-gray-500">Complete business overview and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="input-field max-w-[150px]"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button onClick={fetchDashboardData} className="btn-secondary">
            <ArrowTrendingUpIcon className="h-5 w-5" />
          </button>
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

      {/* Revenue & Booking Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <CurrencyDollarIcon className="h-5 w-5 mr-2 text-gray-500" />
            Revenue by Payment Method
          </h3>
          <div className="space-y-3">
            {data.daily?.revenue_by_payment_method && Object.keys(data.daily.revenue_by_payment_method).length > 0 ? (
              Object.entries(data.daily.revenue_by_payment_method).map(([method, amount]: [string, any]) => {
                const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
                return (
                  <div key={method} className="flex items-center justify-between">
                    <span className="text-sm capitalize text-gray-600">
                      {method.replace("_", " ").toLowerCase()}
                    </span>
                    <span className="font-semibold text-blue-600">{formatCurrency(numAmount)}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500">No payment data available</p>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2 text-gray-500" />
            Room Types Performance
          </h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {data.roomTypes && data.roomTypes.length > 0 ? (
              data.roomTypes.slice(0, 5).map((type: any) => (
                <div key={type.room_type_id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{type.room_type_name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">{type.bookings_count} bookings</span>
                    <span className="font-semibold text-blue-600">
                      ${(typeof type.total_revenue === 'number' ? type.total_revenue : parseFloat(type.total_revenue) || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No room type data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="dashboard-card text-center">
          <p className="text-2xl font-bold text-blue-600">{data.users?.length || 0}</p>
          <p className="text-sm text-gray-500">Total Users</p>
        </div>
        <div className="dashboard-card text-center">
          <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
          <p className="text-sm text-gray-500">Active Users</p>
        </div>
        <div className="dashboard-card text-center">
          <p className="text-2xl font-bold text-purple-600">{totalBookings}</p>
          <p className="text-sm text-gray-500">Total Bookings</p>
        </div>
        <div className="dashboard-card text-center">
          <p className="text-2xl font-bold text-orange-600">{totalRooms}</p>
          <p className="text-sm text-gray-500">Total Rooms</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <a
          href="/owner/analytics"
          className="dashboard-card hover:bg-blue-50 transition-colors text-center cursor-pointer"
        >
          <div className="text-2xl mb-2">📊</div>
          <p className="text-sm font-medium">Analytics</p>
          <p className="text-xs text-gray-500">Advanced reports</p>
        </a>
        <a
          href="/owner/users"
          className="dashboard-card hover:bg-purple-50 transition-colors text-center cursor-pointer"
        >
          <div className="text-2xl mb-2">👥</div>
          <p className="text-sm font-medium">Users</p>
          <p className="text-xs text-gray-500">Manage staff</p>
        </a>
        <a
          href="/owner/settings"
          className="dashboard-card hover:bg-orange-50 transition-colors text-center cursor-pointer"
        >
          <div className="text-2xl mb-2">⚙️</div>
          <p className="text-sm font-medium">Settings</p>
          <p className="text-xs text-gray-500">Hotel configuration</p>
        </a>
        <a
          href="/manager/reports"
          className="dashboard-card hover:bg-green-50 transition-colors text-center cursor-pointer"
        >
          <div className="text-2xl mb-2">📈</div>
          <p className="text-sm font-medium">Reports</p>
          <p className="text-xs text-gray-500">Business insights</p>
        </a>
      </div>
    </div>
  );
}
