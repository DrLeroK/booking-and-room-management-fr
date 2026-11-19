"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { roomAPI } from "@/lib/api/endpoints";
import { formatCurrency } from "@/lib/utils";
import {
  SparklesIcon,
  CheckBadgeIcon,
  ArrowRightIcon,
  WifiIcon,
  ShieldCheckIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";

interface RoomType {
  id: number;
  name: string;
  code: string;
  description: string;
  base_price_per_night: number | string;
  weekend_price_per_night?: number | string;
  max_occupancy: number;
  total_rooms?: number;
  image?: string;
  amenities?: Array<{ id: number; name: string }>;
}

const FALLBACK_ROOM_TYPES: RoomType[] = [
  {
    id: 1,
    name: "Deluxe King Suite",
    code: "DLX-KING",
    description: "Spacious master suite featuring a plush king-sized bed, panoramic city views, marble en-suite bathroom, and private executive work lounge.",
    base_price_per_night: 180,
    max_occupancy: 2,
    image: "/images/hero-hotel.jpg",
    amenities: [
      { id: 1, name: "King Bed" },
      { id: 2, name: "High-Speed Wi-Fi" },
      { id: 3, name: "City Skyline View" },
      { id: 4, name: "Rainfall Shower" },
      { id: 5, name: "24/7 Room Service" },
    ],
  },
  {
    id: 2,
    name: "Executive Twin Room",
    code: "EXE-TWIN",
    description: "Modern elegance tailored for business travelers and duos. Features two premium twin beds, ergonomic workstation, and soundproof acoustic windows.",
    base_price_per_night: 140,
    max_occupancy: 2,
    image: "/images/hero-hotel.jpg",
    amenities: [
      { id: 1, name: "Twin Beds" },
      { id: 2, name: "Executive Desk" },
      { id: 3, name: "Smart TV" },
      { id: 4, name: "Mini Bar" },
      { id: 5, name: "Espresso Maker" },
    ],
  },
  {
    id: 3,
    name: "Presidential Penthouse",
    code: "PRS-SUITE",
    description: "The pinnacle of Addis Ababa luxury. Grand parlor with dining room, wrap-around balcony, private jacuzzi, butler service, and VIP airport chauffeur.",
    base_price_per_night: 350,
    max_occupancy: 4,
    image: "/images/hero-hotel.jpg",
    amenities: [
      { id: 1, name: "Private Jacuzzi" },
      { id: 2, name: "Balcony Lounge" },
      { id: 3, name: "VIP Chauffeur" },
      { id: 4, name: "Dining Room" },
      { id: 5, name: "Dedicated Concierge" },
    ],
  },
];

export default function RoomsPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoomTypes() {
      try {
        const response = await roomAPI.getRoomTypes();
        const data = response.data?.results || response.data || [];
        if (Array.isArray(data) && data.length > 0) {
          setRoomTypes(data);
        } else {
          setRoomTypes(FALLBACK_ROOM_TYPES);
        }
      } catch (err) {
        console.warn("Could not fetch room types from API, using fallback data:", err);
        setRoomTypes(FALLBACK_ROOM_TYPES);
      } finally {
        setLoading(false);
      }
    }
    fetchRoomTypes();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <SparklesIcon className="w-4 h-4" />
              Luxury Accommodation
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Rooms &amp; Designer Suites
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-slate-300">
              Immerse yourself in refined aesthetics, ultra-comfortable bedding, and thoughtful amenities designed for both restorative relaxation and executive productivity.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link
                href="/booking"
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg hover:shadow-blue-500/30 transition-all inline-flex items-center gap-2"
              >
                Book Your Stay
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <Link
                href="/lookup"
                className="px-6 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-medium border border-slate-700 transition-all"
              >
                Lookup Existing Booking
              </Link>
            </div>
          </div>
        </section>

        {/* Room Types Showcase */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Choose Your Haven</h2>
            <p className="mt-2 text-slate-600">
              Every room is meticulously prepared, disinfected, and serviced with 5-star Ethiopian hospitality.
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse h-96" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {roomTypes.map((room) => {
                const price = Number(room.base_price_per_night) || 120;
                return (
                  <div
                    key={room.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                  >
                    {/* Room Card Image */}
                    <div className="relative h-56 bg-slate-100 overflow-hidden">
                      <img
                        src={room.image || "/images/hero-hotel.jpg"}
                        alt={room.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/hero-hotel.jpg";
                        }}
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-slate-900 shadow">
                        Max {room.max_occupancy} {room.max_occupancy === 1 ? "Guest" : "Guests"}
                      </div>
                      <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-medium text-white">
                        {room.code}
                      </div>
                    </div>

                    {/* Room Card Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-baseline justify-between mb-2">
                          <h3 className="text-xl font-bold text-slate-900">{room.name}</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                          {room.description || "Luxurious accommodation with tailored amenities, comfortable bedding, and dedicated guest service."}
                        </p>

                        {/* Key Amenities */}
                        <div className="space-y-1.5 mb-6">
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <CheckBadgeIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>Complimentary High-Speed Wi-Fi</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <CheckBadgeIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>Daily Housekeeping &amp; Turndown Service</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <CheckBadgeIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>Complimentary Gourmet Breakfast</span>
                          </div>
                        </div>
                      </div>

                      {/* Pricing & CTA */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-slate-500 uppercase tracking-wider block">From</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-slate-900">
                              {formatCurrency(price, "USD")}
                            </span>
                            <span className="text-xs text-slate-500">/ night</span>
                          </div>
                        </div>
                        <Link
                          href={`/booking?room=${room.id}`}
                          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow hover:shadow-md transition-all inline-flex items-center gap-1.5"
                        >
                          Book Now
                          <ArrowRightIcon className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Feature Highlights */}
        <section className="bg-white border-y border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Best Rate Guarantee</h4>
              <p className="mt-2 text-sm text-slate-600">
                Book directly through our official portal for the lowest guaranteed rates and flexible cancellation terms.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <BuildingOffice2Icon className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Prime City Center</h4>
              <p className="mt-2 text-sm text-slate-600">
                Located in the heart of Addis Ababa, minutes away from Bole International Airport, embassies, and fine dining.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <WifiIcon className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Modern Conveniences</h4>
              <p className="mt-2 text-sm text-slate-600">
                Fiber optic Wi-Fi, 24/7 power backup generators, smart climate control, and digital keyless access options.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
