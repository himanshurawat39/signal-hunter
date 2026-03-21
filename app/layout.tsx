import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Signal Hunter",
  description: "Find high-intent prospects from Reddit and X in real time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
