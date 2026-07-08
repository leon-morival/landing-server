"use client";

import { FormEvent, useState } from "react";

type FormStatus = {
  tone: "success" | "error";
  message: string;
} | null;

export default function MinecraftWhitelistForm() {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<FormStatus>(null);

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      username: String(formData.get("username") ?? ""),
      discord: String(formData.get("discord") ?? ""),
      reason: String(formData.get("reason") ?? ""),
    };

    try {
      const response = await fetch("/api/minecraft/whitelist/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        message?: string;
      };

      if (!response.ok || !result.ok) {
        throw new Error(result.message ?? "Demande refusée.");
      }

      event.currentTarget.reset();
      setStatus({
        tone: "success",
        message: result.message ?? "Demande envoyée.",
      });
    } catch (error) {
      setStatus({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "Impossible d'envoyer la demande.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="whitelist-form block-panel" onSubmit={submitRequest}>
      <div className="form-field">
        <label htmlFor="minecraft-username">Pseudo Minecraft</label>
        <input
          id="minecraft-username"
          name="username"
          type="text"
          autoComplete="username"
          minLength={3}
          maxLength={16}
          pattern="[A-Za-z0-9_]{3,16}"
          placeholder="Leon"
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="minecraft-discord">Discord</label>
        <input
          id="minecraft-discord"
          name="discord"
          type="text"
          autoComplete="off"
          maxLength={64}
          placeholder="leon"
          required
        />
      </div>

      <div className="form-field form-field--full">
        <label htmlFor="minecraft-reason">Message</label>
        <textarea
          id="minecraft-reason"
          name="reason"
          minLength={10}
          maxLength={800}
          rows={5}
          placeholder="Je voudrais rejoindre le serveur..."
          required
        />
      </div>

      <button className="whitelist-submit" type="submit" disabled={submitting}>
        <span>{submitting ? "Envoi..." : "Envoyer la demande"}</span>
      </button>

      {status ? (
        <p className={`whitelist-message whitelist-message--${status.tone}`} role="status">
          {status.message}
        </p>
      ) : null}
    </form>
  );
}
