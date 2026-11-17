"use client";

import { useState, useEffect } from "react";
import { paymentAPI, bookingAPI } from "@/lib/api/endpoints";
import {
  CreditCardIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  BuildingOfficeIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { format, differenceInDays } from "date-fns";

interface Payment {
  id: number;
  transaction_id: string;
  booking: number;
  amount: number;
  payment_type: string;
  payment_method: string;
  status: string;
  payment_date: string;
  transaction_reference?: string;
  payment_proof_url?: string;
  verification_notes?: string;
  verified_at?: string;
  verified_by?: string;
  recorded_by?: string;
  notes?: string;
  booking_details?: {
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
    check_in_date: string;
    check_out_date: string;
    total_amount: number;
    status: string;
    adults_count: number;
    children_count: number;
    special_requests?: string;
  };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [verifyAction, setVerifyAction] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [verifyNotes, setVerifyNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchingBookingDetails, setFetchingBookingDetails] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await paymentAPI.getPayments();
      setPayments(response.data.results || []);
    } catch (error) {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingDetails = async (bookingId: number) => {
    setFetchingBookingDetails(true);
    try {
      const response = await bookingAPI.getBooking(bookingId);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch booking details:", error);
      return null;
    } finally {
      setFetchingBookingDetails(false);
    }
  };

  const handleViewDetails = async (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
    
    // If booking details are missing, fetch them
    if (!payment.booking_details && payment.booking) {
      const bookingData = await fetchBookingDetails(payment.booking);
      if (bookingData) {
        setSelectedPayment((prev) => ({
          ...prev!,
          booking_details: {
            id: bookingData.id,
            booking_reference: bookingData.booking_reference,
            guest_details: {
              full_name: bookingData.guest_details?.full_name || "N/A",
              phone_number: bookingData.guest_details?.phone_number || "N/A",
              email: bookingData.guest_details?.email,
            },
            room_details: {
              room_number: bookingData.room_details?.room_number || "N/A",
              room_type_details: bookingData.room_details?.room_type_details,
            },
            check_in_date: bookingData.check_in_date,
            check_out_date: bookingData.check_out_date,
            total_amount: bookingData.total_amount,
            status: bookingData.status,
            adults_count: bookingData.adults_count,
            children_count: bookingData.children_count,
            special_requests: bookingData.special_requests,
          },
        }));
      }
    }
  };

  const handleVerifyClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setVerifyAction("APPROVE");
    setVerifyNotes("");
    setShowVerifyModal(true);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: any; label: string }> = {
      PENDING_VERIFICATION: { color: "bg-yellow-100 text-yellow-800", icon: ClockIcon, label: "Pending Verification" },
      SUCCESS: { color: "bg-green-100 text-green-800", icon: CheckCircleIcon, label: "Successful" },
      FAILED: { color: "bg-red-100 text-red-800", icon: XCircleIcon, label: "Failed" },
      REFUNDED: { color: "bg-gray-100 text-gray-800", icon: XCircleIcon, label: "Refunded" },
    };
    return config[status] || config.SUCCESS;
  };

  const getPaymentTypeDisplay = (type: string) => {
    const map: Record<string, string> = {
      DEPOSIT: "Security Deposit",
      CHECKIN_PAYMENT: "Check-in Payment",
      CHECKOUT_PAYMENT: "Check-out Payment",
      ADDITIONAL_CHARGE: "Additional Charge",
      ONLINE_PREPAYMENT: "Online Prepayment",
    };
    return map[type] || type;
  };

  const handleVerify = async () => {
    if (!selectedPayment) return;
    if (verifyAction === "REJECT" && !verifyNotes.trim()) {
      toast.error("Please provide a reason/notes for rejecting this payment proof.");
      return;
    }
    setIsSubmitting(true);
    try {
      await paymentAPI.verifyPayment({
        payment_id: selectedPayment.id,
        action: verifyAction,
        receptionist_name: "Receptionist",
        notes: verifyNotes,
      });
      toast.success(
        verifyAction === "APPROVE"
          ? "Payment approved successfully!"
          : "Payment rejected and room released back to available inventory!"
      );
      setShowVerifyModal(false);
      setSelectedPayment(null);
      fetchPayments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transaction_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.booking_details?.booking_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.booking_details?.guest_details?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = payments.filter(p => p.status === "PENDING_VERIFICATION").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payments Verification</h2>
          <p className="text-sm text-gray-500">Review and verify guest payment proofs</p>
        </div>
        {pendingCount > 0 && (
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg flex items-center gap-2 animate-pulse">
            <ClockIcon className="h-5 w-5" />
            {pendingCount} pending verifications
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by transaction, booking, or guest..."
            className="input-field"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field max-w-[200px]"
        >
          <option value="">All Status</option>
          <option value="PENDING_VERIFICATION">Pending Verification</option>
          <option value="SUCCESS">Successful</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
        <button onClick={fetchPayments} className="btn-secondary">
          Refresh
        </button>
      </div>

      {/* Payments Table */}
      <div className="dashboard-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 font-medium text-gray-500">Transaction</th>
                <th className="text-left py-3 font-medium text-gray-500">Guest</th>
                <th className="text-left py-3 font-medium text-gray-500">Booking</th>
                <th className="text-right py-3 font-medium text-gray-500">Amount</th>
                <th className="text-left py-3 font-medium text-gray-500">Type</th>
                <th className="text-center py-3 font-medium text-gray-500">Status</th>
                <th className="text-center py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => {
                const statusConfig = getStatusBadge(payment.status);
                const StatusIcon = statusConfig.icon;
                return (
                  <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3">
                      <div>
                        <p className="font-mono text-xs font-medium">{payment.transaction_id}</p>
                        {payment.transaction_reference && (
                          <p className="text-xs text-gray-400">Ref: {payment.transaction_reference}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      <div>
                        <p className="font-medium">{payment.booking_details?.guest_details?.full_name || "N/A"}</p>
                        <p className="text-xs text-gray-500">{payment.booking_details?.guest_details?.phone_number}</p>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="font-mono text-xs">{payment.booking_details?.booking_reference || "N/A"}</span>
                      <p className="text-xs text-gray-500">Room {payment.booking_details?.room_details?.room_number}</p>
                    </td>
                    <td className="py-3 text-right font-bold text-blue-600">${payment.amount}</td>
                    <td className="py-3 text-xs">{getPaymentTypeDisplay(payment.payment_type)}</td>
                    <td className="py-3 text-center">
                      <span className={`badge ${statusConfig.color} flex items-center gap-1 justify-center`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleViewDetails(payment)}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        {payment.status === "PENDING_VERIFICATION" && (
                          <button
                            onClick={() => handleVerifyClick(payment)}
                            className="p-1 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                            title="Verify Payment"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No payments found</p>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CreditCardIcon className="h-6 w-6 text-blue-600" />
                Payment Details
              </h3>
              <button
                onClick={() => { setShowDetailsModal(false); setSelectedPayment(null); }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {fetchingBookingDetails ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading booking details...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Transaction Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-1">
                      <DocumentTextIcon className="h-4 w-4" />
                      Transaction
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-500">ID:</span> <span className="font-mono">{selectedPayment.transaction_id}</span></p>
                      <p><span className="text-gray-500">Reference:</span> {selectedPayment.transaction_reference || "N/A"}</p>
                      <p><span className="text-gray-500">Date:</span> {format(new Date(selectedPayment.payment_date), "MMM d, yyyy h:mm a")}</p>
                      {selectedPayment.recorded_by && (
                        <p><span className="text-gray-500">Recorded By:</span> {selectedPayment.recorded_by}</p>
                      )}
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-1">
                      <CurrencyDollarIcon className="h-4 w-4" />
                      Payment Info
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-500">Amount:</span> <span className="font-bold text-blue-600">${selectedPayment.amount}</span></p>
                      <p><span className="text-gray-500">Type:</span> {getPaymentTypeDisplay(selectedPayment.payment_type)}</p>
                      <p><span className="text-gray-500">Method:</span> {selectedPayment.payment_method.replace("_", " ")}</p>
                      {selectedPayment.notes && (
                        <p><span className="text-gray-500">Notes:</span> {selectedPayment.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Guest Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-1">
                      <UserIcon className="h-4 w-4" />
                      Guest Information
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-500">Name:</span> <span className="font-medium">{selectedPayment.booking_details?.guest_details?.full_name || "N/A"}</span></p>
                      <p><span className="text-gray-500">Phone:</span> {selectedPayment.booking_details?.guest_details?.phone_number || "N/A"}</p>
                      {selectedPayment.booking_details?.guest_details?.email && (
                        <p><span className="text-gray-500">Email:</span> {selectedPayment.booking_details.guest_details.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Booking Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-1">
                      <BuildingOfficeIcon className="h-4 w-4" />
                      Booking Details
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-500">Reference:</span> <span className="font-mono">{selectedPayment.booking_details?.booking_reference || "N/A"}</span></p>
                      <p><span className="text-gray-500">Room:</span> {selectedPayment.booking_details?.room_details?.room_number || "N/A"}</p>
                      {selectedPayment.booking_details?.room_details?.room_type_details?.name && (
                        <p><span className="text-gray-500">Type:</span> {selectedPayment.booking_details.room_details.room_type_details.name}</p>
                      )}
                      <p><span className="text-gray-500">Status:</span> {selectedPayment.booking_details?.status || "N/A"}</p>
                    </div>
                  </div>

                  {/* Stay Details */}
                  <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      Stay Details
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Check-in</p>
                        <p className="font-medium">{selectedPayment.booking_details?.check_in_date ? format(new Date(selectedPayment.booking_details.check_in_date), "MMM d, yyyy") : "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Check-out</p>
                        <p className="font-medium">{selectedPayment.booking_details?.check_out_date ? format(new Date(selectedPayment.booking_details.check_out_date), "MMM d, yyyy") : "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Nights</p>
                        <p className="font-medium">
                          {selectedPayment.booking_details?.check_in_date && selectedPayment.booking_details?.check_out_date
                            ? differenceInDays(
                                new Date(selectedPayment.booking_details.check_out_date),
                                new Date(selectedPayment.booking_details.check_in_date)
                              )
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Guests</p>
                        <p className="font-medium">
                          {selectedPayment.booking_details?.adults_count || 0} adults
                          {selectedPayment.booking_details?.children_count ? `, ${selectedPayment.booking_details.children_count} children` : ""}
                        </p>
                      </div>
                    </div>
                    {selectedPayment.booking_details?.special_requests && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-gray-500 text-xs">Special Requests</p>
                        <p className="text-sm">{selectedPayment.booking_details.special_requests}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Proof */}
                {selectedPayment.payment_proof_url && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Payment Proof</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <img
                        src={selectedPayment.payment_proof_url}
                        alt="Payment Proof"
                        className="max-h-64 rounded-lg mx-auto"
                      />
                    </div>
                  </div>
                )}

                {/* Verification Status */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Verification Status</h4>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`badge ${selectedPayment.status === 'PENDING_VERIFICATION' ? 'badge-warning' : selectedPayment.status === 'SUCCESS' ? 'badge-success' : 'badge-danger'}`}>
                      {selectedPayment.status === 'PENDING_VERIFICATION' ? 'Pending' : selectedPayment.status === 'SUCCESS' ? 'Verified' : 'Failed'}
                    </span>
                    {selectedPayment.verified_at && (
                      <span className="text-xs text-gray-500">
                        by {selectedPayment.verified_by || 'System'} on {format(new Date(selectedPayment.verified_at), "MMM d, yyyy h:mm a")}
                      </span>
                    )}
                  </div>
                  {selectedPayment.verification_notes && (
                    <p className="text-sm text-gray-600 mt-2"><span className="font-medium">Notes:</span> {selectedPayment.verification_notes}</p>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  {selectedPayment.status === "PENDING_VERIFICATION" && (
                    <button
                      onClick={() => { setShowDetailsModal(false); handleVerifyClick(selectedPayment); }}
                      className="btn-primary flex-1"
                    >
                      Verify Payment
                    </button>
                  )}
                  <button
                    onClick={() => { setShowDetailsModal(false); setSelectedPayment(null); }}
                    className="btn-secondary flex-1"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Verify Modal */}
      {showVerifyModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CheckCircleIcon className="h-6 w-6 text-yellow-600" />
                Verify Payment
              </h3>
              <button
                onClick={() => { setShowVerifyModal(false); setSelectedPayment(null); }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Transaction</p>
                  <p className="font-medium font-mono text-xs">{selectedPayment.transaction_id}</p>
                </div>
                <div>
                  <p className="text-gray-500">Amount</p>
                  <p className="font-bold text-lg text-blue-600">${selectedPayment.amount}</p>
                </div>
                <div>
                  <p className="text-gray-500">Guest</p>
                  <p className="font-medium">{selectedPayment.booking_details?.guest_details?.full_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium">{selectedPayment.booking_details?.guest_details?.phone_number || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Booking</p>
                  <p className="font-medium font-mono text-xs">{selectedPayment.booking_details?.booking_reference || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Room</p>
                  <p className="font-medium">Room {selectedPayment.booking_details?.room_details?.room_number || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Stay</p>
                  <p className="font-medium">
                    {selectedPayment.booking_details?.check_in_date && selectedPayment.booking_details?.check_out_date
                      ? `${format(new Date(selectedPayment.booking_details.check_in_date), "MMM d")} - ${format(new Date(selectedPayment.booking_details.check_out_date), "MMM d, yyyy")}`
                      : "N/A"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Reference</p>
                  <p className="font-medium text-xs">{selectedPayment.transaction_reference || "N/A"}</p>
                </div>
              </div>
            </div>

            {selectedPayment.payment_proof_url && (
              <div className="mb-4">
                <div className="bg-gray-50 p-2 rounded-lg">
                  <img
                    src={selectedPayment.payment_proof_url}
                    alt="Payment Proof"
                    className="max-h-48 rounded-lg mx-auto"
                  />
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Decision *</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setVerifyAction("APPROVE")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    verifyAction === "APPROVE"
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  <CheckIcon className="h-4 w-4 inline mr-1" />
                  Approve Payment
                </button>
                <button
                  onClick={() => setVerifyAction("REJECT")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    verifyAction === "REJECT"
                      ? "bg-red-600 text-white font-bold"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  <XMarkIcon className="h-4 w-4 inline mr-1" />
                  Reject & Release Room
                </button>
              </div>
            </div>

            {verifyAction === "REJECT" && (
              <div className="mb-4 bg-red-50 border-2 border-red-500 rounded-xl p-4 text-red-900 shadow-sm">
                <div className="flex items-start gap-3">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black text-sm text-red-800 uppercase tracking-wide">
                      CRITICAL ACTION: Releasing Room to Available Inventory
                    </h4>
                    <p className="text-xs text-red-700 mt-1 leading-relaxed">
                      You are about to un-verify / reject this online booking (<strong>{selectedPayment.booking_details?.booking_reference || "N/A"}</strong>).
                    </p>
                    <div className="mt-2 text-xs bg-white/90 p-2.5 rounded-lg border border-red-200 space-y-1">
                      <p className="font-bold text-red-900">What happens immediately upon rejection:</p>
                      <ul className="list-disc pl-4 space-y-0.5 text-red-800">
                        <li>Payment status is updated to <strong>FAILED</strong>.</li>
                        <li>Reservation status is updated to <strong>CANCELLED</strong>.</li>
                        <li>
                          <strong>Room {selectedPayment.booking_details?.room_details?.room_number || "assigned"} is immediately released back to AVAILABLE status</strong> and can now be booked by walk-ins or other online guests.
                        </li>
                      </ul>
                    </div>
                    {selectedPayment.booking_details?.guest_details?.phone_number && (
                      <p className="text-xs font-semibold text-red-900 mt-2 flex items-center gap-1.5">
                        <PhoneIcon className="h-4 w-4 text-red-600 shrink-0" />
                        <span>Front Desk Protocol: Make sure you have attempted to call the guest at <strong>{selectedPayment.booking_details?.guest_details?.phone_number}</strong> before confirming rejection.</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {verifyAction === "APPROVE" ? "Approval Notes" : "Rejection Reason (Required) *"}
              </label>
              <textarea
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                className="input-field resize-none"
                rows={3}
                placeholder={verifyAction === "APPROVE" 
                  ? "Add verification notes (e.g., amount matches, proof valid)..." 
                  : "State reason for rejection & guest contact attempt (e.g., Fake transaction ID, called guest 3 times with no response)..."}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setShowVerifyModal(false); setSelectedPayment(null); }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                disabled={isSubmitting}
                className={`flex-1 text-white font-medium py-2 px-4 rounded-lg transition-colors ${
                  verifyAction === "APPROVE"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                } disabled:opacity-50 flex items-center justify-center gap-2`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {verifyAction === "APPROVE" ? (
                      <><CheckIcon className="h-4 w-4" /> Approve</>
                    ) : (
                      <><XMarkIcon className="h-4 w-4" /> Reject</>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
