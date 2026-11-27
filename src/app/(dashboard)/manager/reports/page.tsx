"use client";

import { useState, useEffect } from "react";
import { analyticsAPI } from "@/lib/api/endpoints";
import { ApiClient } from "@/lib/api";
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
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import { toast } from "react-hot-toast";
import { formatCurrency } from "@/lib/utils";

interface ReportData {
  daily: any;
  weekly: any;
  summary: any;
}

interface ExportData {
  type: 'bookings' | 'payments' | 'guests';
  label: string;
  icon: any;
  description: string;
}

const exportTypes: ExportData[] = [
  {
    type: 'bookings',
    label: 'Bookings',
    icon: CalendarIcon,
    description: 'Export all booking data with guest and room details',
  },
  {
    type: 'payments',
    label: 'Payments',
    icon: CurrencyDollarIcon,
    description: 'Export payment transaction history',
  },
  {
    type: 'guests',
    label: 'Guests',
    icon: UsersIcon,
    description: 'Export guest profiles and stay history',
  },
];

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [dateRange, setDateRange] = useState<"today" | "week" | "month" | "custom">("week");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [selectedMetric, setSelectedMetric] = useState<"revenue" | "occupancy" | "bookings">("revenue");
  const [exportType, setExportType] = useState<'bookings' | 'payments' | 'guests'>('bookings');
  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [daily, weekly, summary] = await Promise.all([
        analyticsAPI.getDaily(),
        analyticsAPI.getWeekly(),
        analyticsAPI.getSummary(),
      ]);

      setData({
        daily: daily.data,
        weekly: weekly.data,
        summary: summary.data,
      });
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      toast.error("Failed to load reports data");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExportStatus('loading');
    setExportLoading(true);
    
    try {
      let url = '';
      let params = new URLSearchParams();
      
      // Get date range
      let startDate = '';
      let endDate = '';
      
      if (dateRange === 'today') {
        const today = new Date();
        startDate = format(today, 'yyyy-MM-dd');
        endDate = format(today, 'yyyy-MM-dd');
      } else if (dateRange === 'week') {
        const start = startOfWeek(new Date(), { weekStartsOn: 1 });
        const end = endOfWeek(new Date(), { weekStartsOn: 1 });
        startDate = format(start, 'yyyy-MM-dd');
        endDate = format(end, 'yyyy-MM-dd');
      } else if (dateRange === 'month') {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        startDate = format(start, 'yyyy-MM-dd');
        endDate = format(end, 'yyyy-MM-dd');
      } else if (dateRange === 'custom') {
        if (!customStartDate || !customEndDate) {
          toast.error('Please select both start and end dates');
          setExportStatus('error');
          setExportLoading(false);
          return;
        }
        startDate = customStartDate;
        endDate = customEndDate;
      }
      
      // Build URL
      if (exportType === 'bookings') {
        url = '/analytics/export/bookings/';
      } else if (exportType === 'payments') {
        url = '/analytics/export/payments/';
      } else if (exportType === 'guests') {
        url = '/analytics/export/guests/';
      }
      
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const apiBase = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const fullUrl = `${apiBase}${url}?${params.toString()}`;
      
      // Fetch the CSV
      const token = ApiClient.getAccessToken();
      
      const response = await fetch(fullUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }
      
      // Download the file
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const filename = `${exportType}_export_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      setExportStatus('success');
      toast.success(`${exportType} exported successfully!`);
    } catch (error: any) {
      console.error('Export error:', error);
      setExportStatus('error');
      toast.error(error.message || 'Failed to export data');
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No report data available</p>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Revenue",
      value: `$${data.weekly?.total_weekly_revenue?.toFixed(2) || "0.00"}`,
      icon: CurrencyDollarIcon,
      color: "green",
      change: "+12.5%",
      trend: "up",
    },
    {
      label: "Average Occupancy",
      value: `${data.weekly?.average_weekly_occupancy_percentage || 0}%`,
      icon: ChartBarIcon,
      color: "blue",
      change: "+5.2%",
      trend: "up",
    },
    {
      label: "Total Bookings",
      value: data.weekly?.daily_breakdown?.reduce((acc: number, day: any) => acc + (day.rooms_sold || 0), 0) || 0,
      icon: CalendarIcon,
      color: "purple",
      change: "+8.3%",
      trend: "up",
    },
    {
      label: "ADR (Avg Daily Rate)",
      value: `$${data.daily?.average_daily_rate_adr?.toFixed(2) || "0.00"}`,
      icon: CurrencyDollarIcon,
      color: "orange",
      change: "+2.1%",
      trend: "up",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-sm text-gray-500">Comprehensive business intelligence and export tools</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchReports}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowPathIcon className="h-5 w-5" />
            Refresh
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

      {/* Daily Breakdown */}
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <EyeIcon className="h-5 w-5 mr-2 text-gray-500" />
          Daily Performance
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {data.weekly?.daily_breakdown?.slice(0, 7).map((day: any) => {
            const value = day.total_revenue || 0;
            const maxValue = Math.max(...(data.weekly?.daily_breakdown?.map((d: any) => d.total_revenue) || [1]));
            const percentage = Math.min((value / maxValue) * 100, 100);

            return (
              <div key={day.date} className="flex items-center gap-4">
                <span className="w-32 text-sm font-medium text-gray-600">
                  {format(new Date(day.date), "EEE, MMM d")}
                </span>
                <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full transition-all duration-500 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-24 text-right font-semibold text-gray-700">{formatCurrency(value)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Export Section */}
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <DocumentArrowDownIcon className="h-5 w-5 mr-2 text-gray-500" />
          Export Reports
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Export data in CSV format for further analysis
        </p>

        {/* Export Type Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {exportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.type}
                onClick={() => setExportType(type.type)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  exportType === type.type
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <Icon className={`h-6 w-6 mb-2 ${exportType === type.type ? "text-blue-600" : "text-gray-500"}`} />
                <p className="font-medium text-gray-900">{type.label}</p>
                <p className="text-xs text-gray-500">{type.description}</p>
              </button>
            );
          })}
        </div>

        {/* Date Range Selection */}
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={() => setDateRange("today")}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              dateRange === "today"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setDateRange("week")}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              dateRange === "week"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setDateRange("month")}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              dateRange === "month"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setDateRange("custom")}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              dateRange === "custom"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            Custom
          </button>
        </div>

        {/* Custom Date Range */}
        {dateRange === "custom" && (
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        )}

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={exportLoading}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {exportLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Generating Report...
            </>
          ) : (
            <>
              <DocumentArrowDownIcon className="h-5 w-5" />
              Export {exportType.charAt(0).toUpperCase() + exportType.slice(1)} Data
            </>
          )}
        </button>

        {exportStatus === 'success' && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            Export completed successfully! Your file has been downloaded.
          </div>
        )}
        {exportStatus === 'error' && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-center gap-2">
            <XCircleIcon className="h-5 w-5 text-red-600" />
            Export failed. Please try again.
          </div>
        )}
      </div>
    </div>
  );
}




















// "use client";

// import { useState, useEffect } from "react";
// import { analyticsAPI, bookingAPI, paymentAPI } from "@/lib/api/endpoints";
// import {
//   ChartBarIcon,
//   CurrencyDollarIcon,
//   UsersIcon,
//   BuildingOfficeIcon,
//   CalendarIcon,
//   ArrowTrendingUpIcon,
//   ArrowTrendingDownIcon,
//   DocumentArrowDownIcon,
//   EyeIcon,
// } from "@heroicons/react/24/outline";
// import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
// import { toast } from "react-hot-toast";

// interface ReportData {
//   daily: any;
//   weekly: any;
//   summary: any;
//   payments: any[];
//   bookings: any[];
// }

// export default function ReportsPage() {
//   const [data, setData] = useState<ReportData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [dateRange, setDateRange] = useState<"today" | "week" | "month">("week");
//   const [selectedMetric, setSelectedMetric] = useState<"revenue" | "occupancy" | "bookings">("revenue");

//   useEffect(() => {
//     fetchReports();
//   }, [dateRange]);

//   const fetchReports = async () => {
//     setLoading(true);
//     try {
//       const [daily, weekly, summary, payments, bookings] = await Promise.all([
//         analyticsAPI.getDaily(),
//         analyticsAPI.getWeekly(),
//         analyticsAPI.getSummary(),
//         paymentAPI.getPayments({ status: "SUCCESS" }),
//         bookingAPI.getBookings({ status: "CHECKED_OUT" }),
//       ]);

//       setData({
//         daily: daily.data,
//         weekly: weekly.data,
//         summary: summary.data,
//         payments: payments.data?.results || [],
//         bookings: bookings.data?.results || [],
//       });
//     } catch (error) {
//       console.error("Failed to fetch reports:", error);
//       toast.error("Failed to load reports data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleExport = () => {
//     toast.success("Report export started. Download will begin shortly.");
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading reports...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!data) {
//     return (
//       <div className="text-center py-12">
//         <p className="text-gray-500">No report data available</p>
//       </div>
//     );
//   }

//   const stats = [
//     {
//       label: "Total Revenue",
//       value: `$${data.weekly?.total_weekly_revenue?.toFixed(2) || "0.00"}`,
//       icon: CurrencyDollarIcon,
//       color: "green",
//       change: "+12.5%",
//       trend: "up",
//     },
//     {
//       label: "Average Occupancy",
//       value: `${data.weekly?.average_weekly_occupancy_percentage || 0}%`,
//       icon: ChartBarIcon,
//       color: "blue",
//       change: "+5.2%",
//       trend: "up",
//     },
//     {
//       label: "Total Bookings",
//       value: data.bookings?.length || 0,
//       icon: CalendarIcon,
//       color: "purple",
//       change: "+8.3%",
//       trend: "up",
//     },
//     {
//       label: "ADR (Avg Daily Rate)",
//       value: `$${data.daily?.average_daily_rate_adr?.toFixed(2) || "0.00"}`,
//       icon: CurrencyDollarIcon,
//       color: "orange",
//       change: "+2.1%",
//       trend: "up",
//     },
//   ];

//   const metricLabels = {
//     revenue: "Revenue by Day",
//     occupancy: "Occupancy Rate",
//     bookings: "Bookings by Day",
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-wrap items-center justify-between gap-4">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
//           <p className="text-sm text-gray-500">Comprehensive business intelligence and performance metrics</p>
//         </div>
//         <div className="flex gap-2">
//           <button
//             onClick={handleExport}
//             className="btn-primary flex items-center gap-2"
//           >
//             <DocumentArrowDownIcon className="h-5 w-5" />
//             Export Report
//           </button>
//         </div>
//       </div>

//       {/* Date Range Selector */}
//       <div className="flex flex-wrap gap-2">
//         <button
//           onClick={() => setDateRange("today")}
//           className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
//             dateRange === "today"
//               ? "bg-blue-600 text-white"
//               : "bg-gray-200 hover:bg-gray-300 text-gray-700"
//           }`}
//         >
//           Today
//         </button>
//         <button
//           onClick={() => setDateRange("week")}
//           className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
//             dateRange === "week"
//               ? "bg-blue-600 text-white"
//               : "bg-gray-200 hover:bg-gray-300 text-gray-700"
//           }`}
//         >
//           This Week
//         </button>
//         <button
//           onClick={() => setDateRange("month")}
//           className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
//             dateRange === "month"
//               ? "bg-blue-600 text-white"
//               : "bg-gray-200 hover:bg-gray-300 text-gray-700"
//           }`}
//         >
//           This Month
//         </button>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         {stats.map((stat) => {
//           const Icon = stat.icon;
//           return (
//             <div key={stat.label} className="dashboard-card">
//               <div className="flex items-center justify-between">
//                 <div className="flex-1">
//                   <p className="text-sm text-gray-500">{stat.label}</p>
//                   <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
//                 </div>
//                 <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
//                   <Icon className={`h-6 w-6 text-${stat.color}-600`} />
//                 </div>
//               </div>
//               <div className="mt-3 flex items-center gap-1">
//                 {stat.trend === "up" ? (
//                   <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
//                 ) : (
//                   <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
//                 )}
//                 <span className={`text-sm font-medium ${
//                   stat.trend === "up" ? "text-green-600" : "text-red-600"
//                 }`}>
//                   {stat.change}
//                 </span>
//                 <span className="text-sm text-gray-500">from last period</span>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Metric Selector */}
//       <div className="flex flex-wrap gap-2">
//         <button
//           onClick={() => setSelectedMetric("revenue")}
//           className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
//             selectedMetric === "revenue"
//               ? "bg-blue-600 text-white"
//               : "bg-gray-200 hover:bg-gray-300 text-gray-700"
//           }`}
//         >
//           Revenue
//         </button>
//         <button
//           onClick={() => setSelectedMetric("occupancy")}
//           className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
//             selectedMetric === "occupancy"
//               ? "bg-blue-600 text-white"
//               : "bg-gray-200 hover:bg-gray-300 text-gray-700"
//           }`}
//         >
//           Occupancy
//         </button>
//         <button
//           onClick={() => setSelectedMetric("bookings")}
//           className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
//             selectedMetric === "bookings"
//               ? "bg-blue-600 text-white"
//               : "bg-gray-200 hover:bg-gray-300 text-gray-700"
//           }`}
//         >
//           Bookings
//         </button>
//       </div>

