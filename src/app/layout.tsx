import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { I18nProvider } from "@/components/I18nProvider";
import { LangToggle } from "@/components/LangToggle";
import { HelpButton } from "@/components/HelpButton";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Study App — Learn Vocabulary!",
  description:
    "A fun, Duolingo-style vocabulary learning app for kids. Interactive lessons, games, and real rewards.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Study App",
  },
  keywords: [
    "kids learning",
    "vocabulary",
    "spelling",
    "first grade",
    "Duolingo-style",
    "educational game",
    "study app",
  ],
  authors: [{ name: "Study App" }],
  openGraph: {
    title: "Study App — Learn Vocabulary!",
    description:
      "A fun learning app for kids to master vocabulary words!",
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
        <I18nProvider>
          <AuthProvider>
            <ProtectedRoute>
              <PwaInstallPrompt />
              <LangToggle />
              <HelpButton />
              {children}
            </ProtectedRoute>
          </AuthProvider>
          <Toaster />
        </I18nProvider>
      </body>
    </html>
  );
}

