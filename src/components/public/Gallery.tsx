"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { contentAPI } from "@/lib/api/endpoints";

interface GalleryItem {
  id: number;
  title: string;
  category?: any;
  category_name?: string;
  image?: string;
  caption?: string;
}

const getImageUrl = (path?: string) => {
  if (!path) return "";
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  const baseUrl = apiUrl.replace("/api/v1", "");
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};

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
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch real gallery items from backend:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, []);

  return (
    <section ref={ref} className="py-16 bg-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-blue-600 font-semibold text-sm tracking-wide uppercase">Visual Showcase</span>
          <h2 className="text-3xl font-bold text-gray-900 mt-1 mb-4">Explore Our Gallery</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the beauty and luxury of StayCraft Hotel through our real photograph gallery.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-56 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No gallery photos uploaded yet.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.slice(0, 8).map((item, index) => {
              const categoryLabel =
                typeof item.category === "object"
                  ? item.category?.name
                  : item.category_name || item.category || "Hotel";
              const imgSrc = getImageUrl(item.image);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                  className="group relative overflow-hidden rounded-xl shadow-md bg-gray-100 h-56"
                >
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-4 text-white text-center">
                      <div>
                        <span className="text-3xl block mb-1">🏨</span>
                        <h4 className="font-semibold text-sm">{item.title}</h4>
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="text-white">
                      <span className="text-xs bg-blue-600 px-2 py-0.5 rounded-full inline-block mb-1 font-medium">
                        {categoryLabel}
                      </span>
                      <h3 className="font-semibold text-sm line-clamp-1">{item.title}</h3>
                      {item.caption && (
                        <p className="text-xs text-gray-300 line-clamp-1 mt-0.5">{item.caption}</p>
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
          className="text-center mt-10"
        >
          <Link href="/gallery" className="btn-primary inline-block hover:scale-105 transition-transform duration-300">
            View Full Photo Gallery
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