//       {/* Daily Breakdown Chart */}
//       <div className="dashboard-card">
//         <h3 className="text-lg font-semibold mb-4 flex items-center">
//           <EyeIcon className="h-5 w-5 mr-2 text-gray-500" />
//           {metricLabels[selectedMetric]}
//         </h3>
//         <div className="space-y-3 max-h-96 overflow-y-auto">
//           {data.weekly?.daily_breakdown?.slice(0, 7).map((day: any) => {
//             let value = 0;
//             let label = "";
            
//             if (selectedMetric === "revenue") {
//               value = day.total_revenue || 0;
//               label = `$${value.toFixed(2)}`;
//             } else if (selectedMetric === "occupancy") {
//               value = day.occupancy_rate_percentage || 0;
//               label = `${value}%`;
//             } else {
//               value = day.rooms_sold || 0;
//               label = `${value} rooms`;
//             }

//             const maxValue = selectedMetric === "revenue" 
//               ? Math.max(...(data.weekly?.daily_breakdown?.map((d: any) => d.total_revenue) || [1]))
//               : selectedMetric === "occupancy"
//               ? 100
//               : Math.max(...(data.weekly?.daily_breakdown?.map((d: any) => d.rooms_sold) || [1]));

//             const percentage = Math.min((value / maxValue) * 100, 100);

