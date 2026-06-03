import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "LOAH | Life Organiser & Healer",
  description: "An ADHD-focused productivity suite and healing sanctuary. Develop routines, manage tasks, log mood, and grow in harmony.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full w-full select-none">
      <body
        className={`${inter.variable} ${geistMono.variable} font-sans antialiased bg-[#0a0a0f] text-[#f1f0ff] fixed inset-0 overflow-hidden h-[100dvh] w-full`}
      >
        {children}
      </body>
    </html>
  );
}
