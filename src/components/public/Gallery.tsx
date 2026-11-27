"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { contentAPI } from "@/lib/api/endpoints";
import { getImageUrl } from "@/lib/utils";
import { SparklesIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

interface GalleryItem {
  id: number;
  title: string;
  category?: any;
  category_name?: string;
  image?: string;
  image_url?: string;
  caption?: string;
}

const FALLBACK_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    title: "Executive King Bedroom",
    category_name: "Bedrooms & Suites",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
    caption: "Spacious master bedroom with plush king mattress and ambient lighting",
  },
  {
    id: 2,
    title: "Presidential Penthouse Suite",
    category_name: "Bedrooms & Suites",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    caption: "Top-floor panoramic city terrace view with private jacuzzi",
  },
  {
    id: 3,
    title: "Deluxe Double Bedroom",
    category_name: "Bedrooms & Suites",
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
    caption: "Contemporary elegance featuring premium queen bedding",
  },
  {
    id: 4,
    title: "Gourmet Restaurant & Bar",
    category_name: "Dining & Lounge",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    caption: "International & traditional Ethiopian gourmet dining",
  },
  {
    id: 5,
    title: "Rooftop Sunset Lounge",
    category_name: "Dining & Lounge",
    image: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&q=80",
    caption: "Artisanal cocktails and sweeping skyline sunset views",
  },
  {
    id: 6,
    title: "Luxury Spa & Heated Bath",
    category_name: "Spa & Fitness",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
    caption: "Holistic relaxation treatments and therapeutic massages",
  },
  {
    id: 7,
    title: "Skyline Infinity Pool",
    category_name: "Spa & Fitness",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
    caption: "Heated swimming pool with private cabanas and deck loungers",
  },
  {
    id: 8,
    title: "Grand Hotel Lobby & Concierge",
    category_name: "Architecture & Grounds",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80",
    caption: "Welcoming marble atrium, gold chandeliers, and 24/7 concierge",
  },
];

export function Gallery() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGallery() {
      try {
        const response = await contentAPI.getGallery();
        const data = response.data?.results || response.data || [];
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
        } else {
          setItems(FALLBACK_GALLERY_ITEMS);
        }
      } catch (error) {
        console.warn("Failed to fetch gallery items from backend, using luxury fallback imagery:", error);
        setItems(FALLBACK_GALLERY_ITEMS);
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, []);

  const displayList = items.length > 0 ? items : FALLBACK_GALLERY_ITEMS;

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-slate-50 via-amber-50/20 to-white relative overflow-hidden">
      {/* Subtle luxury ambient gold glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-amber-200/15 rounded-full blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs font-semibold tracking-wider uppercase mb-3">
            <SparklesIcon className="w-3.5 h-3.5 text-amber-600" />
            <span>Visual Showcase</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Explore Our <span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">Gallery</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto mt-3 text-base">
            Discover the beauty, modern architecture, and refined luxury of StayCraft Hotel through high-definition photography.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="h-60 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {displayList.slice(0, 8).map((item, index) => {
              const categoryLabel =
                typeof item.category === "object"
                  ? item.category?.name
                  : item.category_name || item.category || "Resort";
              const rawPath = item.image_url || item.image;
              const fallbackUrl = FALLBACK_GALLERY_ITEMS[index % FALLBACK_GALLERY_ITEMS.length].image!;
              const imgSrc = getImageUrl(rawPath) || fallbackUrl;

              return (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.06, duration: 0.4 }}
                  className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 bg-slate-900 h-60 border border-amber-500/20"
                >
                  <img
                    src={imgSrc}
                    alt={item.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = fallbackUrl;
                    }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <span className="text-[11px] bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold px-2.5 py-0.5 rounded-full inline-block mb-1.5 shadow-sm">
                        {categoryLabel}
                      </span>
                      <h3 className="font-bold text-sm text-white line-clamp-1">{item.title}</h3>
                      {item.caption && (
                        <p className="text-xs text-amber-100/90 line-clamp-1 mt-0.5">{item.caption}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center mt-12"
        >
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 transition-all duration-300"
          >
            <span>View Full Photo Gallery</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
