import {
  parseWhitelistRequest,
  sendWhitelistRequestToDiscord,
} from "@/app/lib/minecraft-whitelist";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const whitelistRequest = parseWhitelistRequest(payload);

    await sendWhitelistRequestToDiscord(whitelistRequest);

    return Response.json({
      ok: true,
      message: "Demande envoyée.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Impossible d'envoyer la demande.";
    const status =
      message.includes("configuré") ||
      message.includes("DISCORD_") ||
      message.startsWith("Le service de notification a refusé")
        ? 503
        : 400;

    return Response.json(
      {
        ok: false,
        message,
      },
      { status },
    );
  }
}
