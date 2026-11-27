"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const amenities = [
  { icon: "🛜", name: "Free Wi-Fi", description: "High-speed internet throughout the hotel" },
  { icon: "🍳", name: "Breakfast Included", description: "Complimentary daily breakfast buffet" },
  { icon: "🏊", name: "Swimming Pool", description: "Temperature-controlled indoor pool" },
  { icon: "💪", name: "Fitness Center", description: "State-of-the-art gym facilities" },
  { icon: "🧖", name: "Spa Services", description: "Relaxing treatments and massages" },
  { icon: "🚗", name: "Free Parking", description: "Secure valet parking for guests" },
  { icon: "🔄", name: "Airport Transfer", description: "Convenient transportation service" },
  { icon: "👔", name: "Business Center", description: "Fully equipped meeting rooms" },
];

export function Amenities({ data }: { data?: any[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const amenitiesList = data && data.length > 0
    ? data.map(item => ({
        icon: item.icon_name || "✨",
        name: item.name,
        description: item.description || "Premium hotel service"
      }))
    : amenities;

  return (
    <section ref={ref} className="py-16 bg-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 tracking-wide uppercase mb-3">
            ✨ World-Class Comfort
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Premium Amenities</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Enjoy world-class amenities designed to make your stay comfortable, luxurious, and memorable.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {amenitiesList.map((amenity, index) => (
            <motion.div
              key={amenity.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="card p-6 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group border border-amber-100/80 hover:border-amber-400/60 bg-gradient-to-b from-white to-amber-50/10"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">{amenity.icon}</div>
              <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-amber-800 transition-colors">{amenity.name}</h3>
              <p className="text-sm text-gray-500">{amenity.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
