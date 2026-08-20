"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon, UserGroupIcon, MagnifyingGlassIcon, StarIcon } from "@heroicons/react/24/outline";
import { format, addDays } from "date-fns";

export function HeroSection() {
  const router = useRouter();
  const today = new Date();
  const [checkIn, setCheckIn] = useState(format(today, "yyyy-MM-dd"));
  const [checkOut, setCheckOut] = useState(format(addDays(today, 2), "yyyy-MM-dd"));
  const [guests, setGuests] = useState("2");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/booking?check_in=${checkIn}&check_out=${checkOut}&guests=${guests}`);
  };

  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-20 lg:py-32 overflow-hidden">
      {/* Golden/Yellowish Accent Graphics */}
      <div className="absolute inset-0">
        {/* Top-right golden glow */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl" />
        
        {/* Bottom-left golden glow */}
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl" />
        
        {/* Center subtle golden glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-300/5 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

      {/* Golden decorative lines */}
      <div className="absolute top-20 left-10 w-32 h-0.5 bg-gradient-to-r from-yellow-400/50 to-transparent hidden lg:block" />
      <div className="absolute bottom-20 right-10 w-32 h-0.5 bg-gradient-to-l from-yellow-400/50 to-transparent hidden lg:block" />

      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Badge with golden accent */}
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400/10 text-yellow-300 text-sm font-semibold tracking-wide border border-yellow-400/30 backdrop-blur-sm">
              <StarIcon className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span>Welcome to StayCraft Hotel</span>
              <StarIcon className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Experience <span className="bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">Luxury</span> & 
            <span className="bg-gradient-to-r from-yellow-200 to-amber-300 bg-clip-text text-transparent"> Comfort</span> Beyond Compare
          </h1>

          <p className="text-lg sm:text-xl text-blue-100 font-light max-w-2xl mx-auto leading-relaxed">
            Book your perfect stay in our premium rooms and suites with world-class amenities and personalized service.
          </p>

          {/* Booking Search Card with golden accent border */}
          <div className="mt-8 bg-white/95 backdrop-blur-sm text-gray-900 p-6 rounded-2xl shadow-2xl border border-yellow-400/20">
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="text-left">
                <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1 text-yellow-500" /> Check-In
                </label>
                <input
                  type="date"
                  value={checkIn}
                  min={format(today, "yyyy-MM-dd")}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <div className="text-left">
                <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1 text-yellow-500" /> Check-Out
                </label>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <div className="text-left">
                <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center">
                  <UserGroupIcon className="h-4 w-4 mr-1 text-yellow-500" /> Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all"
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4+ Guests</option>
                </select>
              </div>

              <div className="sm:col-span-3 mt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 hover:from-yellow-500 hover:via-yellow-600 hover:to-amber-600 text-gray-900 font-bold text-sm shadow-lg shadow-yellow-500/25 transition-all duration-300 flex items-center justify-center space-x-2 group hover:scale-[1.02]"
                >
                  <MagnifyingGlassIcon className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Search Available Rooms</span>
                </button>
              </div>
            </form>
          </div>

          {/* Trust indicators with golden accent */}
          <div className="flex flex-wrap justify-center gap-6 pt-4 text-blue-200/80 text-sm">
            <div className="flex items-center gap-2">
              <StarIcon className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span>5-Star Rated</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-yellow-400/50" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-yellow-400/50" />
              <span>Best Price Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-yellow-400/50" />
              <span>Free Cancellation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom decorative wave with golden hue */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 70C840 80 960 100 1080 105C1200 110 1320 110 1380 110L1440 110V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
