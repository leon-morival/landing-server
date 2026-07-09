export type WhitelistRequest = {
  username: string;
  reason: string;
};

const usernamePattern = /^[A-Za-z0-9_]{3,16}$/;
const maxReasonLength = 800;

export function parseWhitelistRequest(payload: unknown): WhitelistRequest {
  if (!payload || typeof payload !== "object") {
    throw new Error("Demande invalide.");
  }

  const input = payload as Partial<Record<keyof WhitelistRequest, unknown>>;
  const username = String(input.username ?? "").trim();
  const reason = String(input.reason ?? "").trim();

  if (!usernamePattern.test(username)) {
    throw new Error("Pseudo Minecraft invalide.");
  }

  if (reason.length < 10 || reason.length > maxReasonLength) {
    throw new Error("Message trop court ou trop long.");
  }

  return { username, reason };
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
