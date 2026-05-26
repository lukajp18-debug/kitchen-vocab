import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kitchen Vocabulary - Learn Kitchen Words!",
  description:
    "A fun, Duolingo-style learning app for kids to learn kitchen and utensil words. Perfect for first graders!",
  keywords: [
    "kids learning",
    "kitchen words",
    "vocabulary",
    "spelling",
    "first grade",
    "Duolingo-style",
    "educational game",
  ],
  authors: [{ name: "Kitchen Vocabulary" }],
  openGraph: {
    title: "Kitchen Vocabulary - Learn Kitchen Words!",
    description:
      "A fun learning app for kids to master kitchen vocabulary words!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
