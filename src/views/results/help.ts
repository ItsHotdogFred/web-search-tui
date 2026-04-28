import { createMarkdown } from "../../components/markdown";
import { helpcontent } from "../../info/helpinfo";
import type { HandlerContext } from "./types";
import { LAYOUT } from "./types";
import { renderSearchQuery, renderResultsMeta, renderDivider } from "./helpers";

export async function handleHelpScreen(ctx: HandlerContext): Promise<void> {
  ctx.aiSummary.content = "";
  ctx.aiSummary.height = 0;

  ctx.renderer.root.remove(ctx.searchInputId);
  renderSearchQuery(ctx.renderer, ctx.aiSummary.query);
  renderResultsMeta(ctx.renderer, "Help and usage", LAYOUT.META_Y);
  renderDivider(ctx.renderer, LAYOUT.DIVIDER_Y);
  await createMarkdown(ctx.renderer, helpcontent, "readme", {
    x: 0,
    y: LAYOUT.CONTENT_START_Y,
    height: Math.max(process.stdout.rows - 6, 5),
  });
}
