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
  email: z.string().email("Invalid email").optional(),
  identification_type: z.string().default("NATIONAL_ID"),
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

interface BankDetails {
  id: number;
  bank_name: string;
  account_name: string;
  account_number: string;
  swift_code: string;
  instructions: string;
}

export default function PublicBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [nights, setNights] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

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

  useEffect(() => {
    const roomId = searchParams.get("room");
    if (roomId) {
      setBookingValue("room_type_id", parseInt(roomId));
    }
  }, [searchParams, setBookingValue]);

  useEffect(() => {
    if (selectedRoom && checkInDate && checkOutDate) {
      const days = differenceInDays(
        new Date(checkOutDate),
        new Date(checkInDate)
      );
      const nightsCount = days > 0 ? days : 1;
      setNights(nightsCount);
      setCalculatedTotal(selectedRoom.effective_price_per_night * nightsCount);
    }
  }, [selectedRoom, checkInDate, checkOutDate]);

  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        const response = await bankAPI.getPublicBankDetails();
        setBankDetails(response.data);
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

      formData.append("guest_first_name", guestData.first_name);
      formData.append("guest_last_name", guestData.last_name || "");
      formData.append("guest_phone_number", guestData.phone_number);
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

      if (uploadedFile) {
        formData.append("payment_proof", uploadedFile);
      }

      formData.append("transaction_reference", `BOOK-${guestData.phone_number}-${Date.now()}`);

      const response = await bookingAPI.createOnlineBooking(formData);

      toast.success(
        uploadedFile
          ? "Booking submitted! Payment proof received. We'll verify it shortly."
          : "Booking created successfully!"
      );

      sessionStorage.setItem("last_booking_ref", response.data.booking?.booking_reference || "");

      setStep(4);
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(error.response?.data?.message || "Failed to create booking");
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
                          ${room.effective_price_per_night}
                          <span className="text-sm font-normal text-gray-500">/night</span>
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
                          <span className="font-bold text-blue-600">${total.toFixed(2)}</span>
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
                  onClick={() => {
                    if (!selectedRoom) {
                      toast.error("Please select a room");
                      return;
                    }
                    setStep(3);
                  }}
                  disabled={!selectedRoom}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  Continue to Guest Details
                  <ArrowRightIcon className="h-5 w-5" />
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
                      {...registerGuest("phone_number")}
                      className="input-field"
                      placeholder="+251 911 000 000"
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
                      <span className="font-semibold">${selectedRoom.effective_price_per_night}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-blue-600 mt-1">
                      <span>Total</span>
                      <span>${calculatedTotal.toFixed(2)}</span>
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
                {bankDetails && (
                  <div className="mt-4 pt-4 border-t-2 border-blue-200">
                    <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                      <BanknotesIcon className="h-5 w-5 text-blue-600" />
                      Bank Transfer Details
                    </h4>
                    <div className="bg-blue-50 rounded-lg p-3 space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bank:</span>
                        <span className="font-medium">{bankDetails.bank_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Name:</span>
                        <span className="font-medium">{bankDetails.account_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Number:</span>
                        <span className="font-medium font-mono">{bankDetails.account_number}</span>
                      </div>
                      {bankDetails.swift_code && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">SWIFT Code:</span>
                          <span className="font-medium font-mono">{bankDetails.swift_code}</span>
                        </div>
                      )}
                      {bankDetails.instructions && (
                        <div className="mt-2 pt-2 border-t border-blue-200">
                          <p className="text-xs text-gray-600">{bankDetails.instructions}</p>
                        </div>
                      )}
                      <div className="mt-2 pt-2 border-t border-blue-200">
                        <p className="text-xs text-amber-600 font-medium">
                          ⚠️ Please use your booking reference as payment reference
                        </p>
                      </div>
                    </div>
                  </div>
                )}

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
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-green-800">
                {uploadedFile ? (
                  "✅ Your payment proof has been uploaded. Our team will verify it shortly."
                ) : (
                  "ℹ️ Please complete your payment by transferring the total amount to the bank details below."
                )}
              </p>
              {!uploadedFile && bankDetails && (
                <div className="mt-3 text-sm">
                  <p className="font-medium">Bank Details:</p>
                  <p>Bank: {bankDetails.bank_name}</p>
                  <p>Account: {bankDetails.account_name}</p>
                  <p>Number: {bankDetails.account_number}</p>
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
