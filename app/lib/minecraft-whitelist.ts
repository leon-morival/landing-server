import crypto from "node:crypto";
import { sendRconCommand } from "./rcon";

export type WhitelistDecision = "accept" | "reject";

export type WhitelistRequest = {
  username: string;
  discord: string;
  reason: string;
};

type ReviewTokenPayload = WhitelistRequest & {
  decision: WhitelistDecision;
  exp: number;
};

const usernamePattern = /^[A-Za-z0-9_]{3,16}$/;
const maxDiscordLength = 64;
const maxReasonLength = 800;
const reviewTokenTtlMs = 7 * 24 * 60 * 60 * 1000;

export function parseWhitelistRequest(payload: unknown): WhitelistRequest {
  if (!payload || typeof payload !== "object") {
    throw new Error("Demande invalide.");
  }

  const input = payload as Partial<Record<keyof WhitelistRequest, unknown>>;
  const username = String(input.username ?? "").trim();
  const discord = String(input.discord ?? "").trim();
  const reason = String(input.reason ?? "").trim();

  if (!usernamePattern.test(username)) {
    throw new Error("Pseudo Minecraft invalide.");
  }

  if (discord.length < 2 || discord.length > maxDiscordLength) {
    throw new Error("Identifiant Discord invalide.");
  }

  if (reason.length < 10 || reason.length > maxReasonLength) {
    throw new Error("Message trop court ou trop long.");
  }

  return { username, discord, reason };
}

export function parseWhitelistDecision(payload: unknown): {
  username: string;
  decision: WhitelistDecision;
} {
  if (!payload || typeof payload !== "object") {
    throw new Error("Décision invalide.");
  }

  const input = payload as Partial<Record<"username" | "decision", unknown>>;
  const username = String(input.username ?? "").trim();
  const decision = String(input.decision ?? "").trim();

  if (!usernamePattern.test(username)) {
    throw new Error("Pseudo Minecraft invalide.");
  }

  if (decision !== "accept" && decision !== "reject") {
    throw new Error("Décision invalide.");
  }

  return { username, decision };
}

function getReviewSecret() {
  const secret = process.env.MINECRAFT_WHITELIST_REVIEW_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("Secret de revue whitelist manquant ou trop court.");
  }

  return secret;
}

function getBaseUrl() {
  const baseUrl = process.env.APP_BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL;

  if (!baseUrl) {
    throw new Error("APP_BASE_URL est requis pour générer les boutons Discord.");
  }

  return baseUrl.replace(/\/$/, "");
}

function signTokenPayload(encodedPayload: string) {
  return crypto
    .createHmac("sha256", getReviewSecret())
    .update(encodedPayload)
    .digest("base64url");
}

function createReviewToken(request: WhitelistRequest, decision: WhitelistDecision) {
  const payload: ReviewTokenPayload = {
    ...request,
    decision,
    exp: Date.now() + reviewTokenTtlMs,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signTokenPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifyReviewToken(token: string | null) {
  if (!token) {
    throw new Error("Token manquant.");
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    throw new Error("Token invalide.");
  }

  const expectedSignature = signTokenPayload(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw new Error("Signature invalide.");
  }

  const payload = JSON.parse(
    Buffer.from(encodedPayload, "base64url").toString("utf8"),
  ) as ReviewTokenPayload;

  if (!usernamePattern.test(payload.username)) {
    throw new Error("Pseudo Minecraft invalide.");
  }

  if (payload.decision !== "accept" && payload.decision !== "reject") {
    throw new Error("Décision invalide.");
  }

  if (payload.exp < Date.now()) {
    throw new Error("Token expiré.");
  }

  return payload;
}

function createReviewUrl(request: WhitelistRequest, decision: WhitelistDecision) {
  const url = new URL("/api/minecraft/whitelist/review", getBaseUrl());
  url.searchParams.set("token", createReviewToken(request, decision));

  return url.toString();
}

export async function sendWhitelistRequestToDiscord(request: WhitelistRequest) {
  const webhookUrl = process.env.DISCORD_WHITELIST_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error("Webhook Discord non configuré.");
  }

  const acceptUrl = createReviewUrl(request, "accept");
  const rejectUrl = createReviewUrl(request, "reject");

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: "Nouvelle demande whitelist Minecraft",
      embeds: [
        {
          title: "Candidature Minecraft",
          color: 0x33e879,
          fields: [
            { name: "Pseudo", value: request.username, inline: true },
            { name: "Discord", value: request.discord, inline: true },
            { name: "Motivation", value: request.reason.slice(0, maxReasonLength) },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 5,
              label: "Accepter",
              url: acceptUrl,
              emoji: { name: "✅" },
            },
            {
              type: 2,
              style: 5,
              label: "Refuser",
              url: rejectUrl,
              emoji: { name: "❌" },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Discord a refusé la demande (${response.status}).`);
  }
}

export async function sendWhitelistDecisionToDiscord(
  username: string,
  decision: WhitelistDecision,
  result?: string,
) {
  const webhookUrl = process.env.DISCORD_WHITELIST_WEBHOOK_URL;

  if (!webhookUrl) {
    return;
  }

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content:
        decision === "accept"
          ? `✅ ${username} a été ajouté à la whitelist Minecraft.`
          : `❌ La demande de ${username} a été refusée.`,
      embeds: result
        ? [
            {
              title: "Réponse RCON",
              description: result || "Commande exécutée.",
              color: decision === "accept" ? 0x33e879 : 0xff5c5c,
            },
          ]
        : undefined,
    }),
  });
}

export async function applyWhitelistDecision(
  username: string,
  decision: WhitelistDecision,
) {
  if (decision === "reject") {
    await sendWhitelistDecisionToDiscord(username, decision);
    return "Demande refusée.";
  }

  const result = await sendRconCommand(`whitelist add ${username}`);
  await sendWhitelistDecisionToDiscord(username, decision, result);

  return result || `${username} ajouté à la whitelist.`;
}
