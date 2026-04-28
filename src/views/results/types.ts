import type { CliRenderer, InputRenderable, TextRenderable } from "@opentui/core";
import type Exa from "exa-js";

export type AiSummaryState = {
  content: string;
  height: number | "auto";
  query: string;
};

export type NativeSearchResult = {
  file: string;
  similarity: number;
};

export type HandlerContext = {
  renderer: CliRenderer;
  searchInput: InputRenderable;
  searchInputId: string;
  resultTextId: string;
  exa: Exa;
  searchResults: TextRenderable[];
  searchUrls: string[];
  index: number;
  aiSummary: AiSummaryState;
};

export const LAYOUT = {
  HEADER_Y: 1,
  META_Y: 4,
  DIVIDER_Y: 5,
  CONTENT_START_Y: 6,
} as const;
