import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import Link from "next/link";
import { ApiStatus } from "@/components/api-status";
import { HeaderNav } from "@/components/header-nav";
import { WalletButton } from "@/components/wallet-button";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GrantFlow AI",
  description: "Chain-agnostic milestone funding with a Casper reference implementation"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.15),transparent_30rem),radial-gradient(circle_at_top_right,rgba(124,58,237,0.18),transparent_28rem),linear-gradient(180deg,#070A12,#0B1020)]">
          <header className="sticky top-0 z-40 border-b border-line/80 bg-ink/86 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
              <Link href="/" className="flex items-center gap-3 text-lg font-semibold tracking-normal">
                <span className="grid size-8 place-items-center rounded-md border border-cyan/40 bg-cyan/10 text-sm text-cyan">GF</span>
                <span>GrantFlow AI</span>
              </Link>
              <HeaderNav />
              <WalletButton />
            </div>
          </header>
          <ApiStatus />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
