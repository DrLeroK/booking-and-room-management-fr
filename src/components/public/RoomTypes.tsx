"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { roomAPI } from "@/lib/api/endpoints";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import { SparklesIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

interface RoomTypeItem {
  id: number;
  name: string;
  code?: string;
  price?: string | number;
  base_price_per_night?: string | number;
  description: string;
  image?: string;
  image_url?: string;
  features?: string[];
  max_occupancy?: number;
}

const FALLBACK_ROOMS: RoomTypeItem[] = [
  {
    id: 1,
    name: "Executive King Suite",
    code: "EXEC_KNG",
    base_price_per_night: 4500,
    description: "Ultra-luxury master bedroom with orthopedic king bed, panoramic balcony, jacuzzi, and mini bar.",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
    features: ["King Bed", "City View Balcony", "Jacuzzi Tub", "100Mbps Wi-Fi"],
    max_occupancy: 2,
  },
  {
    id: 2,
    name: "Deluxe Double Bedroom",
    code: "DLX_DBL",
    base_price_per_night: 2800,
    description: "Contemporary bedroom featuring plush queen bedding, ambient lighting, and executive work desk.",
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
    features: ["Queen Bed", "Executive Desk", "Smart TV 55\"", "Free Breakfast"],
    max_occupancy: 2,
  },
  {
    id: 3,
    name: "Presidential Penthouse",
    code: "PRES_PENT",
    base_price_per_night: 15000,
    description: "Top-floor penthouse with private terrace, heated spa tub, dedicated butler, and VIP airport chauffeur.",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    features: ["Wrap-Around Balcony", "Private Jacuzzi", "VIP Chauffeur", "Butler Service"],
    max_occupancy: 4,
  },
  {
    id: 4,
    name: "Standard Single Bedroom",
    code: "STD_SGL",
    base_price_per_night: 1500,
    description: "Soundproof, cozy room tailored for business solo travelers with premium single mattress.",
    image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
    features: ["1 Single Bed", "Ergonomic Desk", "Rainfall Shower", "Fast Wi-Fi"],
    max_occupancy: 1,
  },
];

export function RoomTypes() {
  const [rooms, setRooms] = useState<RoomTypeItem[]>(FALLBACK_ROOMS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoomTypes() {
      try {
        const response = await roomAPI.getRoomTypes();
        const data = response.data?.results || response.data || [];
        if (Array.isArray(data) && data.length > 0) {
          setRooms(data);
        } else {
          setRooms(FALLBACK_ROOMS);
        }
      } catch (err) {
        console.warn("Could not load room types from API, using fallback data:", err);
        setRooms(FALLBACK_ROOMS);
      } finally {
        setLoading(false);
      }
    }
    fetchRoomTypes();
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-white via-amber-50/15 to-slate-50 relative">
      <div className="container-custom">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs font-semibold tracking-wider uppercase mb-3">
            <SparklesIcon className="w-3.5 h-3.5 text-amber-600" />
            <span>Designer Accommodations</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Our Rooms &amp; <span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">Suites</span>
          </h2>
          <p className="text-slate-600 text-center max-w-2xl mx-auto mt-3">
            Choose from our curated selection of beautifully appointed bedrooms and suites with authentic Ethiopian hospitality.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {rooms.slice(0, 4).map((room, index) => {
            const fallbackImg = FALLBACK_ROOMS[index % FALLBACK_ROOMS.length].image!;
            const imgSrc = getImageUrl(room.image_url || room.image) || fallbackImg;
            const price = room.base_price_per_night || room.price || 2800;

            return (
              <div
                key={room.id}
                className="card overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col justify-between border border-slate-200 group bg-white"
              >
                <div>
                  <div className="relative h-52 overflow-hidden bg-slate-900">
                    <img
                      src={imgSrc}
                      alt={room.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fallbackImg;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {room.code && (
                      <div className="absolute bottom-2.5 left-2.5 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-mono font-bold text-amber-300">
                        {room.code}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-900">{room.name}</h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {room.description || "Spacious bedroom with tailored luxury amenities."}
                    </p>
                    <ul className="mt-4 space-y-1.5">
                      {(room.features || ["High-Speed Wi-Fi", "Daily Breakfast", "Air Conditioning"]).map((feature) => (
                        <li key={feature} className="text-xs text-slate-600 flex items-center">
                          <span className="text-amber-500 mr-2 font-bold">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="mt-2 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block uppercase">Nightly Rate</span>
                      <span className="text-xl font-black text-amber-600">
                        {formatCurrency(price, "ETB")}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/booking?room=${room.id}`}
                    className="mt-4 w-full py-2.5 px-4 rounded-xl text-center inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold text-xs shadow-md transition-all"
                  >
                    <span>Book Suite</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
