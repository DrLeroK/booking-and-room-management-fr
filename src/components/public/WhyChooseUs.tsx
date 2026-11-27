"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    icon: "✨",
    title: "Luxury Experience",
    description: "Premium amenities and personalized service for an unforgettable stay.",
  },
  {
    icon: "🌍",
    title: "Prime Location",
    description: "Centrally located with easy access to everything the city offers.",
  },
  {
    icon: "⭐",
    title: "Exceptional Service",
    description: "Our dedicated team ensures your comfort and satisfaction.",
  },
  {
    icon: "🔒",
    title: "Secure Booking",
    description: "Safe and secure payment processing with 24/7 support.",
  },
];

export function WhyChooseUs() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="py-16 bg-gray-50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 tracking-wide uppercase mb-3">
            ⭐ The StayCraft Standard
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose StayCraft?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover what makes us the preferred choice for discerning travelers and dignitaries worldwide.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="card p-6 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-amber-100/70 hover:border-amber-400/50 bg-gradient-to-b from-white to-amber-50/10 group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-amber-800 transition-colors">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
