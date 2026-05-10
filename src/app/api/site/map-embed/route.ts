import { NextResponse } from "next/server";

import { resolveMapEmbed } from "@/lib/content/map-embed";

async function resolveFinalUrl(rawUrl: string): Promise<string | null> {
  try {
    const response = await fetch(rawUrl, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; SSTResortMapResolver/1.0)"
      }
    });
    return response.url ? String(response.url) : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const rawUrl = String(searchParams.get("url") ?? "").trim();

  if (!rawUrl) {
    return NextResponse.json(
      { embedSrc: null, externalUrl: null, error: "url is required" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const direct = resolveMapEmbed(rawUrl);
  if (direct.embedSrc) {
    return NextResponse.json(
      { embedSrc: direct.embedSrc, externalUrl: direct.externalUrl ?? rawUrl },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const redirectedUrl = await resolveFinalUrl(rawUrl);
  if (!redirectedUrl) {
    return NextResponse.json(
      { embedSrc: direct.embedSrc, externalUrl: direct.externalUrl ?? rawUrl },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const resolved = resolveMapEmbed(redirectedUrl);
  return NextResponse.json(
    {
      embedSrc: resolved.embedSrc,
      externalUrl: resolved.externalUrl ?? redirectedUrl
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

