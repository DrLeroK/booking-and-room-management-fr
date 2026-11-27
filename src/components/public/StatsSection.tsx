"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const stats = [
  { label: "Delighted Guests", value: "3,500+", icon: "✨" },
  { label: "Luxury Suites", value: "50+", icon: "🏨" },
  { label: "5-Star Ratings", value: "4.9 / 5", icon: "⭐" },
  { label: "Years of Excellence", value: "8+", icon: "👑" },
];

export function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="py-14 bg-white relative">
      <div className="container-custom">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-white border border-amber-500/20 shadow-sm hover:shadow-lg hover:border-amber-500/40 transition-all duration-300"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-600 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-600 mt-1 uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
