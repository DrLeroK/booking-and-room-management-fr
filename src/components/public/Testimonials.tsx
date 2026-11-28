"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { contentAPI } from "@/lib/api/endpoints";
import { getImageUrl } from "@/lib/utils";
import { StarIcon } from "@heroicons/react/24/solid";

interface TestimonialItem {
  id: number;
  guest_name: string;
  guest_title: string;
  comment: string;
  rating: number;
  avatar?: string;
  location?: string;
  is_featured?: boolean;
}

const FALLBACK_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 1,
    guest_name: "Abebe Bikila",
    guest_title: "Diplomatic Envoy & Regular Guest",
    comment: "The presidential suite surpassed all expectations. The level of luxury, attentive concierge, and serene ambience made my stay extraordinarily seamless.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    location: "Addis Ababa",
  },
  {
    id: 2,
    guest_name: "Elena Rostova",
    guest_title: "International Travel Journalist",
    comment: "Flawless attention to detail. From the gourmet breakfast to the panoramic city views and opulent spa services, StayCraft defines authentic hospitality.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    location: "London, UK",
  },
  {
    id: 3,
    guest_name: "Dr. Marcus Vance",
    guest_title: "Global Tech Executive",
    comment: "The executive suite was equipped with high-speed fiber internet and whisper-quiet rooms. The seamless digital booking and ETB payment verification made checkout effortless.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    location: "Geneva, Switzerland",
  },
];

export function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(FALLBACK_TESTIMONIALS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const response = await contentAPI.getTestimonials();
        const data = response.data?.results || response.data || [];
        if (Array.isArray(data) && data.length > 0) {
          setTestimonials(data);
        }
      } catch (error) {
        console.warn("Failed to load live testimonials, using luxury fallbacks:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTestimonials();
  }, []);

  return (
    <section ref={ref} className="py-16 bg-gray-50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 tracking-wide uppercase">
            <StarIcon className="w-3.5 h-3.5 text-amber-500" />
            Guest Experiences
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">What Our Guests Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Read real reviews from our valued guests who have experienced StayCraft luxury and Ethiopian hospitality.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="card p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-12 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No guest reviews loaded yet.
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((item, index) => {
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="card p-6 hover:shadow-2xl hover:border-amber-400/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between border border-amber-100 bg-gradient-to-b from-white via-white to-amber-50/20"
                >
                  <div>
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 text-base">{item.guest_name}</h4>
                      <p className="text-xs text-amber-700 font-medium mt-0.5">
                        {item.guest_title || item.location || "Verified Guest"}
                      </p>
                    </div>
                    <div className="mb-3 flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-4 h-4 ${i < Math.round(item.rating) ? "text-amber-400" : "text-gray-200"}`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed italic">
                      &ldquo;{item.comment}&rdquo;
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