//             return (
//               <div key={day.date} className="flex items-center gap-4">
//                 <span className="w-32 text-sm font-medium text-gray-600">
//                   {format(new Date(day.date), "EEE, MMM d")}
//                 </span>
//                 <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
//                   <div
//                     className={`h-full transition-all duration-500 rounded-lg ${
//                       selectedMetric === "revenue" 
//                         ? "bg-gradient-to-r from-blue-500 to-blue-600"
//                         : selectedMetric === "occupancy"
//                         ? "bg-gradient-to-r from-green-500 to-green-600"
//                         : "bg-gradient-to-r from-purple-500 to-purple-600"
//                     }`}
//                     style={{ width: `${percentage}%` }}
//                   />
//                 </div>
//                 <span className="w-24 text-right font-semibold text-gray-700">{label}</span>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* Room Types Performance */}
//       <div className="dashboard-card">
//         <h3 className="text-lg font-semibold mb-4 flex items-center">
//           <BuildingOfficeIcon className="h-5 w-5 mr-2 text-gray-500" />
//           Room Types Performance
//         </h3>
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="border-b border-gray-200">
//                 <th className="text-left py-2 font-medium text-gray-500">Room Type</th>
//                 <th className="text-right py-2 font-medium text-gray-500">Bookings</th>
//                 <th className="text-right py-2 font-medium text-gray-500">Revenue</th>
//                 <th className="text-right py-2 font-medium text-gray-500">Avg. Rate</th>
//               </tr>
//             </thead>
//             <tbody>
//               {data.weekly?.room_types_performance?.map((type: any) => (
//                 <tr key={type.room_type_id} className="border-b border-gray-100 hover:bg-gray-50">
//                   <td className="py-2 font-medium">{type.room_type_name}</td>
//                   <td className="py-2 text-right">{type.bookings_count}</td>
//                   <td className="py-2 text-right font-semibold text-blue-600">
//                     ${type.total_revenue.toFixed(2)}
//                   </td>
//                   <td className="py-2 text-right">
//                     ${(type.total_revenue / type.bookings_count).toFixed(2) || "0.00"}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Revenue by Payment Method */}
//       <div className="dashboard-card">
//         <h3 className="text-lg font-semibold mb-4">Revenue by Payment Method</h3>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           {data.daily?.revenue_by_payment_method &&
//             Object.entries(data.daily.revenue_by_payment_method).map(([method, amount]: [string, any]) => (
//               <div key={method} className="text-center p-4 bg-gray-50 rounded-lg">
//                 <p className="text-sm text-gray-500 capitalize">{method.replace("_", " ").toLowerCase()}</p>
//                 <p className="text-lg font-bold text-blue-600">${Number(amount).toFixed(2)}</p>
//               </div>
//             ))}
//         </div>
//       </div>
//     </div>
//   );
// }
