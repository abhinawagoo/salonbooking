import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollToHash from "@/components/ScrollToHash";

export const metadata: Metadata = {
  title: "Salon Booking System",
  description: "Book your salon appointment with ease",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col min-h-screen">
        <Navigation />
        <ScrollToHash />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
