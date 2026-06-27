import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ZoneForge",
  description: "DNS Management Console — Route53 Clone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-950 text-slate-100 dark">
      <body className={`${inter.className} h-full antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
