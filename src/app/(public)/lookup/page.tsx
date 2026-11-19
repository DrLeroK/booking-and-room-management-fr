"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { bookingAPI } from "@/lib/api/endpoints";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { normalizeEthiopianPhone } from "@/lib/utils";
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  UserIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

interface Booking {
  id: number;
  booking_reference: string;
  guest_details: {
    full_name: string;
    phone_number: string;
    email?: string;
  };
  room_details: {
    room_number: string;
    room_type_details?: {
      name: string;
      base_price_per_night: number;
    };
  };
  status: string;
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
  nightly_rate: number;
  adults_count: number;
  children_count: number;
  special_requests?: string;
  created_at?: string;
  total_nights?: number;
  payments?: Array<{
    id: number;
    amount: number;
    status: string;
    payment_method: string;
    payment_date: string;
  }>;
}

export default function LookupPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const performSearch = async () => {
    const trimmedPhone = phoneNumber.trim();
    
    if (!trimmedPhone) {
      toast.error("Please enter your phone number");
      return;
    }

    if (trimmedPhone.length < 8) {
      toast.error("Please enter a valid phone number (at least 8 digits)");
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    setSearched(true);

    try {
      const normalizedPhone = normalizeEthiopianPhone(trimmedPhone);
      console.log("Looking up booking with phone:", normalizedPhone);

      const response = await bookingAPI.lookupBooking({ 
        phone_number: normalizedPhone 
      });
      
      const bookingData = response.data?.bookings || [];
      setBookings(bookingData);

      if (bookingData.length === 0) {
        const msg = "No bookings found for this phone number. Please check and try again.";
        setErrorMessage(msg);
        toast.error(msg);
      } else {
        toast.success(`${bookingData.length} booking(s) found`);
        setSelectedBooking(bookingData[0]);
      }
    } catch (error: any) {
      console.error("Lookup error:", error);
      
      let errorMsg = "Failed to lookup bookings. Please try again.";
      
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          const firstError = Object.values(errorData)[0];
          if (Array.isArray(firstError)) {
            errorMsg = firstError[0] || errorMsg;
          } else if (typeof firstError === 'string') {
            errorMsg = firstError;
          }
        } else if (typeof errorData === 'string') {
          errorMsg = errorData;
        }
        
        if (errorMsg.toLowerCase().includes('phone')) {
          errorMsg = "Please enter a valid phone number with country code (e.g., +251 911 000 000)";
        }
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      performSearch();
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: any; label: string }> = {
      PENDING_PAYMENT_VERIFICATION: { 
        color: "bg-yellow-100 text-yellow-800", 
        icon: ClockIcon, 
        label: "Pending Verification" 
      },
      CONFIRMED: { 
        color: "bg-blue-100 text-blue-800", 
        icon: CheckCircleIcon, 
        label: "Confirmed" 
      },
      CHECKED_IN: { 
        color: "bg-green-100 text-green-800", 
        icon: CheckCircleIcon, 
        label: "Checked In" 
      },
      CHECKED_OUT: { 
        color: "bg-gray-100 text-gray-800", 
        icon: XCircleIcon, 
        label: "Checked Out" 
      },
      CANCELLED: { 
        color: "bg-red-100 text-red-800", 
        icon: XCircleIcon, 
        label: "Cancelled" 
      },
      NO_SHOW: { 
        color: "bg-red-100 text-red-800", 
        icon: XCircleIcon, 
        label: "No Show" 
      },
    };
    return config[status] || config.PENDING_PAYMENT_VERIFICATION;
  };

  const getPaymentStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string }> = {
      SUCCESS: { color: "bg-green-100 text-green-800", label: "Paid" },
      PENDING_VERIFICATION: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      FAILED: { color: "bg-red-100 text-red-800", label: "Failed" },
      REFUNDED: { color: "bg-gray-100 text-gray-800", label: "Refunded" },
    };
    return config[status] || config.PENDING_VERIFICATION;
  };

  const formatPhoneNumber = (phone: string) => {
    // Simple formatting - just return as is
    return phone;
  };

  return (
    <>
      <Header />
      <main className="container-custom py-12">
        <h1 className="text-4xl font-bold text-center mb-4">Check Your Booking</h1>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8">
          Enter your phone number to view your booking details and status.
        </p>

        <div className="max-w-md mx-auto mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your phone number"
                  className="input-field pl-10"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Enter the phone number you used when booking (e.g., +251 911 000 000)
              </p>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Searching...
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="h-5 w-5" />
                  Lookup Booking
                </>
              )}
            </button>
          </form>
        </div>

        {errorMessage && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-600 font-medium">{errorMessage}</p>
              <p className="text-xs text-red-500 mt-1">
                Make sure you're using the same phone number you provided when booking.
              </p>
            </div>
          </div>
        )}

        {searched && !isLoading && bookings.length === 0 && !errorMessage && (
          <div className="text-center py-12 card p-8 max-w-2xl mx-auto">
            <MagnifyingGlassIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No bookings found.</p>
            <p className="text-sm text-gray-400 mt-1">No bookings found for this phone number.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <a href="/booking" className="btn-primary inline-block">
                Book a Room
              </a>
              <button
                onClick={() => {
                  setPhoneNumber("");
                  setSearched(false);
                  setErrorMessage(null);
                  setBookings([]);
                  setSelectedBooking(null);
                }}
                className="btn-secondary inline-block"
              >
                Clear Search
              </button>
            </div>
          </div>
        )}

        {searched && bookings.length > 0 && (
          <div className="space-y-6 max-w-3xl mx-auto">
            {/* Booking List */}
            {bookings.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {bookings.map((booking) => (
                  <button
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      selectedBooking?.id === booking.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {booking.booking_reference}
                  </button>
                ))}
              </div>
            )}

            {selectedBooking && (
              <div className="card p-6">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {selectedBooking.booking_reference}
                      </h3>
                      <span
                        className={`badge ${getStatusBadge(selectedBooking.status).color} flex items-center gap-1`}
                      >
                        {(() => {
                          const status = getStatusBadge(selectedBooking.status);
                          const Icon = status.icon;
                          return (
                            <>
                              <Icon className="h-3 w-3" />
                              {status.label}
                            </>
                          );
                        })()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Booked on {format(new Date(selectedBooking.created_at || new Date()), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      ${selectedBooking.total_amount}
                    </p>
                    <p className="text-sm text-gray-500">Total Amount</p>
                  </div>
                </div>

                {/* Guest Details */}
                <div className="grid md:grid-cols-2 gap-4 py-4 border-b border-gray-100">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <UserIcon className="h-4 w-4" />
                      Guest Information
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-500">Name:</span> {selectedBooking.guest_details?.full_name || "N/A"}</p>
                      <p><span className="text-gray-500">Phone:</span> {selectedBooking.guest_details?.phone_number || "N/A"}</p>
                      {selectedBooking.guest_details?.email && (
                        <p><span className="text-gray-500">Email:</span> {selectedBooking.guest_details.email}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <BuildingOfficeIcon className="h-4 w-4" />
                      Room Details
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-500">Room:</span> {selectedBooking.room_details?.room_number || "N/A"}</p>
                      {selectedBooking.room_details?.room_type_details && (
                        <>
                          <p><span className="text-gray-500">Type:</span> {selectedBooking.room_details.room_type_details.name}</p>
                          <p><span className="text-gray-500">Rate:</span> ${selectedBooking.nightly_rate}/night</p>
                        </>
                      )}
                      <p><span className="text-gray-500">Guests:</span> {selectedBooking.adults_count} adults{selectedBooking.children_count > 0 ? `, ${selectedBooking.children_count} children` : ""}</p>
                    </div>
                  </div>
                </div>

                {/* Stay Dates */}
                <div className="grid md:grid-cols-2 gap-4 py-4 border-b border-gray-100">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      Stay Dates
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-500">Check-in:</span> {format(new Date(selectedBooking.check_in_date), "EEEE, MMMM d, yyyy")}</p>
                      <p><span className="text-gray-500">Check-out:</span> {format(new Date(selectedBooking.check_out_date), "EEEE, MMMM d, yyyy")}</p>
                      <p><span className="text-gray-500">Nights:</span> {selectedBooking.total_nights || 0}</p>
                    </div>
                  </div>
                  {selectedBooking.special_requests && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <EnvelopeIcon className="h-4 w-4" />
                        Special Requests
                      </h4>
                      <p className="text-sm text-gray-600">{selectedBooking.special_requests}</p>
                    </div>
                  )}
                </div>

                {/* Payments */}
                {selectedBooking.payments && selectedBooking.payments.length > 0 && (
                  <div className="py-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <CreditCardIcon className="h-4 w-4" />
                      Payment History
                    </h4>
                    <div className="space-y-2">
                      {selectedBooking.payments.map((payment) => {
                        const paymentStatus = getPaymentStatusBadge(payment.status);
                        return (
                          <div key={payment.id} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                            <div>
                              <p className="font-medium">${payment.amount}</p>
                              <p className="text-xs text-gray-500">{payment.payment_method}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500">
                                {format(new Date(payment.payment_date), "MMM d, yyyy")}
                              </span>
                              <span className={`badge ${paymentStatus.color}`}>
                                {paymentStatus.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Status Messages */}
                <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
                  {selectedBooking.status === "PENDING_PAYMENT_VERIFICATION" && (
                    <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 flex items-start gap-2">
                      <ClockIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <span>Your booking is pending payment verification. Please wait for our team to confirm.</span>
                    </div>
                  )}
                  {selectedBooking.status === "CONFIRMED" && (
                    <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 flex items-start gap-2">
                      <CheckCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Your booking is confirmed! We look forward to welcoming you.</span>
                    </div>
                  )}
                  {selectedBooking.status === "CHECKED_IN" && (
                    <div className="w-full bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 flex items-start gap-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>You are currently checked in. Enjoy your stay!</span>
                    </div>
                  )}
                  {selectedBooking.status === "CHECKED_OUT" && (
                    <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600 flex items-start gap-2">
                      <XCircleIcon className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                      <span>You have checked out. Thank you for staying with us!</span>
                    </div>
                  )}
                  {selectedBooking.status === "CANCELLED" && (
                    <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800 flex items-start gap-2">
                      <XCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span>This booking has been cancelled.</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200">
                  <a href="/booking" className="btn-primary flex-1 text-center">
                    Book Another Stay
                  </a>
                  <button
                    onClick={() => {
                      setPhoneNumber("");
                      setSearched(false);
                      setErrorMessage(null);
                      setBookings([]);
                      setSelectedBooking(null);
                    }}
                    className="btn-secondary flex-1 text-center"
                  >
                    New Search
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
