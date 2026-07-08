import {
  applyWhitelistDecision,
  verifyReviewToken,
} from "@/app/lib/minecraft-whitelist";

export const runtime = "nodejs";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function htmlResponse(title: string, body: string, status = 200) {
  return new Response(
    `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex,nofollow" />
    <title>${escapeHtml(title)}</title>
    <style>
      body {
        min-height: 100vh;
        margin: 0;
        display: grid;
        place-items: center;
        background: #090a0f;
        color: #f2efe3;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      }

      main {
        width: min(640px, calc(100% - 32px));
        border: 4px solid #030303;
        background: #252932;
        box-shadow: 6px 6px 0 rgb(0 0 0 / 55%);
        padding: 28px;
      }

      h1 {
        margin: 0 0 12px;
        color: #ffd54a;
        font-size: 1.2rem;
      }

      p {
        margin: 0;
        line-height: 1.6;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(body)}</p>
    </main>
  </body>
</html>`,
    {
      status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow",
      },
    },
  );
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const review = verifyReviewToken(url.searchParams.get("token"));
    const result = await applyWhitelistDecision(review.username, review.decision);

    return htmlResponse(
      review.decision === "accept" ? "Demande acceptée" : "Demande refusée",
      result,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Action impossible.";

    return htmlResponse("Action impossible", message, 400);
  }
}
