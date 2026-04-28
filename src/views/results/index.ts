import {
  TextAttributes,
  TextRenderable,
  ScrollBoxRenderable,
} from "@opentui/core";
import type { CliRenderer, InputRenderable } from "@opentui/core";
import type Exa from "exa-js";
import type { AiSummaryState } from "./types";
import { LAYOUT } from "./types";
import {
  renderSearchQuery,
  renderResultsMeta,
  renderDivider,
  cleanupSearchResults,
  textPrimary,
  selected,
} from "./helpers";
import { createMarkdown } from "../../components/markdown";
import { handleWikipediaSearch } from "./wikipedia";
import { handleHelpScreen } from "./help";
import { handleUrlPreview } from "./url-preview";
import { handleNativeSearch } from "./native-search";
import { handleWebSearch } from "./web-search";

export type { AiSummaryState } from "./types";

export async function CreateResultsScreen(
  renderer: CliRenderer,
  searchInput: InputRenderable,
  searchInputId: string,
  resultTextId: string,
  exa: Exa,
  searchResults: TextRenderable[],
  searchUrls: string[],
  index: number,
  aiSummary: AiSummaryState,
): Promise<string> {
  const search = searchInput.value.trim();
  if (search === "") {
    return "search";
  }

  aiSummary.query = search;
  const normalizedSearch = search.startsWith("@web")
    ? search.replace(/^@web\b/, "").trim()
    : search;

  if (normalizedSearch === "") {
    return "search";
  }

  searchInput.value = "";
  searchInput.blur();

  cleanupSearchResults(renderer, searchResults);
  searchResults.length = 0;

  const ctx = {
    renderer,
    searchInput,
    searchInputId,
    resultTextId,
    exa,
    searchResults,
    searchUrls,
    index,
    aiSummary,
  };

  if (search.startsWith("@wikipedia") || search.startsWith("@wiki")) {
    await handleWikipediaSearch(ctx, search);
  } else if (search.startsWith("@help")) {
    await handleHelpScreen(ctx);
  } else if (search.startsWith("http")) {
    await handleUrlPreview(ctx, search);
  } else if (search.startsWith("@native")) {
    await handleNativeSearch(ctx, search);
  } else {
    await handleWebSearch(ctx, normalizedSearch);
  }

  return "results";
}

export async function ResumeResultsScreen(
  renderer: CliRenderer,
  searchResults: TextRenderable[],
  index: number,
  aiSummary: AiSummaryState,
): Promise<string> {
  if (aiSummary.query) {
    renderSearchQuery(renderer, aiSummary.query);
  }

  renderResultsMeta(renderer, `${searchResults.length} results`, LAYOUT.META_Y);

  if (aiSummary.content) {
    await createMarkdown(renderer, aiSummary.content, "ai-generated", {
      x: 0,
      y: 7,
      width: "100%",
      height: aiSummary.height,
    });
  }

  renderDivider(renderer, LAYOUT.DIVIDER_Y);

  const scrollboxY = aiSummary.content ? 7 + Number(aiSummary.height) + 1 : LAYOUT.CONTENT_START_Y;

  const resultsScrollbox = new ScrollBoxRenderable(renderer, {
    id: "results-scrollbox",
    width: "100%",
    height: Math.max(process.stdout.rows - scrollboxY - 1, 5),
  });
  resultsScrollbox.x = 1;
  resultsScrollbox.y = scrollboxY;

  for (const result of searchResults) {
    result.x = 1;
    result.attributes = 0;
    result.fg = textPrimary;
    resultsScrollbox.add(result);
    const spacer = new TextRenderable(renderer, { content: " ", fg: textPrimary });
    resultsScrollbox.add(spacer);
  }

  const clampedIndex = Math.max(0, Math.min(index, searchResults.length - 1));
  const selectedResult = searchResults[clampedIndex];

  if (selectedResult) {
    selectedResult.attributes = TextAttributes.BOLD;
    selectedResult.fg = selected;
  }

  renderer.root.add(resultsScrollbox);

  return "results";
}
