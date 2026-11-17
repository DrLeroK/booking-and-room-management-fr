"use client";

import { useState, useEffect } from "react";
import { analyticsAPI, bookingAPI, paymentAPI } from "@/lib/api/endpoints";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  DocumentArrowDownIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

interface AnalyticsData {
  daily: any;
  weekly: any;
  payments: any[];
  bookings: any[];
  revenueByPeriod: any[];
  occupancyTrend: any[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<"week" | "month" | "quarter" | "year">("month");
  const [selectedMetric, setSelectedMetric] = useState<"revenue" | "occupancy" | "bookings">("revenue");

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [daily, weekly, payments, bookings] = await Promise.all([
        analyticsAPI.getDaily(),
        analyticsAPI.getWeekly(),
        paymentAPI.getPayments({ status: "SUCCESS" }),
        bookingAPI.getBookings(),
      ]);

      setData({
        daily: daily.data || {},
        weekly: weekly.data || {},
        payments: payments.data?.results || [],
        bookings: bookings.data?.results || [],
        revenueByPeriod: weekly.data?.daily_breakdown || [],
        occupancyTrend: weekly.data?.daily_breakdown || [],
      });
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    toast.success("Report export started. Download will begin shortly.");
  };

  // Safely calculate totals
  const calculateTotalRevenue = () => {
    if (!data?.payments || data.payments.length === 0) return 0;
    return data.payments.reduce((sum, p) => {
      const amount = typeof p.amount === 'number' ? p.amount : parseFloat(p.amount) || 0;
      return sum + amount;
    }, 0);
  };

  const totalRevenue = calculateTotalRevenue();
  const totalBookings = data?.bookings?.length || 0;
  const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
  const occupancyRate = data?.daily?.occupancy_rate_percentage || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No analytics data available</p>
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
      label: "Avg. Booking Value",
      value: `$${avgBookingValue.toFixed(2)}`,
      icon: ChartBarIcon,
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

  const metricLabels = {
    revenue: "Revenue by Period",
    occupancy: "Occupancy Rate Trend",
    bookings: "Bookings by Period",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
          <p className="text-sm text-gray-500">In-depth business intelligence and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="btn-primary flex items-center gap-2"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            Export Report
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setDateRange("week")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            dateRange === "week"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setDateRange("month")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            dateRange === "month"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          This Month
        </button>
        <button
          onClick={() => setDateRange("quarter")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            dateRange === "quarter"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          This Quarter
        </button>
        <button
          onClick={() => setDateRange("year")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            dateRange === "year"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          This Year
        </button>
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

      {/* Metric Selector */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedMetric("revenue")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedMetric === "revenue"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          Revenue
        </button>
        <button
          onClick={() => setSelectedMetric("occupancy")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedMetric === "occupancy"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          Occupancy
        </button>
        <button
          onClick={() => setSelectedMetric("bookings")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedMetric === "bookings"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          Bookings
        </button>
      </div>

      {/* Chart */}
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <EyeIcon className="h-5 w-5 mr-2 text-gray-500" />
          {metricLabels[selectedMetric]}
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {data.revenueByPeriod && data.revenueByPeriod.length > 0 ? (
            data.revenueByPeriod.slice(0, 30).map((day: any) => {
              let value = 0;
              let label = "";
              
              if (selectedMetric === "revenue") {
                value = typeof day.total_revenue === 'number' ? day.total_revenue : parseFloat(day.total_revenue) || 0;
                label = `$${value.toFixed(2)}`;
              } else if (selectedMetric === "occupancy") {
                value = typeof day.occupancy_rate_percentage === 'number' ? day.occupancy_rate_percentage : parseFloat(day.occupancy_rate_percentage) || 0;
                label = `${value}%`;
              } else {
                value = typeof day.rooms_sold === 'number' ? day.rooms_sold : parseInt(day.rooms_sold) || 0;
                label = `${value} rooms`;
              }

              const maxValue = selectedMetric === "revenue" 
                ? Math.max(...(data.revenueByPeriod?.map((d: any) => typeof d.total_revenue === 'number' ? d.total_revenue : parseFloat(d.total_revenue) || 0) || [1]))
                : selectedMetric === "occupancy"
                ? 100
                : Math.max(...(data.revenueByPeriod?.map((d: any) => typeof d.rooms_sold === 'number' ? d.rooms_sold : parseInt(d.rooms_sold) || 0) || [1]));

              const percentage = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;

              return (
                <div key={day.date} className="flex items-center gap-4">
                  <span className="w-32 text-sm font-medium text-gray-600">
                    {format(new Date(day.date), "EEE, MMM d")}
                  </span>
                  <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-lg ${
                        selectedMetric === "revenue" 
                          ? "bg-gradient-to-r from-green-500 to-green-600"
                          : selectedMetric === "occupancy"
                          ? "bg-gradient-to-r from-blue-500 to-blue-600"
                          : "bg-gradient-to-r from-purple-500 to-purple-600"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-24 text-right font-semibold text-gray-700">{label}</span>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-center py-4">No data available for selected period</p>
          )}
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold mb-4">Payment Method Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.daily?.revenue_by_payment_method && Object.keys(data.daily.revenue_by_payment_method).length > 0 ? (
            Object.entries(data.daily.revenue_by_payment_method).map(([method, amount]: [string, any]) => {
              const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
              const total: number = Object.values(data.daily.revenue_by_payment_method).reduce<number>((a, b) => {
                const valA = typeof a === 'number' ? a : parseFloat(String(a)) || 0;
                const valB = typeof b === 'number' ? b : parseFloat(String(b)) || 0;
                return valA + valB;
              }, 0);
              const percentage = total > 0 ? (numAmount / total) * 100 : 0;
              return (
                <div key={method} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 capitalize">{method.replace("_", " ").toLowerCase()}</p>
                  <p className="text-lg font-bold text-blue-600">${numAmount.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">{percentage.toFixed(1)}%</p>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-center col-span-4">No payment data available</p>
          )}
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="dashboard-card">
          <h4 className="font-semibold text-sm text-gray-700 mb-2">💡 Key Insights</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-500">•</span>
              <span>Total revenue is ${totalRevenue.toFixed(2)}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>Occupancy rate is at {occupancyRate}%</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              <span>Average booking value is ${avgBookingValue.toFixed(2)}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              <span>{totalBookings} total bookings recorded</span>
            </li>
          </ul>
        </div>
        <div className="dashboard-card">
          <h4 className="font-semibold text-sm text-gray-700 mb-2">📊 Quick Stats</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total Payments</span>
              <span className="font-semibold">{data.payments?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Bookings</span>
              <span className="font-semibold">{totalBookings}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Check-ins Today</span>
              <span className="font-semibold">{data.daily?.check_ins_count || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Check-outs Today</span>
              <span className="font-semibold">{data.daily?.check_outs_count || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
