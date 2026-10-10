import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "AI Multi-Agent Innovation Analyzer",
  description: "Evaluate your academic or business ideas from multiple expert perspectives using parallel AI agents.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-white text-stone-900 font-sans flex flex-col selection:bg-stone-200">
        {children}
      </body>
    </html>
  );
}
