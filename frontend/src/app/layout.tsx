import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Luxorides Fleet",
  description: "Chauffeur-driven luxury cars in Delhi NCR, Mumbai and Bangalore",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="border-b border-neutral-800">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-xl font-semibold tracking-widest text-amber-300">
              LUXORIDES
            </Link>
            <nav className="flex gap-6 text-sm text-neutral-300">
              <Link href="/" className="hover:text-white">
                Fleet
              </Link>
              <Link href="/admin" className="hover:text-white">
                Admin
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
      </body>
    </html>
  );
}