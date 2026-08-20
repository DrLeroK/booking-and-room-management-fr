"use client";

import { useEffect, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { contentAPI } from "@/lib/api/endpoints";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category?: string;
}

export function FAQ() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFAQs() {
      try {
        const response = await contentAPI.getFAQs();
        const data = response.data?.results || response.data || [];
        setFaqs(Array.isArray(data) ? data : []);
        if (data.length > 0) {
          setOpenId(data[0].id);
        }
      } catch (error) {
        console.error("Failed to load real FAQs from backend:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFAQs();
  }, []);

  const toggle = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <span className="text-blue-600 font-semibold text-sm tracking-wide uppercase">Got Questions?</span>
          <h2 className="text-3xl font-bold text-gray-900 mt-1 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find official answers regarding StayCraft room reservations, payment policies, check-in, and amenities.
          </p>
        </div>

        {loading ? (
          <div className="max-w-3xl mx-auto space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="card p-4 h-16 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : faqs.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No FAQs published yet.</div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="card p-4 hover:shadow-md transition-shadow">
                <button
                  onClick={() => toggle(faq.id)}
                  className="w-full flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  {openId === faq.id ? (
                    <ChevronUpIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openId === faq.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
