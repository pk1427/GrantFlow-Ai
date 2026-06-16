import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Wallet } from "lucide-react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GrantFlow AI",
  description: "Autonomous milestone funding on Casper Network"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.28),transparent_32rem),linear-gradient(180deg,#070A12,#0B1020)]">
          <header className="border-b border-line/80 bg-ink/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
              <Link href="/" className="text-lg font-bold tracking-normal">
                GrantFlow AI
              </Link>
              <nav className="hidden items-center gap-5 text-sm text-slate-300 sm:flex">
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/grants/new">Create Grant</Link>
                <Link href="/grants/grant-001">Grant Details</Link>
              </nav>
              <button className="inline-flex h-9 items-center gap-2 rounded-md border border-cyan/50 px-3 text-sm text-cyan">
                <Wallet size={16} />
                Casper Wallet
              </button>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
