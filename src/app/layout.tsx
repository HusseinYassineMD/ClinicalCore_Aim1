import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import ClientRuntimeFixes from "@/components/ClientRuntimeFixes";
import DashboardAuthProvider from "@/components/DashboardAuthProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "ADRC Metrics",
  description:
    "USC ADRC mid-cycle metrics dashboard—RPPR-aligned visuals and checks across cores, with listening-session framework for center alignment.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased min-h-screen">
        <ClientRuntimeFixes />
        <DashboardAuthProvider>{children}</DashboardAuthProvider>
      </body>
    </html>
  );
}
