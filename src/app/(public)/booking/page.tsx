"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { bookingAPI, roomAPI, bankAPI } from "@/lib/api/endpoints";
import toast from "react-hot-toast";
import { format, addDays, differenceInDays } from "date-fns";
import { normalizeEthiopianPhone, getImageUrl, formatCurrency } from "@/lib/utils";
import {
  CalendarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CheckIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  HomeIcon,
  UserIcon,
  DocumentArrowUpIcon,
  MagnifyingGlassIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  ClockIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

// Validation schemas
const bookingSchema = z.object({
  check_in_date: z.string().min(1, "Check-in date is required"),
  check_out_date: z.string().min(1, "Check-out date is required"),
  guests_count: z.number().min(1, "At least 1 guest required").max(10, "Max 10 guests"),
  room_type_id: z.number().optional(),
});

const guestSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().optional(),
  phone_number: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  identification_type: z.string(),
  identification_number: z.string().optional(),
  address: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;
type GuestFormData = z.infer<typeof guestSchema>;

interface Room {
  id: number;
  room_number: string;
  floor: number;
  room_type_details?: {
    id: number;
    name: string;
    code: string;
    base_price_per_night: number;
    max_occupancy: number;
    description?: string;
  };
  amenities_details?: Array<{
    id: number;
    name: string;
    code: string;
    icon: string;
  }>;
  effective_price_per_night: number;
  status: string;
}

interface BankAccount {
  id: number;
  bank_name: string;
  account_name: string;
  account_number: string;
  branch_name?: string;
  swift_code?: string;
  instructions?: string;
  qr_code?: string;
  qr_code_url?: string;
  is_active?: boolean;
}

export default function PublicBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bankDetails, setBankDetails] = useState<BankAccount | null>(null);
  const [allBankAccounts, setAllBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
  const [copiedBankId, setCopiedBankId] = useState<number | null>(null);
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [nights, setNights] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [onlineSalesClosed, setOnlineSalesClosed] = useState(false);
  const [onlineNotice, setOnlineNotice] = useState<string | null>(null);

  // 10-Minute Temporary Hold state
  const [sessionId, setSessionId] = useState<string>("");
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  const {
    register: registerBooking,
    handleSubmit: handleBookingSubmit,
    watch: watchBooking,
    setValue: setBookingValue,
    formState: { errors: bookingErrors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      check_in_date: format(new Date(), "yyyy-MM-dd"),
      check_out_date: format(addDays(new Date(), 1), "yyyy-MM-dd"),
      guests_count: 2,
    },
  });

  const {
    register: registerGuest,
    handleSubmit: handleGuestSubmit,
    setValue: setGuestValue,
    watch: watchGuest,
    formState: { errors: guestErrors },
  } = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      identification_type: "NATIONAL_ID",
    },
  });

  const checkInDate = watchBooking("check_in_date");
  const checkOutDate = watchBooking("check_out_date");
  const guestsCount = watchBooking("guests_count");
  const guestFirstName = watchGuest("first_name");
  const guestLastName = watchGuest("last_name");
  const guestPhone = watchGuest("phone_number");
  const guestEmail = watchGuest("email");

  // Initialize session ID
  useEffect(() => {
    let sid = typeof window !== "undefined" ? sessionStorage.getItem("hotel_booking_session_id") : null;
    if (!sid) {
      sid = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem("hotel_booking_session_id", sid);
    }
    setSessionId(sid);
  }, []);

  // Restore draft from localStorage on initial load
  useEffect(() => {
    try {
      const saved = localStorage.getItem("hotel_booking_draft");
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.checkInDate) setBookingValue("check_in_date", draft.checkInDate);
        if (draft.checkOutDate) setBookingValue("check_out_date", draft.checkOutDate);
        if (draft.guestsCount) setBookingValue("guests_count", draft.guestsCount);
        if (draft.selectedRoom) setSelectedRoom(draft.selectedRoom);
        if (draft.guestData) {
          if (draft.guestData.first_name) setGuestValue("first_name", draft.guestData.first_name);
          if (draft.guestData.last_name) setGuestValue("last_name", draft.guestData.last_name);
          if (draft.guestData.phone_number) setGuestValue("phone_number", draft.guestData.phone_number);
          if (draft.guestData.email) setGuestValue("email", draft.guestData.email);
          if (draft.guestData.identification_type) setGuestValue("identification_type", draft.guestData.identification_type);
          if (draft.guestData.identification_number) setGuestValue("identification_number", draft.guestData.identification_number);
          if (draft.guestData.address) setGuestValue("address", draft.guestData.address);
        }
        if (draft.holdExpiresAt && draft.holdExpiresAt > Date.now()) {
          setHoldExpiresAt(draft.holdExpiresAt);
          if (draft.step) setStep(draft.step);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, [setBookingValue, setGuestValue]);

  // Auto-save draft to localStorage whenever form values change
  useEffect(() => {
    if (step >= 2 && selectedRoom) {
      try {
        const draft = {
          checkInDate,
          checkOutDate,
          guestsCount,
          selectedRoom,
          holdExpiresAt,
          step,
          guestData: {
            first_name: guestFirstName,
            last_name: guestLastName,
            phone_number: guestPhone,
            email: guestEmail,
          },
        };
        localStorage.setItem("hotel_booking_draft", JSON.stringify(draft));
      } catch {}
    }
  }, [checkInDate, checkOutDate, guestsCount, selectedRoom, holdExpiresAt, step, guestFirstName, guestLastName, guestPhone, guestEmail]);

  // 10-Minute Hold Countdown Timer
  useEffect(() => {
    if (!holdExpiresAt) {
      setSecondsRemaining(null);
      return;
    }

    const updateTimer = () => {
      const diff = Math.floor((holdExpiresAt - Date.now()) / 1000);
      if (diff <= 0) {
        setSecondsRemaining(0);
        setHoldExpiresAt(null);
        toast.error("Your 10-minute room lock has expired. The room has been released to other guests.", {
          duration: 6000,
        });
        if (step === 3) {
          setStep(2);
        }
      } else {
        setSecondsRemaining(diff);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [holdExpiresAt, step]);

  useEffect(() => {
    const roomId = searchParams.get("room");
    if (roomId) {
      setBookingValue("room_type_id", parseInt(roomId));
    }
  }, [searchParams, setBookingValue]);

  useEffect(() => {
    if (selectedRoom && checkInDate && checkOutDate) {
      const days = differenceInDays(new Date(checkOutDate), new Date(checkInDate));
      const nightsCount = days > 0 ? days : 1;
      setNights(nightsCount);
      setCalculatedTotal(selectedRoom.effective_price_per_night * nightsCount);
    }
  }, [selectedRoom, checkInDate, checkOutDate]);

  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        const [pubRes, accountsRes] = await Promise.all([
          bankAPI.getPublicBankDetails().catch(() => ({ data: null })),
          bankAPI.getBankAccounts().catch(() => ({ data: { results: [] } })),
        ]);

        if (pubRes?.data) {
          setBankDetails(pubRes.data);
        }

        const accounts =
          accountsRes?.data?.results ||
          (Array.isArray(accountsRes?.data) ? accountsRes.data : []) ||
          pubRes?.data?.accounts ||
          [];

        if (accounts.length > 0) {
          const activeOnes = accounts.filter((a: any) => a.is_active !== false);
          setAllBankAccounts(activeOnes);
          setSelectedBankId(activeOnes[0]?.id || null);
        } else if (pubRes?.data?.bank_name) {
          setAllBankAccounts([pubRes.data]);
          setSelectedBankId(pubRes.data.id || 1);
        }
      } catch (error) {
        console.error("Failed to fetch bank details:", error);
      }
    };
    fetchBankDetails();
  }, []);

  const searchAvailability = async (data: BookingFormData) => {
    setIsLoading(true);
    try {
      const response = await roomAPI.getAvailableRooms({
        check_in_date: data.check_in_date,
        check_out_date: data.check_out_date,
        guests_count: data.guests_count,
        room_type_id: data.room_type_id,
      });

      if (response.data.online_sales_closed) {
        setOnlineSalesClosed(true);
        setOnlineNotice(
          response.data.notice ||
            "Online bookings are closed for remaining inventory. Please call our front desk directly to check last-room availability."
        );
        setAvailableRooms([]);
        toast.error("Online booking closed for remaining rooms. Please call our front desk directly.");
        return;
      }

      setOnlineSalesClosed(false);
      setOnlineNotice(null);

      const availableOnly = (response.data.rooms || []).filter(
        (room: Room) => room.status === "AVAILABLE"
      );
      
      setAvailableRooms(availableOnly);

      if (availableOnly.length === 0) {
        toast.error("No available rooms for selected dates");
      } else {
        toast.success(`${availableOnly.length} room(s) available!`);
        setStep(2);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to check availability");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
  };

  const proceedToGuestDetails = async () => {
    if (!selectedRoom) {
      toast.error("Please select a room");
      return;
    }
    setIsLoading(true);
    try {
      // Place 10-minute hold
      await roomAPI.createRoomHold({
        room: selectedRoom.id,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        session_id: sessionId,
      });
      const expires = Date.now() + 10 * 60 * 1000;
      setHoldExpiresAt(expires);
      setStep(3);
      toast.success("Room locked for 10 minutes! Please complete your booking before the timer expires.");
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        "This room is currently reserved or locked by another guest. Please select another room.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetForm = async () => {
    if (sessionId) {
      try {
        await roomAPI.releaseRoomHold({ session_id: sessionId });
      } catch {}
    }
    try {
      localStorage.removeItem("hotel_booking_draft");
    } catch {}
    setSelectedRoom(null);
    setHoldExpiresAt(null);
    setSecondsRemaining(null);
    setUploadedFile(null);
    setUploadPreview(null);
    setStep(1);
    toast.success("Booking form reset and room hold released.");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadPreview(null);
  };

  const handleBookingSubmitFinal = async (guestData: GuestFormData) => {
    if (!selectedRoom) {
      toast.error("Please select a room");
      return;
    }

    if (!checkInDate || !checkOutDate) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();

      const normalizedPhone = normalizeEthiopianPhone(guestData.phone_number);

      formData.append("guest_first_name", guestData.first_name);
      formData.append("guest_last_name", guestData.last_name || "");
      formData.append("guest_phone_number", normalizedPhone);
      formData.append("guest_email", guestData.email || "");
      formData.append("identification_type", guestData.identification_type);
      formData.append("identification_number", guestData.identification_number || "");
      formData.append("guest_address", guestData.address || "");

      formData.append("room_id", selectedRoom.id.toString());
      formData.append("check_in_date", checkInDate);
      formData.append("check_out_date", checkOutDate);
      formData.append("adults_count", guestsCount.toString());
      formData.append("children_count", "0");
      formData.append("special_requests", "");
      if (sessionId) {
        formData.append("session_id", sessionId);
      }

      if (uploadedFile) {
        formData.append("payment_proof", uploadedFile);
      }

      formData.append("transaction_reference", `BOOK-${normalizedPhone}-${Date.now()}`);

      const response = await bookingAPI.createOnlineBooking(formData);

      toast.success(
        uploadedFile
          ? "Booking submitted! Payment proof received. We'll verify it shortly."
          : "Booking created successfully!"
      );

      sessionStorage.setItem("last_booking_ref", response.data.booking?.booking_reference || "");
      try {
        localStorage.removeItem("hotel_booking_draft");
      } catch {}
      setHoldExpiresAt(null);
      setSecondsRemaining(null);

      setStep(4);
    } catch (error: any) {
      console.error("Booking error:", error);
      const serverMsg =
        error.response?.data?.message ||
        (Array.isArray(error.response?.data) ? error.response?.data[0] : null) ||
        error.response?.data?.detail ||
        (typeof error.response?.data === "string" ? error.response?.data : null) ||
        "Failed to create booking";
      toast.error(serverMsg, { duration: 6000 });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      AVAILABLE: "bg-green-100 text-green-800",
      OCCUPIED: "bg-blue-100 text-blue-800",
      MAINTENANCE: "bg-red-100 text-red-800",
      DIRTY_CLEANING: "bg-yellow-100 text-yellow-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <>
      <Header />
      <main className="container-custom py-12">
        <h1 className="text-4xl font-bold text-center mb-4">Book Your Stay</h1>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8">
          Experience luxury and comfort at StayCraft Hotel. Book your stay today.
        </p>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {["Search", "Select Room", "Guest Details", "Confirm"].map((label, index) => (
              <div key={label} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    step > index + 1
                      ? "bg-green-500 text-white"
                      : step === index + 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step > index + 1 ? "✓" : index + 1}
                </div>
                <span
                  className={`ml-2 text-sm hidden sm:inline ${
                    step === index + 1 ? "font-semibold text-blue-600" : "text-gray-500"
                  }`}
                >
                  {label}
                </span>
                {index < 3 && (
                  <div
                    className={`w-8 sm:w-12 h-0.5 mx-1 sm:mx-2 ${
                      step > index + 1 ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 10-Minute Room Lock Banner */}
        {secondsRemaining !== null && secondsRemaining > 0 && selectedRoom && (
          <div className="max-w-3xl mx-auto mb-6 bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm text-slate-900">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 text-white rounded-xl shadow-sm shrink-0">
                <ClockIcon className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">Room {selectedRoom.room_number} Held For You</span>
                  <span className="font-mono font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-lg border border-amber-300 text-xs">
                    {Math.floor(secondsRemaining / 60).toString().padStart(2, "0")}:
                    {(secondsRemaining % 60).toString().padStart(2, "0")}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Your room is locked for 10 minutes so nobody else can take it. Finish your booking before the timer expires.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetForm}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-rose-600 hover:bg-rose-50 border border-slate-300 bg-white transition shrink-0"
              title="Release hold and reset form"
            >
              <ArrowPathIcon className="w-3.5 h-3.5" />
              Reset Form
            </button>
          </div>
        )}

        {/* Step 1: Search Availability */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
              Search Availability
            </h2>
            <form onSubmit={handleBookingSubmit(searchAvailability)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in Date *
                  </label>
                  <input
                    type="date"
                    {...registerBooking("check_in_date")}
                    className="input-field"
                    min={format(new Date(), "yyyy-MM-dd")}
                  />
                  {bookingErrors.check_in_date && (
                    <p className="text-sm text-red-600 mt-1">{bookingErrors.check_in_date.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out Date *
                  </label>
                  <input
                    type="date"
                    {...registerBooking("check_out_date")}
                    className="input-field"
                    min={format(addDays(new Date(), 1), "yyyy-MM-dd")}
                  />
                  {bookingErrors.check_out_date && (
                    <p className="text-sm text-red-600 mt-1">{bookingErrors.check_out_date.message}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Guests *
                </label>
                <input
                  type="number"
                  {...registerBooking("guests_count", { valueAsNumber: true })}
                  className="input-field"
                  min={1}
                  max={10}
                />
                {bookingErrors.guests_count && (
                  <p className="text-sm text-red-600 mt-1">{bookingErrors.guests_count.message}</p>
                )}
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
                    Check Availability
                  </>
                )}
              </button>
            </form>

            {onlineSalesClosed && (
              <div className="mt-5 bg-amber-50 border-2 border-amber-500 rounded-xl p-4 text-amber-900 shadow-sm animate-pulse-subtle">
                <div className="flex items-start gap-3">
                  <ExclamationTriangleIcon className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm text-amber-950 uppercase tracking-wide">
                      Notice: Online Booking Closed for Remaining Rooms
                    </h3>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      {onlineNotice ||
                        "Our hotel is currently at near full occupancy. In accordance with front desk policy, the final remaining rooms can only be booked directly through our front desk."}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs font-bold text-amber-950 bg-amber-100/70 py-1.5 px-3 rounded-lg border border-amber-300 w-fit">
                      <PhoneIcon className="h-4 w-4 text-amber-700" />
                      <span>Call Front Desk Directly:</span>
                      <a href="tel:+251911000000" className="underline hover:text-amber-800">
                        +251 911 000 000
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Room */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                Select a Room
                <span className="text-sm font-normal text-gray-500">
                  ({availableRooms.length} available)
                </span>
              </h2>
              <button
                onClick={() => setStep(1)}
                className="btn-secondary text-sm flex items-center gap-1"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableRooms.map((room) => {
                const isSelected = selectedRoom?.id === room.id;
                const roomNights = differenceInDays(
                  new Date(checkOutDate),
                  new Date(checkInDate)
                );
                const total = room.effective_price_per_night * (roomNights > 0 ? roomNights : 1);

                return (
                  <div
                    key={room.id}
                    className={`card p-4 cursor-pointer transition-all ${
                      isSelected
                        ? "ring-2 ring-blue-600 shadow-lg"
                        : "hover:shadow-lg"
                    }`}
                    onClick={() => handleRoomSelect(room)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-gray-900">Room {room.room_number}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(room.status)}`}>
                            {room.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">Floor {room.floor}</p>
                        {room.room_type_details && (
                          <>
                            <p className="text-sm font-medium text-gray-700 mt-1">
                              {room.room_type_details.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Max {room.room_type_details.max_occupancy} guests
                            </p>
                          </>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-blue-600">
                          {formatCurrency(room.effective_price_per_night, "ETB")}
                          <span className="text-sm font-normal text-gray-500"> / night</span>
                        </p>
                      </div>
                    </div>

                    {/* Amenities */}
                    {room.amenities_details && room.amenities_details.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex flex-wrap gap-1">
                          {room.amenities_details.map((amenity) => (
                            <span
                              key={amenity.id}
                              className="text-xs bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1"
                            >
                              <i className={`fas ${amenity.icon || 'fa-star'} text-gray-500`}></i>
                              {amenity.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            Total for {roomNights > 0 ? roomNights : 1} night(s):
                          </span>
                          <span className="font-bold text-blue-600">{formatCurrency(total, "ETB")}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {availableRooms.length === 0 && (
              <div className="text-center py-12 card p-8">
                <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No available rooms for selected dates</p>
                <button
                  onClick={() => setStep(1)}
                  className="btn-primary mt-4 inline-flex items-center gap-2"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                  Change Search
                </button>
              </div>
            )}

            {availableRooms.length > 0 && (
              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={proceedToGuestDetails}
                  disabled={!selectedRoom || isLoading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Locking Room...
                    </>
                  ) : (
                    <>
                      Continue to Guest Details
                      <ArrowRightIcon className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Guest Details & Payment */}
        {step === 3 && selectedRoom && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Guest Form */}
            <div className="lg:col-span-2 card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <UserIcon className="h-6 w-6 text-blue-600" />
                Guest Details
              </h2>
              <form onSubmit={handleGuestSubmit(handleBookingSubmitFinal)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      {...registerGuest("first_name")}
                      className="input-field"
                      placeholder="John"
                    />
                    {guestErrors.first_name && (
                      <p className="text-sm text-red-600 mt-1">{guestErrors.first_name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      {...registerGuest("last_name")}
                      className="input-field"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      {...registerGuest("phone_number", {
                        onBlur: (e) => {
                          const normalized = normalizeEthiopianPhone(e.target.value);
                          if (normalized) {
                            setGuestValue("phone_number", normalized);
                          }
                        },
                      })}
                      className="input-field"
                      placeholder="+251 911 000 000 or 0911000000"
                    />
                    {guestErrors.phone_number && (
                      <p className="text-sm text-red-600 mt-1">{guestErrors.phone_number.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      {...registerGuest("email")}
                      className="input-field"
                      placeholder="john@example.com"
                    />
                    {guestErrors.email && (
                      <p className="text-sm text-red-600 mt-1">{guestErrors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Type
                    </label>
                    <select
                      {...registerGuest("identification_type")}
                      className="input-field"
                    >
                      <option value="NATIONAL_ID">National ID</option>
                      <option value="PASSPORT">Passport</option>
                      <option value="DRIVERS_LICENSE">Driver's License</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Number
                    </label>
                    <input
                      type="text"
                      {...registerGuest("identification_number")}
                      className="input-field"
                      placeholder="Enter ID number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    {...registerGuest("address")}
                    className="input-field"
                    placeholder="Your address"
                  />
                </div>

                {/* Payment Proof Upload */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <DocumentArrowUpIcon className="h-5 w-5 text-blue-600" />
                    Upload Payment Proof
                    <span className="text-sm font-normal text-gray-500">(Optional but recommended)</span>
                  </h3>

                  {!uploadPreview ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        id="payment-proof"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="payment-proof"
                        className="cursor-pointer block"
                      >
                        <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload bank transfer receipt</p>
                        <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 5MB</p>
                      </label>
                    </div>
                  ) : (
                    <div className="relative border rounded-lg p-2">
                      <img
                        src={uploadPreview}
                        alt="Payment Proof"
                        className="max-h-48 rounded-lg mx-auto"
                      />
                      <button
                        type="button"
                        onClick={removeFile}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Upload your bank transfer receipt or screenshot for faster verification
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
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-5 w-5" />
                      Complete Booking
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Booking Summary & Bank Details */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room</span>
                    <span className="font-medium">Room {selectedRoom.room_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room Type</span>
                    <span className="font-medium">{selectedRoom.room_type_details?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Floor</span>
                    <span className="font-medium">Floor {selectedRoom.floor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in</span>
                    <span className="font-medium">{format(new Date(checkInDate), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out</span>
                    <span className="font-medium">{format(new Date(checkOutDate), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nights</span>
                    <span className="font-medium">{nights} night{nights > 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests</span>
                    <span className="font-medium">{guestsCount}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between text-base">
                      <span className="font-semibold">Rate per night</span>
                      <span className="font-semibold">{formatCurrency(selectedRoom.effective_price_per_night, "ETB")}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-blue-600 mt-1">
                      <span>Total</span>
                      <span>{formatCurrency(calculatedTotal, "ETB")}</span>
                    </div>
                  </div>

                  {/* Amenities in room */}
                  {selectedRoom.amenities_details && selectedRoom.amenities_details.length > 0 && (
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <p className="text-xs text-gray-500 font-medium mb-1">Amenities</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedRoom.amenities_details.map((amenity) => (
                          <span
                            key={amenity.id}
                            className="text-xs bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1"
                          >
                            <i className={`fas ${amenity.icon || 'fa-star'} text-gray-500`}></i>
                            {amenity.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bank Details Section */}
                <div className="mt-4 pt-4 border-t-2 border-blue-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <BanknotesIcon className="h-5 w-5 text-blue-600" />
                      Hotel Bank Accounts
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium">Choose an account</span>
                  </div>

                  {allBankAccounts.length === 0 && bankDetails ? (
                    <div className="bg-blue-50 rounded-xl p-3.5 space-y-1.5 text-xs text-slate-900 border border-blue-100">
                      <p className="font-bold">{bankDetails.bank_name}</p>
                      <p className="font-mono text-sm font-semibold">{bankDetails.account_number}</p>
                      <p className="text-slate-600">{bankDetails.account_name}</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                      {allBankAccounts.map((acc) => {
                        const isCopied = copiedBankId === acc.id;
                        return (
                          <div
                            key={acc.id}
                            className="bg-slate-50 hover:bg-blue-50/50 rounded-xl p-3 border border-slate-200 space-y-2 transition-all text-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-bold text-slate-900 block text-xs">{acc.bank_name}</span>
                                <span className="text-[11px] text-slate-600">{acc.account_name}</span>
                                {acc.branch_name && (
                                  <span className="text-[10px] text-slate-500 block">({acc.branch_name})</span>
                                )}
                              </div>
                              {(acc.qr_code_url || acc.qr_code) && (
                                <img
                                  src={getImageUrl(acc.qr_code_url || acc.qr_code || "")}
                                  alt="QR Code"
                                  className="w-11 h-11 object-contain rounded border border-slate-200 bg-white shrink-0"
                                />
                              )}
                            </div>

                            <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                              <span className="font-mono font-bold text-xs text-slate-900">
                                {acc.account_number}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(acc.account_number);
                                  setCopiedBankId(acc.id);
                                  toast.success(`${acc.bank_name} account number copied!`);
                                  setTimeout(() => setCopiedBankId(null), 2500);
                                }}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                                  isCopied
                                    ? "bg-emerald-600 text-white"
                                    : "bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200"
                                }`}
                              >
                                {isCopied ? (
                                  <>
                                    <ClipboardDocumentCheckIcon className="w-3.5 h-3.5" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                                    Copy
                                  </>
                                )}
                              </button>
                            </div>

                            {acc.swift_code && (
                              <p className="text-[10px] text-slate-500">SWIFT: {acc.swift_code}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <p className="text-[11px] text-slate-600 italic bg-amber-50/70 border border-amber-200/70 p-2.5 rounded-xl">
                    💡 Transfer the total stay amount via bank app or branch, then attach your receipt screenshot on the left.
                  </p>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="btn-secondary w-full mt-4 text-sm flex items-center justify-center gap-1"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back to Room Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="max-w-2xl mx-auto card p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-4">Booking Submitted Successfully!</h2>
            <p className="text-gray-600 mb-4">
              Thank you for choosing StayCraft Hotel. Your booking request has been received.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left space-y-2">
              <p className="text-sm text-green-800 font-medium">
                {uploadedFile ? (
                  "✅ Your payment proof has been uploaded. An automated email receipt with your booking details has been sent to your email address."
                ) : (
                  "ℹ️ Please complete your payment by transferring the total amount to the bank details below."
                )}
              </p>
              <p className="text-xs text-green-700">
                📩 Once our staff reviews and confirms your payment, you will receive an instant email confirmation update. You can also track your booking status anytime using your phone number or booking reference.
              </p>
              {!uploadedFile && bankDetails && (
                <div className="mt-3 text-sm pt-2 border-t border-green-200">
                  <p className="font-medium text-gray-900">Bank Details:</p>
                  <p className="text-gray-700">Bank: {bankDetails.bank_name}</p>
                  <p className="text-gray-700">Account: {bankDetails.account_name}</p>
                  <p className="text-gray-700">Number: {bankDetails.account_number}</p>
                  <p className="text-xs text-gray-600 mt-1">{bankDetails.instructions}</p>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/" className="btn-primary flex items-center justify-center gap-2 flex-1">
                <HomeIcon className="h-5 w-5" />
                Return Home
              </a>
              <a href="/lookup" className="btn-secondary flex items-center justify-center gap-2 flex-1">
                <MagnifyingGlassIcon className="h-5 w-5" />
                Check Booking Status
              </a>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
