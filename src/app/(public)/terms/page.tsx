"use client";

import Link from "next/link";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { DocumentTextIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
              <DocumentTextIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Terms &amp; Conditions</h1>
              <p className="text-sm text-slate-500">Last updated: November 2026</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Reservation &amp; Booking Policy</h2>
            <p>
              By reserving a room through StayCraft Hotel, you agree to provide authentic and accurate guest information, including full legal name, valid phone number, and official identification document upon check-in.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Payment &amp; Deposit Verification</h2>
            <p>
              Online reservations require proof of payment transfer (e.g. CBE, Telebirr, or wire transfer) within 24 hours of booking. Reservations remain in &quot;Pending Verification&quot; status until verified and confirmed by our reception desk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Check-In &amp; Check-Out Hours</h2>
            <p>
              Standard check-in begins at 2:00 PM (14:00) East Africa Time. Check-out is by 11:00 AM. Early check-in or late check-out is subject to room availability and may incur supplemental charges.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Cancellation &amp; No-Show Policy</h2>
            <p>
              Cancellations made at least 48 hours prior to check-in date are eligible for full refund or rebooking credits. Cancellations made under 48 hours or failure to arrive (No-Show) are subject to a cancellation fee equivalent to one night&apos;s accommodation rate.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Hotel Rules &amp; Conduct</h2>
            <p>
              StayCraft Hotel maintains a non-smoking policy across all interior guest rooms. Guests are expected to observe quiet hours between 10:00 PM and 7:00 AM to ensure comfort and tranquility for all patrons.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
