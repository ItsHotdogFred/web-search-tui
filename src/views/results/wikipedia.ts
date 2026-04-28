import { TextAttributes, TextRenderable } from "@opentui/core";
import wtf from "wtf_wikipedia";
import type { HandlerContext } from "./types";
import { renderSearchQuery, renderError, textPrimary } from "./helpers";

export async function handleWikipediaSearch(ctx: HandlerContext, query: string): Promise<void> {
  ctx.aiSummary.content = "";
  ctx.aiSummary.height = 0;

  const searchTerm = query.replace("@wikipedia", "").replace("@wiki", "").trim();

  let doc: wtf.Document | null;
  try {
    doc = await wtf.fetch(searchTerm) as wtf.Document | null;
  } catch {
    ctx.renderer.root.remove(ctx.searchInputId);
    renderSearchQuery(ctx.renderer, ctx.aiSummary.query);
    renderError(ctx.renderer, ctx.resultTextId, "Failed to fetch Wikipedia article.", 5);
    return;
  }

  if (!doc) {
    ctx.renderer.root.remove(ctx.searchInputId);
    renderSearchQuery(ctx.renderer, ctx.aiSummary.query);
    renderError(ctx.renderer, ctx.resultTextId, "No Wikipedia article found.", 5);
    return;
  }

  const wikiResult = {
    title: doc.title(),
    summary: doc.section(0)?.text({}) ?? "",
    infobox: doc.infobox()?.json(),
    sections: doc.sections().slice(1).map(s => ({
      title: s.title(),
      text: s.text({}),
    })).filter(s => s.text.length > 0),
  };

  ctx.renderer.root.remove(ctx.searchInputId);
  renderSearchQuery(ctx.renderer, ctx.aiSummary.query);

  ctx.renderer.root.add(
    new TextRenderable(ctx.renderer, {
      id: ctx.resultTextId,
      content: wikiResult.summary || wikiResult.title || "No content available.",
      attributes: TextAttributes.BOLD,
      fg: textPrimary,
    }),
  );

  const resultText = ctx.renderer.root.getRenderable(ctx.resultTextId);
  if (resultText) {
    resultText.x = 1;
    resultText.y = 5;
  }
}
