import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RHU-Manaoag Pharmacy",
  description: "Simple CRUD Web App for RHU-Manaoag Pharmacy.",
  keywords:
    "pharmacy, RHU, Rural Health Unit, Manaoag, patient, medicine, medicines",
  openGraph: {
    title: "RHU-Manaoag Pharmacy",
    description: "rhu-manaoag pharmacy",
    // url: "https://yourdomain.com",
    url: "https://next-pharm-ncd-patient-list.vercel.app",
    siteName: "RHU-Manaoag Pharmacy",
    images: [
      {
        url: "/banner.jpg", // Make sure this is a real image path
        width: 1200,
        height: 630,
        alt: "Banner",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playwrite+HU:wght@100..400&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        <Toaster position="top-center" />
        <footer>
          <p className="text-center py-6">
            &copy; by RHU Pharma Team 2025. All Rights Reserved
          </p>
        </footer>
      </body>
    </html>
  );
}
