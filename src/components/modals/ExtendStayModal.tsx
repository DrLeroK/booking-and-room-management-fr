"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, CalendarDaysIcon, BanknotesIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { bookingAPI } from "@/lib/api/endpoints";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import { addDays, format, parseISO, differenceInCalendarDays } from "date-fns";

interface ExtendStayModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any | null;
  onSuccess: () => void;
}

export function ExtendStayModal({ isOpen, onClose, booking, onSuccess }: ExtendStayModalProps) {
  const [newCheckOutDate, setNewCheckOutDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [moneyReceived, setMoneyReceived] = useState<number | string>("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (booking?.check_out_date) {
      // Default to 1 day after current check out
      const currentCheckOut = parseISO(booking.check_out_date);
      const minNextDay = addDays(currentCheckOut, 1);
      const defaultDateStr = format(minNextDay, "yyyy-MM-dd");
      setNewCheckOutDate(defaultDateStr);

      const nightlyRate = Number(booking.nightly_rate || booking.room_details?.room_type_details?.base_price_per_night || 0);
      setMoneyReceived(nightlyRate);
    }
  }, [booking]);

  if (!isOpen || !booking) return null;

  const currentCheckOut = parseISO(booking.check_out_date);
  const minDateStr = format(addDays(currentCheckOut, 1), "yyyy-MM-dd");
  const nightlyRate = Number(booking.nightly_rate || booking.room_details?.room_type_details?.base_price_per_night || 0);

  let extensionNights = 0;
  let additionalCost = 0;

  if (newCheckOutDate) {
    const selectedDate = parseISO(newCheckOutDate);
    const diff = differenceInCalendarDays(selectedDate, currentCheckOut);
    if (diff > 0) {
      extensionNights = diff;
      additionalCost = diff * nightlyRate;
    }
  }

  const handleDateChange = (val: string) => {
    setNewCheckOutDate(val);
    if (val) {
      const selectedDate = parseISO(val);
      const diff = differenceInCalendarDays(selectedDate, currentCheckOut);
      if (diff > 0) {
        setMoneyReceived(diff * nightlyRate);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCheckOutDate) {
      toast.error("Please select a new departure date.");
      return;
    }

    if (extensionNights <= 0) {
      toast.error("New departure date must be after current check-out date.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await bookingAPI.extendStay({
        booking_id: booking.id,
        new_check_out_date: newCheckOutDate,
        money_received: moneyReceived ? Number(moneyReceived) : 0,
        payment_method: paymentMethod,
        notes: notes,
      });

      toast.success(response.data.message || "Stay extended successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      const errDetail = error.response?.data?.message || error.response?.data?.detail || "Failed to extend stay. Please check room availability.";
      toast.error(errDetail);
    } finally {
      setIsSubmitting(false);
    }
  };

  const guestName = booking.guest_details
    ? `${booking.guest_details.first_name} ${booking.guest_details.last_name || ""}`.trim()
    : "Guest";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <SparklesIcon className="h-4 w-4 text-yellow-400" />
            <span>Stay Extension</span>
          </div>
          <h2 className="text-2xl font-bold">Extend Stay Window</h2>
          <p className="text-blue-100 text-sm mt-1">
            Room {booking.room_details?.room_number || booking.room} • {guestName}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Summary Banner */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-xs">
            <div>
              <span className="text-gray-500 block">Current Check-out:</span>
              <span className="font-semibold text-gray-800">{booking.check_out_date}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Nightly Rate:</span>
              <span className="font-semibold text-blue-600">{formatCurrency(nightlyRate)} / night</span>
            </div>
          </div>

          {/* New Departure Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              New Departure Date
            </label>
            <div className="relative">
              <input
                type="date"
                min={minDateStr}
                value={newCheckOutDate}
                onChange={(e) => handleDateChange(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
              />
              <CalendarDaysIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Extended Calculation Box */}
          {extensionNights > 0 && (
            <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-4 flex items-center justify-between text-blue-900">
              <div>
                <span className="text-xs font-semibold uppercase text-blue-700 block">Extension Summary</span>
                <span className="text-lg font-bold">
                  +{extensionNights} {extensionNights === 1 ? "Night" : "Nights"} Extension
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-blue-700 block">Additional Cost</span>
                <span className="text-xl font-black text-blue-700">{formatCurrency(additionalCost)}</span>
              </div>
            </div>
          )}

          {/* Payment & Charges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              >
                <option value="CASH">Cash</option>
                <option value="CARD">Credit / Debit Card</option>
                <option value="ONLINE_TRANSFER">Bank Transfer</option>
                <option value="MOBILE_MONEY">Mobile Money</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Money Received Now (ETB)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={moneyReceived}
                  onChange={(e) => setMoneyReceived(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-900"
                />
                <BanknotesIcon className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* Receptionist Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Receptionist Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Guest requested extension due to flight reschedule..."
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-xs text-gray-900"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || extensionNights <= 0}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Extending...</span>
                </>
              ) : (
                <span>Confirm Extension</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
