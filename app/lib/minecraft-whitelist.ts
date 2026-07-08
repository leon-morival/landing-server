export type WhitelistRequest = {
  username: string;
  discord: string;
  reason: string;
};

const usernamePattern = /^[A-Za-z0-9_]{3,16}$/;
const maxDiscordLength = 64;
const maxReasonLength = 800;

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

async function readDiscordError(response: Response) {
  const body = await response.text().catch(() => "");

  return body
    ? `Le service de notification a refusé la demande (${response.status}) : ${body.slice(0, 200)}`
    : `Le service de notification a refusé la demande (${response.status}).`;
}

export async function sendWhitelistRequestToDiscord(request: WhitelistRequest) {
  const webhookUrl = process.env.DISCORD_WHITELIST_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error("Service de notification non configuré.");
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: "Nouvelle demande d'accès Minecraft",
      embeds: [
        {
          title: "Candidature Minecraft",
          color: 0x33e879,
          fields: [
            { name: "Pseudo Minecraft", value: request.username, inline: true },
            { name: "Discord", value: request.discord, inline: true },
            { name: "Message", value: request.reason.slice(0, maxReasonLength) },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
      allowed_mentions: { parse: [] },
    }),
  });

  if (!response.ok) {
    throw new Error(await readDiscordError(response));
  }
}
