import { NextRequest, NextResponse } from "next/server";

const CORE_API =
  process.env.CORE_API_URL ||
  process.env.NEXT_PUBLIC_CORE_API_URL ||
  "https://the1970-core-api-production.up.railway.app";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const market =
    request.nextUrl.searchParams.get("market") || "VN";

  try {
    const response = await fetch(
      `${CORE_API.replace(/\/$/, "")}/storefront/settings?market=${encodeURIComponent(
        market,
      )}`,
      {
        cache: "no-store",
      },
    );

    const body = await response.text();

    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ||
          "application/json; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Cannot reach storefront settings API",
        detail:
          error instanceof Error ? error.message : String(error),
      },
      {
        status: 502,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  }
}
