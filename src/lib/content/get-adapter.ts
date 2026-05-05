import { ApiContentAdapter } from "@/lib/content/api-adapter";
import { StaticContentAdapter } from "@/lib/content/static-adapter";
import type { ContentAdapter } from "@/lib/content/types";
import { getContentMode } from "@/lib/env";

let adapter: ContentAdapter | null = null;

export function getContentAdapter(): ContentAdapter {
  if (adapter) return adapter;
  adapter = getContentMode() === "api" ? new ApiContentAdapter() : new StaticContentAdapter();
  return adapter;
}
