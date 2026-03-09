import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yuvichaar Funnels | AI-Enabled Growth Partners for D2C Founders",
  description: "Go from zero to 1,000 paying customers in 60 days. AI-enabled Marketing & Growth Partners for ambitious founders building ₹100Cr D2C brands.",
  keywords: "D2C, marketing, growth, AI, funnels, digital marketing, performance marketing, India, UK",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={plusJakarta.className}>
         
          {children}
       
      </body>
    </html>
  );
}
