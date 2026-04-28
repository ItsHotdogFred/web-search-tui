import { TextRenderable } from "@opentui/core";
import type { HandlerContext, NativeSearchResult } from "./types";
import { LAYOUT } from "./types";
import {
  renderSearchQuery,
  renderResultsMeta,
  renderDivider,
  renderError,
  renderResultScrollbox,
  stripFileExtension,
  textPrimary,
} from "./helpers";

export async function handleNativeSearch(ctx: HandlerContext, query: string): Promise<void> {
  ctx.aiSummary.content = "";
  ctx.aiSummary.height = 0;
  ctx.searchInput.placeholder = "Searching...";

  const nativeQuery = query.replace(/^@native\b/, "").trim();

  let nativeResults: NativeSearchResult[];
  try {
    const res = await fetch("http://localhost:3000/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ search: nativeQuery }),
    });
    nativeResults = (await res.json()) as NativeSearchResult[];
  } catch {
    ctx.renderer.root.remove(ctx.searchInputId);
    renderSearchQuery(ctx.renderer, ctx.aiSummary.query);
    renderError(ctx.renderer, ctx.resultTextId, "Failed to connect to native search.", LAYOUT.CONTENT_START_Y);
    return;
  }

  ctx.renderer.root.remove(ctx.searchInputId);
  renderSearchQuery(ctx.renderer, ctx.aiSummary.query);

  if (nativeResults.length === 0) {
    renderError(ctx.renderer, ctx.resultTextId, "No results found.", LAYOUT.CONTENT_START_Y);
    return;
  }

  renderResultsMeta(ctx.renderer, `${nativeResults.length} native matches`, LAYOUT.META_Y);
  renderDivider(ctx.renderer, LAYOUT.DIVIDER_Y);

  const entries = nativeResults.map((item, nativeIndex) => {
    const nativeId = stripFileExtension(item.file);
    return {
      renderable: new TextRenderable(ctx.renderer, {
        id: `searchResult-${nativeIndex}`,
        content: `${String(nativeIndex + 1).padStart(2, "0")}  ${nativeId}\n${item.file}\nSimilarity score ${item.similarity.toFixed(3)}`,
        fg: textPrimary,
      }),
      url: `native:${nativeId}`,
    };
  });

  renderResultScrollbox(ctx.renderer, entries, ctx.index, LAYOUT.CONTENT_START_Y, ctx.searchResults, ctx.searchUrls);
}
