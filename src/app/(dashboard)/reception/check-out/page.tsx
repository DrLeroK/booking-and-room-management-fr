"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { bookingAPI } from "@/lib/api/endpoints";
import {
  MagnifyingGlassIcon,
  CheckIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { format, differenceInDays } from "date-fns";

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
    };
  };
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
  status: string;
  nightly_rate: number;
  payments?: any[];
  check_in_record?: {
    actual_check_in_time: string;
    receptionist_name: string;
  };
}

export default function CheckOutPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkOutData, setCheckOutData] = useState({
    additional_charges: 0,
    additional_charges_notes: "",
    final_amount_paid: 0,
    payment_method: "CASH",
    room_inspected: true,
    notes: "",
  });

  useEffect(() => {
    fetchCheckedInGuests();
  }, []);

  const fetchCheckedInGuests = async () => {
    setIsLoading(true);
    try {
      const response = await bookingAPI.getBookings({
        status: "CHECKED_IN",
      });
      setBookings(response.data.results || []);
    } catch (error) {
      toast.error("Failed to fetch checked-in guests");
    } finally {
      setIsLoading(false);
    }
  };

  const searchBookings = async () => {
    if (searchTerm.length < 2) {
      fetchCheckedInGuests();
      return;
    }
    setIsLoading(true);
    try {
      const response = await bookingAPI.getBookings({
        status: "CHECKED_IN",
        search: searchTerm,
      });
      setBookings(response.data.results || []);
    } catch (error) {
      toast.error("Failed to search bookings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setCheckOutData({
      ...checkOutData,
      final_amount_paid: booking.total_amount,
    });
  };

  const handleCheckOut = async () => {
    if (!selectedBooking) {
      toast.error("Please select a booking");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        booking_id: selectedBooking.id,
        additional_charges: checkOutData.additional_charges,
        additional_charges_notes: checkOutData.additional_charges_notes,
        final_amount_paid: checkOutData.final_amount_paid,
        payment_method: checkOutData.payment_method,
        room_inspected: checkOutData.room_inspected,
        receptionist_name: "Receptionist",
        notes: checkOutData.notes,
      };

      await bookingAPI.checkout(payload);
      toast.success("Check-out completed successfully!");
      router.push("/reception");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Check-out failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickCheckOut = async (booking: Booking) => {
    if (!confirm(`Check out ${booking.guest_details?.full_name} from Room ${booking.room_details?.room_number}?`)) return;
    
    setIsLoading(true);
    try {
      const payload = {
        booking_id: booking.id,
        additional_charges: 0,
        additional_charges_notes: "",
        final_amount_paid: booking.total_amount,
        payment_method: "CASH",
        room_inspected: true,
        receptionist_name: "Receptionist",
        notes: "Quick check-out",
      };

      await bookingAPI.checkout(payload);
      toast.success(`${booking.guest_details?.full_name} checked out successfully!`);
      fetchCheckedInGuests();
      if (selectedBooking?.id === booking.id) {
        setSelectedBooking(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Check-out failed");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      CHECKED_IN: "bg-green-100 text-green-800",
      CHECKED_OUT: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Check-out Guest</h2>
          <p className="text-sm text-gray-500">Process guest departure and final payment</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {bookings.length} guests currently checked in
          </span>
          <button onClick={fetchCheckedInGuests} className="btn-secondary text-sm">
            Refresh
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Search and Active Guests List */}
        <div className="dashboard-card">
          <div className="flex gap-2 mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchBookings()}
                placeholder="Search by name, room, or booking..."
                className="input-field"
              />
            </div>
            <button onClick={searchBookings} className="btn-primary flex items-center gap-1">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          </div>

          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-gray-500" />
            Active Guests ({bookings.length})
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {bookings.map((booking) => {
              const isSelected = selectedBooking?.id === booking.id;
              const nights = differenceInDays(
                new Date(booking.check_out_date),
                new Date(booking.check_in_date)
              );
              
              return (
                <div
                  key={booking.id}
                  className={`p-4 border rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? "border-blue-600 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                  onClick={() => handleSelectBooking(booking)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">
                          {booking.guest_details?.full_name}
                        </p>
                        <span className="badge badge-success text-xs">Checked In</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 text-sm">
                        <p className="text-gray-500 flex items-center gap-1">
                          <BuildingOfficeIcon className="h-3 w-3" />
                          Room {booking.room_details?.room_number}
                        </p>
                        <p className="text-gray-500 flex items-center gap-1">
                          <UserIcon className="h-3 w-3" />
                          {booking.guest_details?.phone_number}
                        </p>
                        <p className="text-gray-500 flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {format(new Date(booking.check_in_date), "MMM d")} -{" "}
                          {format(new Date(booking.check_out_date), "MMM d, yyyy")}
                        </p>
                        <p className="text-gray-500">
                          {nights} night{nights > 1 ? "s" : ""}
                        </p>
                      </div>
                      {booking.room_details?.room_type_details?.name && (
                        <p className="text-xs text-gray-400 mt-1">
                          {booking.room_details.room_type_details.name}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-blue-600">${booking.total_amount}</p>
                      <p className="text-xs text-gray-500">Total</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickCheckOut(booking);
                        }}
                        disabled={isLoading}
                        className="mt-2 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors disabled:opacity-50"
                      >
                        Quick Check-out
                      </button>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                      <CheckIcon className="h-3 w-3" />
                      Selected for check-out
                    </div>
                  )}
                </div>
              );
            })}

            {bookings.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <UsersIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No active guests checked in</p>
                <p className="text-sm">All guests have been checked out</p>
              </div>
            )}
          </div>
        </div>

        {/* Check-out Form */}
        <div className="dashboard-card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <ClipboardDocumentListIcon className="h-5 w-5 text-gray-500" />
            Check-out Details
          </h3>
          {selectedBooking ? (
            <div className="space-y-4">
              {/* Guest Summary */}
              <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Guest</p>
                  <p className="font-semibold">{selectedBooking.guest_details?.full_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Room</p>
                  <p className="font-semibold">Room {selectedBooking.room_details?.room_number}</p>
                </div>
                <div>
                  <p className="text-gray-500">Booking</p>
                  <p className="font-mono text-xs">{selectedBooking.booking_reference}</p>
                </div>
                <div>
                  <p className="text-gray-500">Check-in</p>
                  <p className="font-semibold">{format(new Date(selectedBooking.check_in_date), "MMM d, yyyy")}</p>
                </div>
                <div>
                  <p className="text-gray-500">Check-out</p>
                  <p className="font-semibold">{format(new Date(selectedBooking.check_out_date), "MMM d, yyyy")}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Amount</p>
                  <p className="font-bold text-blue-600">${selectedBooking.total_amount}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Charges
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={checkOutData.additional_charges}
                    onChange={(e) =>
                      setCheckOutData({
                        ...checkOutData,
                        additional_charges: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={checkOutData.payment_method}
                    onChange={(e) =>
                      setCheckOutData({ ...checkOutData, payment_method: e.target.value })
                    }
                    className="input-field"
                  >
                    <option value="CASH">Cash</option>
                    <option value="CARD">Credit/Debit Card</option>
                    <option value="MOBILE_MONEY">Mobile Money</option>
                    <option value="ONLINE_TRANSFER">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Charges Notes
                </label>
                <input
                  type="text"
                  value={checkOutData.additional_charges_notes}
                  onChange={(e) =>
                    setCheckOutData({
                      ...checkOutData,
                      additional_charges_notes: e.target.value,
                    })
                  }
                  className="input-field"
                  placeholder="e.g., Mini bar, room service, damages..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Final Amount Paid
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={checkOutData.final_amount_paid}
                  onChange={(e) =>
                    setCheckOutData({
                      ...checkOutData,
                      final_amount_paid: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="input-field"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={checkOutData.notes}
                  onChange={(e) => setCheckOutData({ ...checkOutData, notes: e.target.value })}
                  className="input-field resize-none"
                  rows={2}
                  placeholder="Any special notes about this check-out..."
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={checkOutData.room_inspected}
                  onChange={(e) =>
                    setCheckOutData({ ...checkOutData, room_inspected: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Room inspected</span>
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="btn-secondary flex-1"
                >
                  Change Guest
                </button>
                <button
                  onClick={handleCheckOut}
                  disabled={isLoading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <CheckIcon className="h-5 w-5" />
                  {isLoading ? "Processing..." : "Complete Check-out"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <ClipboardDocumentListIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">Select a guest to check out</p>
              <p className="text-sm">Choose an active guest from the list on the left</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
