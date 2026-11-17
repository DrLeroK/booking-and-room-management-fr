"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { contentAPI } from "@/lib/api/endpoints";

interface PartnerItem {
  id: number;
  name: string;
  logo?: string;
  description?: string;
  website_url?: string;
}

const getImageUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  const baseUrl = apiUrl.replace("/api/v1", "");
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};

export function Partners() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPartners() {
      try {
        const response = await contentAPI.getPartners();
        const data = response.data?.results || response.data || [];
        setPartners(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load real partners from backend:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPartners();
  }, []);

  if (!loading && partners.length === 0) return null;

  return (
    <section ref={ref} className="py-16 bg-slate-900 text-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-yellow-400 font-semibold text-sm tracking-wide uppercase">Corporate Network</span>
          <h2 className="text-3xl font-bold mt-1 mb-4">Our Trusted Partners & Sponsors</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm">
            We collaborate with leading airline carriers, financial institutions, and international travel networks.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-24 bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {partners.map((partner, index) => {
              const logoSrc = getImageUrl(partner.logo);
              const cardContent = (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="bg-slate-800/80 border border-slate-700/60 hover:border-yellow-400/50 p-6 rounded-xl text-center hover:bg-slate-800 transition-all duration-300 hover:-translate-y-1 flex flex-col items-center justify-center h-32"
                >
                  {logoSrc ? (
                    <img
                      src={logoSrc}
                      alt={partner.name}
                      className="max-h-12 max-w-full object-contain mb-2 filter brightness-110"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center mb-2">
                      {partner.name.charAt(0)}
                    </div>
                  )}
                  <h4 className="font-semibold text-sm text-slate-200">{partner.name}</h4>
                  {partner.description && (
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{partner.description}</p>
                  )}
                </motion.div>
              );

              if (partner.website_url) {
                return (
                  <a
                    key={partner.id}
                    href={partner.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    {cardContent}
                  </a>
                );
              }
              return cardContent;
            })}
          </div>
        )}
      </div>
    </section>
  );
}
