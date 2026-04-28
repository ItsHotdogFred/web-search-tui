import {
  TextAttributes,
  TextRenderable,
  ScrollBoxRenderable,
  parseColor,
} from "@opentui/core";
import type { CliRenderer } from "@opentui/core";

export const accent = parseColor("#8AB4F8");
export const textPrimary = parseColor("#E8EAED");
export const textSecondary = parseColor("#9AA0A6");
export const selected = parseColor("#F28B82");
export const divider = parseColor("#5F6368");

export const RESULTS_SCROLLBOX_ID = "results-scrollbox";

export function getWrappedContentHeight(content: string, width: number): number {
  const safeWidth = Math.max(width, 20);
  return content.split("\n").reduce((total, line) => {
    const lineLength = line.length === 0 ? 1 : line.length;
    return total + Math.ceil(lineLength / safeWidth);
  }, 0);
}

export function stripFileExtension(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, "");
}

export function getResultDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function cleanDescription(description: string, maxLength = 240): string {
  const normalized = (description ?? "").replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return normalized.slice(0, maxLength - 3).trimEnd() + "...";
}

export function createResultBlock(index: number, title: string, description: string, url: string): string {
  const domain = getResultDomain(url);
  return `${String(index + 1).padStart(2, "0")}  ${domain}
${title}
${cleanDescription(description)}
${url}`;
}

export function renderSearchQuery(renderer: CliRenderer, query: string): void {
  const existingQuery = renderer.root.getRenderable("search-query");
  if (existingQuery) {
    renderer.root.remove("search-query");
  }

  renderer.root.add(
    new TextRenderable(renderer, {
      id: "search-query",
      content: `SEARCH RESULTS\n${query}`,
      attributes: TextAttributes.BOLD,
      fg: accent,
    }),
  );

  const queryRenderable = renderer.root.getRenderable("search-query");
  if (queryRenderable) {
    queryRenderable.x = 1;
    queryRenderable.y = 1;
  }
}

export function renderResultsMeta(renderer: CliRenderer, content: string, y: number): void {
  const existingMeta = renderer.root.getRenderable("results-meta");
  if (existingMeta) {
    renderer.root.remove("results-meta");
  }

  renderer.root.add(
    new TextRenderable(renderer, {
      id: "results-meta",
      content,
      fg: textSecondary,
    }),
  );

  const metaRenderable = renderer.root.getRenderable("results-meta");
  if (metaRenderable) {
    metaRenderable.x = 1;
    metaRenderable.y = y;
  }
}

export function renderDivider(renderer: CliRenderer, y: number): void {
  const existingDivider = renderer.root.getRenderable("results-divider");
  if (existingDivider) {
    renderer.root.remove("results-divider");
  }

  renderer.root.add(
    new TextRenderable(renderer, {
      id: "results-divider",
      content: "-".repeat(Math.max(process.stdout.columns - 2, 20)),
      fg: divider,
    }),
  );

  const dividerRenderable = renderer.root.getRenderable("results-divider");
  if (dividerRenderable) {
    dividerRenderable.x = 1;
    dividerRenderable.y = y;
  }
}

export function cleanupSearchResults(renderer: CliRenderer, searchResults: TextRenderable[]): void {
  renderer.root.remove(RESULTS_SCROLLBOX_ID);
  for (const result of searchResults) {
    if (result.id) {
      renderer.root.remove(result.id);
    }
  }
}

type ScrollboxResultEntry = {
  renderable: TextRenderable;
  url: string;
};

export function renderResultScrollbox(
  renderer: CliRenderer,
  entries: ScrollboxResultEntry[],
  selectedIndex: number,
  scrollboxY: number,
  searchResults: TextRenderable[],
  searchUrls: string[],
): void {
  const scrollbox = new ScrollBoxRenderable(renderer, {
    id: RESULTS_SCROLLBOX_ID,
    width: "100%",
    height: Math.max(process.stdout.rows - scrollboxY - 1, 5),
  });
  scrollbox.x = 1;
  scrollbox.y = scrollboxY;

  for (const entry of entries) {
    searchUrls.push(entry.url);
    searchResults.push(entry.renderable);
  }

  for (const result of searchResults) {
    scrollbox.add(result);
    const spacer = new TextRenderable(renderer, { content: " ", fg: textPrimary });
    scrollbox.add(spacer);
  }

  const clampedIndex = Math.max(0, Math.min(selectedIndex, searchResults.length - 1));
  const selectedResult = searchResults[clampedIndex];

  if (selectedResult) {
    selectedResult.attributes = TextAttributes.BOLD;
    selectedResult.fg = selected;
  }

  renderer.root.add(scrollbox);
}

export function renderError(renderer: CliRenderer, resultTextId: string, message: string, y: number): void {
  renderer.root.add(
    new TextRenderable(renderer, {
      id: resultTextId,
      content: message,
      attributes: TextAttributes.BOLD,
      fg: textPrimary,
    }),
  );
  const resultText = renderer.root.getRenderable(resultTextId);
  if (resultText) {
    resultText.x = 1;
    resultText.y = y;
  }
}
