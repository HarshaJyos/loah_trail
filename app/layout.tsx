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
  metadataBase: new URL("https://www.loah.in"),
  title: {
    default: "LOAH | Life Organiser & Healer",
    template: "%s | LOAH",
  },
  description: "An ADHD-focused productivity suite and healing sanctuary. Develop routines, manage tasks, log mood, and grow in harmony.",
  authors: [{ name: "Duggirala Pavan Kumar" }, { name: "Solvempire Private Limited", url: "https://www.solvempire.com" }],
  creator: "Duggirala Pavan Kumar",
  publisher: "Solvempire Private Limited",
  keywords: ["ADHD", "Productivity", "To-do", "Routine", "Habit Tracker", "Journaling", "Mental Health", "LOAH", "Life Organiser"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.loah.in",
    siteName: "LOAH",
    title: "LOAH | Life Organiser & Healer",
    description: "An ADHD-focused productivity suite and healing sanctuary.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LOAH | Life Organiser & Healer",
    description: "An ADHD-focused productivity suite and healing sanctuary.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full w-full select-none">
      <body
        className={`${inter.variable} ${geistMono.variable} font-sans antialiased bg-[#F5F7FA] text-[#1E1E1E] fixed inset-0 overflow-hidden h-[100dvh] w-full`}
      >
        {children}
      </body>
    </html>
  );
}
