import { ApiContentAdapter } from "@/lib/content/api-adapter";
import { StaticContentAdapter } from "@/lib/content/static-adapter";
import type { ContentAdapter } from "@/lib/content/types";
import { getContentMode } from "@/lib/env";

interface GetContentAdapterOptions {
  basePath?: string;
}

export function getContentAdapter(options?: GetContentAdapterOptions): ContentAdapter {
  if (getContentMode() === "api") {
    return new ApiContentAdapter({ basePath: options?.basePath });
  }
  return new StaticContentAdapter();
}
