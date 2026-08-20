import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "@/lib/providers";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "StayCraft Hotel | Luxury Accommodation",
    template: "%s | StayCraft Hotel",
  },
  description: "Experience luxury and comfort at StayCraft Hotel. Book your stay today.",
  keywords: "hotel, luxury, booking, accommodation, stay",
  authors: [{ name: "StayCraft Hotel" }],
  openGraph: {
    title: "StayCraft Hotel - Luxury Accommodation",
    description: "Experience luxury and comfort at StayCraft Hotel",
    url: "https://staycrafthotel.com",
    siteName: "StayCraft Hotel",
    images: [
      {
        url: "https://staycrafthotel.com/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="inter.className">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
