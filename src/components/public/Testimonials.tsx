"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { contentAPI } from "@/lib/api/endpoints";

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

const renderStars = (rating: number) => {
  const rounded = Math.min(5, Math.max(1, Math.round(rating)));
  return "⭐".repeat(rounded) + "☆".repeat(5 - rounded);
};

const getImageUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};

export function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const response = await contentAPI.getTestimonials();
        const data = response.data?.results || response.data || [];
        setTestimonials(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load real testimonials from backend:", error);
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
          <span className="text-blue-600 font-semibold text-sm tracking-wide uppercase">Guest Experiences</span>
          <h2 className="text-3xl font-bold text-gray-900 mt-1 mb-4">What Our Guests Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Read real reviews from our valued guests who have experienced StayCraft hospitality.
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
              const avatarSrc = getImageUrl(item.avatar);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="card p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          alt={item.guest_name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                          {item.guest_name ? item.guest_name.charAt(0).toUpperCase() : "G"}
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.guest_name}</h4>
                        <p className="text-xs text-gray-500">
                          {item.guest_title || item.location || "Verified Guest"}
                        </p>
                      </div>
                    </div>
                    <div className="mb-3 text-lg">{renderStars(item.rating)}</div>
                    <p className="text-gray-600 text-sm leading-relaxed italic">
                      "{item.comment}"
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
