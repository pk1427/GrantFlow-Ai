"use client";

import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";

type CasperWalletProvider = {
  requestConnection?: () => Promise<boolean>;
  isConnected?: () => Promise<boolean> | boolean;
  getActivePublicKey?: () => Promise<string> | string;
};

declare global {
  interface Window {
    CasperWalletProvider?: () => CasperWalletProvider;
    casperlabsHelper?: CasperWalletProvider;
  }
}

function getProvider() {
  if (typeof window === "undefined") return null;
  return window.CasperWalletProvider?.() ?? window.casperlabsHelper ?? null;
}

export function WalletButton() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "missing" | "connected">("idle");

  useEffect(() => {
    const provider = getProvider();
    if (!provider?.getActivePublicKey) return;
    Promise.resolve(provider.getActivePublicKey())
      .then((key) => {
        if (key) {
          setPublicKey(key);
          setStatus("connected");
          window.localStorage.setItem("grantflow.wallet", key);
        }
      })
      .catch(() => undefined);
  }, []);

  async function connect() {
    const provider = getProvider();
    if (!provider) {
      setStatus("missing");
      return;
    }

    setStatus("connecting");
    try {
      const connected = provider.requestConnection ? await provider.requestConnection() : true;
      const key = provider.getActivePublicKey ? await provider.getActivePublicKey() : null;
      if (connected && key) {
        setPublicKey(key);
        setStatus("connected");
        window.localStorage.setItem("grantflow.wallet", key);
      } else {
        setStatus("idle");
      }
    } catch {
      setStatus("idle");
    }
  }

  return (
    <button
      onClick={connect}
      title={status === "missing" ? "Install Casper Wallet or Casper Signer" : publicKey ?? "Connect Casper Wallet"}
      className="inline-flex h-9 max-w-[13rem] items-center gap-2 rounded-md border border-cyan/50 px-3 text-sm text-cyan"
    >
      <Wallet size={16} />
      <span className="truncate">
        {status === "connecting" && "Connecting"}
        {status === "missing" && "Wallet missing"}
        {status === "connected" && publicKey ? `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}` : null}
        {status === "idle" && "Connect Wallet"}
      </span>
    </button>
  );
}
