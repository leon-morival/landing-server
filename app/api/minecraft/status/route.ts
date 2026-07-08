import { minecraftServer } from "@/app/lib/server-config";

type McSrvStatPlayer = string | { name?: string; name_raw?: string };

type McSrvStatResponse = {
  online?: boolean;
  version?: string;
  players?: {
    online?: number;
    max?: number;
    list?: McSrvStatPlayer[];
  };
};

export async function GET() {
  try {
    const response = await fetch(
      `https://api.mcsrvstat.us/3/${minecraftServer.address}`,
      {
        next: { revalidate: 60 },
      },
    );

    if (!response.ok) {
      throw new Error(`Minecraft status API returned ${response.status}`);
    }

    const data = (await response.json()) as McSrvStatResponse;

    return Response.json(
      {
        online: Boolean(data.online),
        playersOnline: data.players?.online ?? null,
        playersMax: data.players?.max ?? null,
        version: data.version ?? null,
        checkedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "s-maxage=45, stale-while-revalidate=120",
        },
      },
    );
  } catch {
    return Response.json(
      {
        online: false,
        playersOnline: null,
        playersMax: null,
        version: null,
        checkedAt: new Date().toISOString(),
        error: "Le statut du serveur est indisponible.",
      },
      { status: 200 },
    );
  }
}
