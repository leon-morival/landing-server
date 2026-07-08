"use client";

import { useEffect, useState } from "react";

type ServerStatus = {
  online: boolean;
  playersOnline: number | null;
  playersMax: number | null;
  version: string | null;
  checkedAt: string;
  error?: string;
};

const loadingStatus: ServerStatus = {
  online: false,
  playersOnline: null,
  playersMax: null,
  version: null,
  checkedAt: "",
};

export default function MinecraftStatus() {
  const [status, setStatus] = useState<ServerStatus>(loadingStatus);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function refreshStatus() {
      try {
        const response = await fetch("/api/minecraft/status", {
          cache: "no-store",
        });
        const payload = (await response.json()) as ServerStatus;

        if (alive) {
          setStatus(payload);
          setLoading(false);
        }
      } catch {
        if (alive) {
          setStatus({
            ...loadingStatus,
            checkedAt: new Date().toISOString(),
            error: "Impossible de récupérer le statut.",
          });
          setLoading(false);
        }
      }
    }

    refreshStatus();
    const interval = window.setInterval(refreshStatus, 60_000);

    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, []);

  const playerCount =
    status.playersOnline === null
      ? "-"
      : `${status.playersOnline}${status.playersMax ? ` / ${status.playersMax}` : ""}`;

  return (
    <section id="statut" className="minecraft-section">
      <div className="section-heading pixel-heading">
        <h2>Statut du serveur</h2>
        <p>Mis à jour automatiquement toutes les 60 secondes.</p>
      </div>

      <div className="status-panel block-panel">
        <StatusItem
          label="État"
          value={loading ? "Vérification..." : status.online ? "En ligne" : "Hors ligne"}
          tone={loading ? undefined : status.online ? "online" : "offline"}
        />
        <StatusItem label="Joueurs en ligne" value={playerCount} />
        <StatusItem label="Version" value={status.version ?? "-"} />
        <StatusItem
          label="Dernier check"
          value={formatCheckedAt(status.checkedAt)}
        />
      </div>

      {status.error ? (
        <p className="status-note">{status.error}</p>
      ) : null}
    </section>
  );
}

type StatusItemProps = {
  label: string;
  value: string;
  tone?: "online" | "offline";
};

function StatusItem({ label, value, tone }: StatusItemProps) {
  return (
    <div className="status-item">
      <span className="status-label">{label}</span>
      <strong className={tone ? `status-value status-value--${tone}` : "status-value"}>
        {tone ? <span className="status-light" aria-hidden="true" /> : null}
        {value}
      </strong>
    </div>
  );
}

function formatCheckedAt(value: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
