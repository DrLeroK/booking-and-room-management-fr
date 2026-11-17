# 🏨 StayCraft Hotel & Room Management System — Frontend

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15%2F16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Django REST](https://img.shields.io/badge/Django_REST-6.0-092E20?style=for-the-badge&logo=django)](https://www.django-rest-framework.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<p align="center">
  A state-of-the-art, enterprise-grade Hotel & Bedroom Management Web Platform built with <b>Next.js App Router</b>, <b>TypeScript</b>, <b>Tailwind CSS</b>, and <b>Framer Motion</b>.
</p>

</div>

---

## 📸 Screenshots

### 🏨 Public Landing Page
![Landing Page](public/screenshots/landing-page.png)

### 🖥️ Booking Page
![Admin Dashboard](public/screenshots/booking-page.png)

### 🛎️ Receptionist Dashboard
![User Dashboard Desktop](public/screenshots/receptionist-dashboard.png)

### 📱 Manager Dashboard
![User Dashboard Mobile](public/screenshots/manager-dashboard.png)

---


## 📖 Overview

**StayCraft Frontend** is a modern, responsive web application designed for hotel guests and hotel management teams. It provides a complete digital booking experience for guests—including room availability search, bank transfer payment proof uploads, and reservation tracking—as well as specialized operational dashboards for **Receptionists**, **Managers**, **Owners**, and **Administrators**.

---

## ✨ Features & Functionality

### 🌐 1. Public Guest Experience
- **Dynamic Hotel Landing Page**: Single-page overview displaying hotel profile, room categories, amenities, guest testimonials, photo gallery, corporate airline partners, and FAQs.
- **Online Room Search & Booking**: Real-time room availability filter by date range and guest count. Guests can submit reservations with uploaded bank transfer screenshot proof.
- **Stay Lookup**: Guests can check their booking confirmation and room status instantly using their phone number.
- **Contact & Inquiry System**: Public contact form connected directly to backend staff notifications.

### 🛎️ 2. Receptionist Portal (`/reception`)
- **Live Operations Board**: Real-time breakdown of occupied rooms, expected arrivals/departures today, and pending payment proof verification queue.
- **Offline Mode & Outbox Sync (`OfflineNoticeBanner.tsx`)**:
  - High-visibility banner when internet disconnects:
    > *"OFFLINE MODE: Room inventory is unconfirmed. Only assign rooms from the Emergency Offline Pool. ⚠️ Warning: Do not sell the last remaining room without manager verification."*
  - Automatically stores check-ins to local outbox (`localStorage`) with unique idempotency keys (`X-Idempotency-Key`).
  - Auto-synchronizes with backend on reconnection and displays conflict warnings (`409 Conflict`) if an offline room was claimed.
- **Walk-In Check-In**: Instant registration of walk-in guests, room allocation, security deposit recording, and key card assignment.
- **Reservation Check-In**: Process confirmed online bookings upon guest arrival.
- **Check-Out Processing**: Departure logging, extra charge calculation (mini-bar, damage fees), room cleaning status updates (`DIRTY_CLEANING`).
- **Payment Verification & Rejection Modal**: Staff inspect uploaded bank transfer screenshots. Approving confirms booking; rejecting instantly marks payment as failed, cancels booking, and **releases the room immediately back to available inventory**.
- **Stay Extensions (`ExtendStayModal`)**: Dynamically extend active stays with real-time room availability conflict checks and price recalculations.

### 📊 3. Manager Dashboard (`/manager`)
- **Room Inventory Management**: Complete CRUD operations for rooms, room types, pricing, and amenities.
- **Operational Oversight**: View live room statuses (*Available, Occupied, Cleaning, Maintenance*).
- **Staff Administration**: Manage receptionist accounts and monitor front desk activity.

### 👑 4. Owner & Executive Dashboard (`/owner`)
- **Executive Revenue KPIs**: Real-time metrics for total revenue, occupancy rate %, Average Daily Rate (ADR), and Revenue Per Available Room (RevPAR).
- **Staff Management**: Create staff accounts, filter by role (`RECEPTIONIST`, `MANAGER`, `OWNER`, `ADMIN`), and toggle account active status.
- **Financial Reports & Exports**: Export CSV reports for bookings, payments, and guest registers.

### 📱 5. Progressive Web App (PWA) & SEO/AEO/GEO
- **PWA Installation**: Installable as a native desktop or mobile app via `manifest.ts` / `manifest.json` and `sw.js` service worker.
- **Search & AI Optimization**: Dynamic `robots.ts` and `sitemap.ts` configured for Google SEO, Answer Engine Optimization (AEO), and Generative Engine Optimization (GEO).

### 🔐 6. Authentication, Security & Next.js Proxy
- **JWT Authentication**: SimpleJWT integration with automatic token refreshing via Axios interceptors.
- **Next.js Server-Side Route Guard (`src/proxy.ts`)**: Migrated to Next.js 16 `proxy.ts` convention:
  - `/owner/*` → Restricted to `OWNER` & `ADMIN`.
  - `/manager/*` → Restricted to `MANAGER`, `OWNER` & `ADMIN`.
  - `/reception/*` → Restricted to `RECEPTIONIST`, `MANAGER`, `OWNER` & `ADMIN`.
- **API Rewrites Proxy (`next.config.ts`)**: Bypasses CORS issues by proxying `/api/v1/*` requests to the Django REST backend.
- **1-Click Demo Login Credentials**: Quick auto-fill buttons on the login page matching database seed accounts.
- **Rate Limit & Brute-Force Alerting**: Graceful parsing of backend `429 Too Many Requests` status and 15-minute account lockout notices.

---

## 🔑 Demo Login Credentials

| Role | Username | Password | Dashboard Access |
| :--- | :--- | :--- | :--- |
| **Manager** | `manager` | `Manager@StayCraft2026!` | `/manager` |
| **Receptionist** | `receptionist1` | `Reception@StayCraft2026!` | `/reception` |
| **Owner** | `owner` | `Owner@StayCraft2026!` | `/owner` |
| **Admin** | `admin` | `Admin@StayCraft2026!` | `/owner` |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS 4.0, Framer Motion Animations
- **State Management**: Zustand (`authStore.ts`, `uiStore.ts`)
- **Offline Engine**: Custom Outbox Queue with Idempotency Key Replay
- **Form Handling**: React Hook Form, Zod Validation
- **HTTP Client**: Axios with Request/Response Interceptors
- **Notifications**: React Hot Toast
- **Icons**: Heroicons & Lucide React

---

## 📁 Directory Structure

```
booking-and-room-management-fr/
├── public/
│   ├── sw.js                     # Service Worker for PWA caching & offline support
│   ├── manifest.json             # Web App Manifest specification
│   ├── icon-192.png              # PWA App Icon (192x192)
│   ├── icon-512.png              # PWA App Icon (512x512)
│   └── images/                   # Static images (hero background, room previews)
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/            # Role login page with 1-click demo buttons
│   │   │   ├── forgot-password/  # Password recovery request page
│   │   │   └── reset-password/   # Token-based password reset page
│   │   ├── (dashboard)/
│   │   │   ├── manager/          # Room inventory, amenities & staff management
│   │   │   ├── owner/            # Executive revenue analytics & staff creation
│   │   │   └── reception/        # Live board, check-in, check-out, bookings, payments
│   │   ├── (public)/
│   │   │   ├── about/            # About hotel page
│   │   │   ├── booking/          # Room availability search & Last-Room Rule notice
│   │   │   ├── contact/          # Inquiry form page
│   │   │   ├── gallery/          # Full photo gallery showcase
│   │   │   ├── lookup/           # Stay status lookup by phone number
│   │   │   └── services/         # Amenities & services list
│   │   ├── manifest.ts           # Dynamic Next.js Web App Manifest
│   │   ├── robots.ts             # Dynamic robots.txt for search engines
│   │   ├── sitemap.ts            # Dynamic sitemap.xml for SEO/AEO/GEO
│   │   ├── globals.css           # Global Tailwind CSS styles
│   │   ├── layout.tsx            # Root HTML layout, Zustand providers & PWA register
│   │   └── page.tsx              # Public landing homepage
│   ├── components/
│   │   ├── common/               # Header, Footer, OfflineNoticeBanner, PWARegister
│   │   ├── layout/               # DashboardShell, Sidebar, Topbar
│   │   ├── modals/               # ExtendStayModal, PaymentProofModal, RejectionWarningModal
│   │   └── public/               # HeroSection, Amenities, Testimonials, Gallery, FAQ
│   ├── lib/
│   │   ├── api/                  # Axios HTTP client, endpoints & JWT interceptors
│   │   ├── offline-sync.ts       # Outbox queue manager & automatic online synchronization
│   │   ├── security.ts           # Storage encryption helpers & token validation
│   │   ├── providers.tsx         # Client context providers
│   │   └── store/                # Zustand stores (authStore & uiStore)
│   └── proxy.ts                  # Next.js 16 Server-Side Route Guard & Role Redirector
├── .env.example                  # Environment variables template (no public prefixes)
├── next.config.ts                # Next.js configuration & API proxy rewrites
├── package.json                  # Dependencies & npm scripts
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # Project documentation
```

---

## 🚀 How to Clone & Run from GitHub

### 1. Clone the Repository
```bash
git clone https://github.com/DrLeroK/booking-and-room-management-fr.git
cd booking-and-room-management-fr
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the project root:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=StayCraft Grand Hotel
```

### 4. Ensure Backend is Running

NOTE - THERE IS A BACKEND FOR THIS FRONTEND IN THE REPO - https://github.com/DrLeroK/room_management_backend.git

### 5. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---


## 🤝 Contributing

- Fork the repository
- Create your feature branch (git checkout -b feature/amazing-feature)
- Commit your changes (git commit -m 'Add some amazing feature')
- Push to the branch (git push origin feature/amazing-feature)
- Open a Pull Request

# 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

