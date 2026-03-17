import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
