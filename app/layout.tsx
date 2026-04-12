import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth/context";
import { ToastProvider } from "@/lib/toast/context";
import { ToastContainer } from "@/lib/toast/ToastContainer";
import { ThemeProvider } from "@/app/components/layout/ThemeProvider";
import { Header } from "@/app/components/layout/Header";
import { Footer } from "@/app/components/layout/Footer";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "MTG Metagames",
  description: "Magic: The Gathering tournament metagame tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
          <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
              <ToastContainer />
            </ToastProvider>
          </ThemeProvider>
          </AuthProvider>
        </body>
    </html>
  );
}
