"use client";

import Link from "next/link";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { ShieldCheckIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function PrivacyPage() {
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
              <ShieldCheckIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
              <p className="text-sm text-slate-500">Last updated: November 2026</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Information We Collect</h2>
            <p>
              When you use StayCraft Hotel services, we collect information necessary to manage reservations and ensure guest safety, including:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-600">
              <li>Contact details (name, email address, normalized phone number)</li>
              <li>Official government identification (Passport, National ID, Driving License)</li>
              <li>Transaction references and uploaded payment transfer slips</li>
              <li>Booking preferences and special hospitality requests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. How We Use Your Data</h2>
            <p>
              Your personal information is strictly utilized to process reservations, verify bank transfer payments, send SMS/Email confirmations, comply with hospitality regulatory standards, and deliver personalized hotel concierge services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Data Security &amp; Storage</h2>
            <p>
              Uploaded payment proofs and guest records are secured using enterprise-grade encryption and cloud object storage (Cloudflare R2 S3-Compatible API) with restricted access limited exclusively to authorized front desk receptionists and hotel managers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Third-Party Sharing</h2>
            <p>
              StayCraft Hotel never sells, rents, or trades your personal information to third-party advertisers. Data is only shared when legally mandated by municipal hospitality regulations or law enforcement authorities.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Contact Our Privacy Officer</h2>
            <p>
              If you have inquiries regarding your personal data or wish to request data correction, please email our security officer at <a href="mailto:privacy@staycrafthotel.com" className="text-blue-600 underline">privacy@staycrafthotel.com</a> or speak with our Front Desk Manager.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
