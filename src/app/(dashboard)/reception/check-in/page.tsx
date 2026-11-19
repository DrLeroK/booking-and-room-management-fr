"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { bookingAPI, roomAPI, guestAPI } from "@/lib/api/endpoints";
import { OfflineSyncManager } from "@/lib/offline-sync";
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  UsersIcon,
  HomeIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { format, addDays, differenceInDays } from "date-fns";
import { normalizeEthiopianPhone } from "@/lib/utils";

interface Guest {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  email?: string;
  identification_type: string;
  identification_number?: string;
  address?: string;
}

interface Amenity {
  id: number;
  name: string;
  code: string;
  icon: string;
}

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
  amenities_details?: Amenity[];
  effective_price_per_night: number;
  status: string;
}

export default function CheckInPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [searchType, setSearchType] = useState<"existing" | "new">("existing");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Guest[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [roomDetails, setRoomDetails] = useState<Room | null>(null);

  // Form data with proper number handling
  const [checkInData, setCheckInData] = useState({
    check_in_date: format(new Date(), "yyyy-MM-dd"),
    check_out_date: format(addDays(new Date(), 1), "yyyy-MM-dd"),
    adults_count: 1,
    children_count: 0,
    money_received: 0,
    deposit_amount: 0,
    payment_method: "CASH",
    key_card_number: "",
    notes: "",
  });

  // New guest form
  const [newGuest, setNewGuest] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    identification_type: "NATIONAL_ID",
    identification_number: "",
    address: "",
  });

  useEffect(() => {
    if (selectedGuest && step === 2) {
      fetchAvailableRooms();
    }
  }, [selectedGuest, checkInData.check_in_date, checkInData.check_out_date, step]);

  // Calculate total when room or dates change
  useEffect(() => {
    if (selectedRoom) {
      const nights = differenceInDays(
        new Date(checkInData.check_out_date),
        new Date(checkInData.check_in_date)
      );
      const total = selectedRoom.effective_price_per_night * (nights > 0 ? nights : 1);
      setCalculatedTotal(total);
    }
  }, [selectedRoom, checkInData.check_in_date, checkInData.check_out_date]);

  const searchGuests = async () => {
    if (searchTerm.length < 3) {
      toast.error("Please enter at least 3 characters");
      return;
    }
    setIsLoading(true);
    try {
      const response = await guestAPI.getGuests({ search: searchTerm });
      setSearchResults(response.data.results || []);
      if (response.data.results?.length === 0) {
        toast("No guests found. You can create a new one.", { icon: "ℹ️" });
      }
    } catch (error) {
      toast.error("Failed to search guests");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      const response = await roomAPI.getAvailableRooms({
        check_in_date: checkInData.check_in_date,
        check_out_date: checkInData.check_out_date,
        guests_count: checkInData.adults_count + checkInData.children_count,
      });
      setAvailableRooms(response.data.rooms || []);
      if (response.data.rooms?.length === 0) {
        toast.error("No rooms available for selected dates");
      }
    } catch (error) {
      toast.error("Failed to fetch available rooms");
    }
  };

  const handleGuestSelect = (guest: Guest) => {
    setSelectedGuest(guest);
    setStep(2);
    setSearchResults([]);
    setSearchTerm("");
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    setRoomDetails(room);
  };

  const handleCreateGuest = async () => {
    if (!newGuest.first_name || !newGuest.phone_number) {
      toast.error("First name and phone number are required");
      return;
    }
    setIsLoading(true);
    try {
      const normalizedPhone = normalizeEthiopianPhone(newGuest.phone_number);
      const payload = { ...newGuest, phone_number: normalizedPhone };
      const response = await guestAPI.createGuest(payload);
      setSelectedGuest(response.data);
      toast.success("Guest created successfully!");
      setStep(2);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create guest");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!selectedGuest || !selectedRoom) {
      toast.error("Please select a guest and room");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        guest: {
          first_name: selectedGuest.first_name,
          last_name: selectedGuest.last_name || "",
          phone_number: normalizeEthiopianPhone(selectedGuest.phone_number),
          email: selectedGuest.email || "",
          identification_type: selectedGuest.identification_type,
          identification_number: selectedGuest.identification_number || "",
          address: selectedGuest.address || "",
        },
        room_id: selectedRoom.id,
        check_in_date: checkInData.check_in_date,
        check_out_date: checkInData.check_out_date,
        money_received: checkInData.money_received,
        deposit_amount: checkInData.deposit_amount,
        payment_method: checkInData.payment_method,
        key_card_number: checkInData.key_card_number,
        receptionist_name: "Receptionist",
        notes: checkInData.notes,
      };

      if (typeof window !== "undefined" && !navigator.onLine) {
        OfflineSyncManager.enqueueMutation(
          "/bookings/reception/walk-in-checkin/",
          "POST",
          payload,
          `Walk-in Check-in for Room ${selectedRoom.room_number}`
        );
        toast.success(
          "OFFLINE: Saved locally to Outbox. Will sync automatically once internet reconnects.",
          { duration: 6000 }
        );
        router.push("/reception");
        return;
      }

      await bookingAPI.walkInCheckin(payload);
      toast.success("Check-in successful!");
      router.push("/reception");
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error(
          error.response?.data?.error ||
            "Conflict: Room is no longer available or was booked online. Please select another room.",
          { duration: 6000 }
        );
      } else {
        toast.error(error.response?.data?.message || "Check-in failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNumberChange = (field: string, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    setCheckInData({ ...checkInData, [field]: isNaN(numValue) ? 0 : numValue });
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Check-in Guest</h2>
        <p className="text-sm text-gray-500">Process a new guest check-in</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step > s
                  ? "bg-green-500 text-white"
                  : step === s
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {step > s ? <CheckIcon className="h-5 w-5" /> : s}
            </div>
            <span className={`ml-2 text-sm ${step === s ? "font-semibold text-blue-600" : "text-gray-500"}`}>
              {s === 1 ? "Guest" : s === 2 ? "Room" : "Check-in"}
            </span>
            {s < 3 && <div className={`w-8 h-0.5 mx-2 ${step > s ? "bg-green-500" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Find or Create Guest */}
      {step === 1 && (
        <div className="dashboard-card">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setSearchType("existing")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                searchType === "existing"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Find Existing
            </button>
            <button
              onClick={() => setSearchType("new")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                searchType === "new"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Create New
            </button>
          </div>

          {searchType === "existing" && (
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, phone, or email..."
                  className="input-field flex-1"
                  onKeyPress={(e) => e.key === "Enter" && searchGuests()}
                />
                <button onClick={searchGuests} className="btn-primary" disabled={isLoading}>
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((guest) => (
                    <button
                      key={guest.id}
                      onClick={() => handleGuestSelect(guest)}
                      className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{guest.full_name}</p>
                          <p className="text-sm text-gray-500">{guest.phone_number}</p>
                          {guest.email && <p className="text-sm text-gray-500">{guest.email}</p>}
                        </div>
                        <span className="text-blue-600">Select →</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {searchType === "new" && (
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={newGuest.first_name}
                    onChange={(e) => setNewGuest({ ...newGuest, first_name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={newGuest.last_name}
                    onChange={(e) => setNewGuest({ ...newGuest, last_name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    value={newGuest.phone_number}
                    onChange={(e) => setNewGuest({ ...newGuest, phone_number: e.target.value })}
                    onBlur={(e) => {
                      const normalized = normalizeEthiopianPhone(e.target.value);
                      if (normalized) {
                        setNewGuest((prev) => ({ ...prev, phone_number: normalized }));
                      }
                    }}
                    className="input-field"
                    placeholder="+251 911 000 000 or 0911000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newGuest.email}
                    onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Type
                  </label>
                  <select
                    value={newGuest.identification_type}
                    onChange={(e) => setNewGuest({ ...newGuest, identification_type: e.target.value })}
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
                    value={newGuest.identification_number}
                    onChange={(e) => setNewGuest({ ...newGuest, identification_number: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={newGuest.address}
                  onChange={(e) => setNewGuest({ ...newGuest, address: e.target.value })}
                  className="input-field"
                />
              </div>
              <button
                onClick={handleCreateGuest}
                disabled={isLoading}
                className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
              >
                <UserPlusIcon className="h-5 w-5" />
                Create Guest & Continue
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Room with Full Details */}
      {step === 2 && selectedGuest && (
        <div className="space-y-4">
          <div className="dashboard-card">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-gray-500" />
              Guest Selected
            </h3>
            <p className="text-lg font-semibold">{selectedGuest.full_name}</p>
            <p className="text-sm text-gray-500">{selectedGuest.phone_number}</p>
            {selectedGuest.email && (
              <p className="text-sm text-gray-500">{selectedGuest.email}</p>
            )}
          </div>

          <div className="dashboard-card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-gray-500" />
              Stay Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={checkInData.check_in_date}
                  onChange={(e) => setCheckInData({ ...checkInData, check_in_date: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-out Date
                </label>
                <input
                  type="date"
                  value={checkInData.check_out_date}
                  onChange={(e) => setCheckInData({ ...checkInData, check_out_date: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adults
                </label>
                <input
                  type="number"
                  min="1"
                  value={checkInData.adults_count}
                  onChange={(e) => setCheckInData({ ...checkInData, adults_count: parseInt(e.target.value) || 1 })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Children
                </label>
                <input
                  type="number"
                  min="0"
                  value={checkInData.children_count}
                  onChange={(e) => setCheckInData({ ...checkInData, children_count: parseInt(e.target.value) || 0 })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BuildingOfficeIcon className="h-5 w-5 text-gray-500" />
              Available Rooms
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({availableRooms.length} available)
              </span>
            </h3>
            {availableRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableRooms.map((room) => {
                  const isSelected = selectedRoom?.id === room.id;
                  const nights = differenceInDays(
                    new Date(checkInData.check_out_date),
                    new Date(checkInData.check_in_date)
                  );
                  const total = room.effective_price_per_night * (nights > 0 ? nights : 1);
                  
                  return (
                    <button
                      key={room.id}
                      onClick={() => handleRoomSelect(room)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        isSelected
                          ? "border-blue-600 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-lg text-gray-900">Room {room.room_number}</p>
                          <p className="text-sm text-gray-500">Floor {room.floor}</p>
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${getStatusColor(room.status)}`}>
                            {room.status}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">
                            ${room.effective_price_per_night}
                            <span className="text-sm font-normal text-gray-500">/night</span>
                          </p>
                          {isSelected && (
                            <p className="text-xs font-semibold text-green-600">Selected</p>
                          )}
                        </div>
                      </div>

                      {/* Room Type Details */}
                      {room.room_type_details && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm font-medium text-gray-700">
                            {room.room_type_details.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Max Occupancy: {room.room_type_details.max_occupancy} guests
                          </p>
                          {room.room_type_details.description && (
                            <p className="text-xs text-gray-400 mt-1">
                              {room.room_type_details.description}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Amenities */}
                      {room.amenities_details && room.amenities_details.length > 0 && (
                        <div className="mt-2">
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

                      {/* Total for stay */}
                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Total for {nights > 0 ? nights : 1} night(s):</span>
                            <span className="font-bold text-blue-600">${total.toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BuildingOfficeIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No rooms available for selected dates</p>
                <p className="text-sm">Try adjusting your dates or guest count</p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!selectedRoom}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              Proceed to Check-in
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Complete Check-in */}
      {step === 3 && selectedRoom && (
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckIcon className="h-5 w-5 text-green-600" />
            Complete Check-in
          </h3>

          {/* Summary Card */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Guest</p>
              <p className="font-semibold">{selectedGuest?.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Room</p>
              <p className="font-semibold">Room {selectedRoom.room_number}</p>
              <p className="text-xs text-gray-500">{selectedRoom.room_type_details?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Stay</p>
              <p className="font-semibold">
                {format(new Date(checkInData.check_in_date), "MMM d")} - {format(new Date(checkInData.check_out_date), "MMM d, yyyy")}
              </p>
              <p className="text-xs text-gray-500">
                {differenceInDays(
                  new Date(checkInData.check_out_date),
                  new Date(checkInData.check_in_date)
                )} nights
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-bold text-blue-600 text-lg">${calculatedTotal.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method *
              </label>
              <select
                value={checkInData.payment_method}
                onChange={(e) => setCheckInData({ ...checkInData, payment_method: e.target.value })}
                className="input-field"
              >
                <option value="CASH">Cash</option>
                <option value="CARD">Credit/Debit Card</option>
                <option value="MOBILE_MONEY">Mobile Money</option>
                <option value="ONLINE_TRANSFER">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Money Received
              </label>
              <input
                type="number"
                step="0.01"
                value={checkInData.money_received || ''}
                onChange={(e) => handleNumberChange('money_received', e.target.value)}
                className="input-field"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deposit Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={checkInData.deposit_amount || ''}
                onChange={(e) => handleNumberChange('deposit_amount', e.target.value)}
                className="input-field"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Key Card Number
              </label>
              <input
                type="text"
                value={checkInData.key_card_number}
                onChange={(e) => setCheckInData({ ...checkInData, key_card_number: e.target.value })}
                className="input-field"
                placeholder="e.g., 101A"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={checkInData.notes}
              onChange={(e) => setCheckInData({ ...checkInData, notes: e.target.value })}
              className="input-field resize-none"
              rows={2}
              placeholder="Any special notes about this check-in..."
            />
          </div>

          <div className="flex gap-4 mt-4">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1">
              Back
            </button>
            <button
              onClick={handleCheckIn}
              disabled={isLoading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <CheckIcon className="h-5 w-5" />
              {isLoading ? "Processing..." : "Complete Check-in"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
