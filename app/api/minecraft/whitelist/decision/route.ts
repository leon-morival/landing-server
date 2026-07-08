import {
  applyWhitelistDecision,
  parseWhitelistDecision,
} from "@/app/lib/minecraft-whitelist";

export const runtime = "nodejs";

function assertAuthorized(request: Request) {
  const token = process.env.MINECRAFT_WHITELIST_ADMIN_TOKEN;
  const authorization = request.headers.get("authorization");

  if (!token || token.length < 32) {
    throw new Error("Token admin whitelist non configuré.");
  }

  if (authorization !== `Bearer ${token}`) {
    throw new Error("Non autorisé.");
  }
}

export async function POST(request: Request) {
  try {
    assertAuthorized(request);

    const payload = await request.json();
    const { username, decision } = parseWhitelistDecision(payload);
    const result = await applyWhitelistDecision(username, decision);

    return Response.json({
      ok: true,
      result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Décision impossible.";

    return Response.json(
      {
        ok: false,
        message,
      },
      { status: message === "Non autorisé." ? 401 : 400 },
    );
  }
}
