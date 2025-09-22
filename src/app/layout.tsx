import { Toaster } from "@/components/ui/sonner"
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import NextTopLoader from 'nextjs-toploader';
import { Suspense } from "react";

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Radyo Natin Content Management System",
  description: "Radyo Natin Content Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} antialiased !pointer-events-auto`}
      >
        <Suspense>
          {children}
        </Suspense>
        <Toaster richColors={true} />
        <NextTopLoader
          color="#000000"
          crawlSpeed={500}
          height={5}
          speed={500}
          shadow="0 0 10px #000000,0 0 5px #000000"
        />
      </body>
    </html >
  );
}
