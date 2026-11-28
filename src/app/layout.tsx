import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { AppProviders } from '@/providers/app-providers';
import { PWARegister } from '@/components/common/PWARegister';

const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3007';

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'StayCraft Hotel | Luxury Boutique Accommodation & Suites',
    template: '%s | StayCraft Hotel',
  },
  description:
    'Experience world-class luxury, contemporary suites, and unparalleled hospitality at StayCraft Hotel. Reserve your stay with instant confirmation and seamless check-in.',
  keywords: [
    'StayCraft Hotel',
    'Luxury Hotel',
    'Boutique Accommodation',
    'Hotel Suites',
    'Online Room Reservation',
    'Executive Suites',
    'Hotel Booking System',
    'Addis Ababa Luxury Stay',
  ],
  authors: [{ name: 'StayCraft Hospitality Group' }],
  creator: 'StayCraft',
  publisher: 'StayCraft Luxury Hotels',
  applicationName: 'StayCraft Hotel',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'StayCraft Hotel',
  },
  openGraph: {
    title: 'StayCraft Hotel | Luxury Boutique Accommodation & Suites',
    description:
      'Indulge in sophisticated comfort and personalized concierge service. Book directly with StayCraft for exclusive rates and guaranteed reservations.',
    url: siteUrl,
    siteName: 'StayCraft Hotel',
    images: [
      {
        url: `${siteUrl}/images/hero-hotel.jpg`,
        width: 1200,
        height: 630,
        alt: 'StayCraft Luxury Hotel & Suites Lobby',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StayCraft Hotel | Luxury Accommodation & Suites',
    description:
      'Discover refined comfort, fine dining, and bespoke room reservations at StayCraft Hotel.',
    images: [`${siteUrl}/images/hero-hotel.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// JSON-LD Structured Data for Search Engines & AI Models (SEO, AEO, and GEO)
const jsonLdStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['Hotel', 'LodgingBusiness'],
      '@id': `${siteUrl}/#hotel`,
      name: 'StayCraft Hotel & Suites',
      description:
        'Premier luxury boutique hotel offering elegantly appointed rooms, deluxe suites, 24/7 concierge service, fine dining, and seamless online booking.',
      url: siteUrl,
      telephone: '+251 911 000 000',
      priceRange: '$$$',
      currenciesAccepted: 'ETB, USD, EUR',
      paymentAccepted: 'Credit Card, Debit Card, Bank Wire Transfer, Mobile Money',
      checkinTime: '14:00',
      checkoutTime: '11:00',
      starRating: {
        '@type': 'Rating',
        ratingValue: '5',
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Bole Medhanealem District',
        addressLocality: 'Addis Ababa',
        addressCountry: 'ET',
      },
      amenityFeature: [
        { '@type': 'LocationFeatureSpecification', name: 'High-Speed Wi-Fi', value: true },
        { '@type': 'LocationFeatureSpecification', name: '24/7 Front Desk & Concierge', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Complimentary Breakfast', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Room Service & In-Suite Dining', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Airport Shuttle Service', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Secure On-Site Parking', value: true },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': `${siteUrl}/#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I book a room at StayCraft Hotel?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'You can reserve rooms directly online through the StayCraft Booking Portal. Select your dates, pick your desired room type, enter your contact information, and receive instant confirmation with bank transfer payment instructions.',
          },
        },
        {
          '@type': 'Question',
          name: 'What are the check-in and check-out times?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Standard check-in begins at 2:00 PM (14:00), and check-out is by 11:00 AM. Early check-in and express late check-out can be requested with the front desk receptionist.',
          },
        },
        {
          '@type': 'Question',
          name: 'How can I check the status of my hotel reservation?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Guests can check their booking status anytime by visiting our Booking Lookup page (/lookup) or providing their booking reference code to our 24/7 front desk team.',
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdStructuredData) }}
        />
      </head>
      <body className="font-sans antialiased bg-slate-50 text-slate-900">
        <AppProviders>
          <PWARegister />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
