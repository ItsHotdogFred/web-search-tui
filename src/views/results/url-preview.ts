import { createMarkdown } from "../../components/markdown";
import type { HandlerContext } from "./types";
import { LAYOUT } from "./types";
import { renderSearchQuery, renderResultsMeta, renderDivider } from "./helpers";

export async function handleUrlPreview(
  ctx: HandlerContext,
  url: string,
): Promise<void> {
  ctx.aiSummary.content = "";
  ctx.aiSummary.height = 0;

  const markdownUrl = "https://markdown.itsfred.dev/?url=" + url.trim();

  let text: string;
  try {
    const res = await fetch(markdownUrl);
    text = await res.text();
  } catch {
    ctx.renderer.root.remove(ctx.searchInputId);
    renderSearchQuery(ctx.renderer, ctx.aiSummary.query);
    renderResultsMeta(
      ctx.renderer,
      "Failed to load page preview",
      LAYOUT.META_Y,
    );
    return;
  }

  ctx.renderer.root.remove(ctx.searchInputId);
  renderSearchQuery(ctx.renderer, ctx.aiSummary.query);
  renderResultsMeta(ctx.renderer, "Page preview", LAYOUT.META_Y);
  renderDivider(ctx.renderer, LAYOUT.DIVIDER_Y);
  await createMarkdown(ctx.renderer, text, "readme", {
    x: 0,
    y: LAYOUT.CONTENT_START_Y,
    height: Math.max(process.stdout.rows - 6, 5),
  });
}
