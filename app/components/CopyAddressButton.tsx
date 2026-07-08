"use client";

import { useState } from "react";

type CopyAddressButtonProps = {
  value: string;
  className?: string;
};

export default function CopyAddressButton({
  value,
  className = "",
}: CopyAddressButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      className={`copy-address-button ${copied ? "is-copied" : ""} ${className}`}
      onClick={copyAddress}
      aria-live="polite"
    >
      <CopyIcon />
      <span>{copied ? "Adresse copiée" : "Copier l'adresse"}</span>
    </button>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M8 7.5A2.5 2.5 0 0 1 10.5 5h6A2.5 2.5 0 0 1 19 7.5v6A2.5 2.5 0 0 1 16.5 16h-6A2.5 2.5 0 0 1 8 13.5z" />
      <path d="M5 10.5A2.5 2.5 0 0 1 7.5 8H8v5.5A2.5 2.5 0 0 0 10.5 16H16v.5a2.5 2.5 0 0 1-2.5 2.5h-6A2.5 2.5 0 0 1 5 16.5z" />
    </svg>
  );
}
