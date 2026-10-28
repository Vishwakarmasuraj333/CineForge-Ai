import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CineForge AI — From imagination to motion.",
  description:
    "Production-grade AI video generation, prompt intelligence, and creative studio platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-cine-950 text-cine-200 antialiased selection:bg-gold-500 selection:text-cine-950">
        {children}
      </body>
    </html>
  );
}

