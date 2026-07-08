import Link from "next/link";
import type { ReactNode } from "react";

type HomeElementProps = {
  title: string;
  description: string;
  href?: string;
  actionLabel: string;
  variant: "jellyfin" | "minecraft" | "astroneer";
  external?: boolean;
  children: ReactNode;
};

export default function HomeElement({
  title,
  description,
  href,
  actionLabel,
  variant,
  external = false,
  children,
}: HomeElementProps) {
  const content = (
    <>
      <span className="service-status" aria-label="Service en ligne" />
      <span className="service-icon-shell">{children}</span>
      <span className="service-copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </span>
      <span className="service-action">
        <span className="service-action-label">{actionLabel}</span>
        {href ? <ArrowIcon /> : <SignalIcon />}
      </span>
    </>
  );

  const className = `service-card service-card--${variant}`;

  if (!href) {
    return <article className={className}>{content}</article>;
  }

  if (external) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

export function JellyfinIcon() {
  return (
    <svg viewBox="0 0 96 96" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="jellyfin-gradient" x1="16" y1="84" x2="80" y2="12">
          <stop stopColor="#7c3cff" />
          <stop offset="0.52" stopColor="#00d8ff" />
          <stop offset="1" stopColor="#c833ff" />
        </linearGradient>
      </defs>
      <path
        d="M48 11 88 80H8z"
        fill="none"
        stroke="url(#jellyfin-gradient)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="9"
      />
      <path
        d="M48 35 66 67H30z"
        fill="none"
        stroke="url(#jellyfin-gradient)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="8"
      />
    </svg>
  );
}

export function MinecraftIcon() {
  return (
    <svg viewBox="0 0 96 96" aria-hidden="true" focusable="false">
      <path d="M48 8 84 28 48 48 12 28z" fill="#7bd452" />
      <path d="M48 48 84 28v40L48 88z" fill="#6b4a2c" />
      <path d="M48 48 12 28v40l36 20z" fill="#8a6238" />
      <path d="M24 34h10v10H24zm19 9h11v11H43zm18-9h11v10H61z" fill="#5aa543" />
      <path d="M56 58h9v10h-9zm-25 0h10v11H31zm14 14h9v10h-9z" fill="#4b3525" opacity=".7" />
    </svg>
  );
}

export function AstroneerIcon() {
  return (
    <svg viewBox="0 0 96 96" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="astroneer-gradient" x1="16" y1="82" x2="80" y2="14">
          <stop stopColor="#ffd54a" />
          <stop offset="0.48" stopColor="#ff7a3d" />
          <stop offset="1" stopColor="#6df4ff" />
        </linearGradient>
      </defs>
      <path
        d="M14 54c13-25 44-39 68-28"
        fill="none"
        stroke="url(#astroneer-gradient)"
        strokeLinecap="round"
        strokeWidth="7"
      />
      <circle cx="45" cy="48" r="22" fill="#172341" stroke="#6df4ff" strokeWidth="6" />
      <path d="M29 41h13l7 8h18" fill="none" stroke="#ffd54a" strokeLinecap="round" strokeWidth="6" />
      <path d="M38 65h14l9-9" fill="none" stroke="#ff7a3d" strokeLinecap="round" strokeWidth="6" />
      <circle cx="70" cy="25" r="8" fill="#ffd54a" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 12h12" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function SignalIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 12.5a10 10 0 0 1 14 0" />
      <path d="M8.5 16a5 5 0 0 1 7 0" />
      <path d="M12 19h.01" />
    </svg>
  );
}
