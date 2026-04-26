import {
  ScrollBoxRenderable,
  TextAttributes,
  TextRenderable,
  parseColor,
} from "@opentui/core";

import { createMarkdown } from "../components/markdown";
import { helpcontent } from "../info/helpinfo";

import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

const model = "x-ai/grok-4.20"
const ENABLE_AI_SUMMARY = false;

const accent = parseColor("#8AB4F8");
const textPrimary = parseColor("#E8EAED");
const textSecondary = parseColor("#9AA0A6");
const selected = parseColor("#F28B82");
const divider = parseColor("#5F6368");
const resultsScrollboxId = "results-scrollbox";

type AiSummaryState = {
  content: string;
  height: number | "auto";
  query: string;
};

type NativeSearchResult = {
  file: string;
  similarity: number;
};

function getWrappedContentHeight(content: string, width: number) {
  const safeWidth = Math.max(width, 20);

  return content.split("\n").reduce((total, line) => {
    const lineLength = line.length === 0 ? 1 : line.length;
    return total + Math.ceil(lineLength / safeWidth);
  }, 0);
}

function stripFileExtension(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "");
}

function getResultDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function cleanDescription(description: string, maxLength = 240) {
  const normalized = description.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return normalized.slice(0, maxLength - 3).trimEnd() + "...";
}

function createResultBlock(index: number, title: string, description: string, url: string) {
  const domain = getResultDomain(url);

  return `${String(index + 1).padStart(2, "0")}  ${domain}
${title}
${cleanDescription(description)}
${url}`;
}

function renderSearchQuery(renderer: any, query: string) {
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

function renderResultsMeta(renderer: any, content: string, y: number) {
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

function renderDivider(renderer: any, y: number) {
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

function positionResults(searchResults: TextRenderable[], startY: number) {
  let currentY = startY;

  for (const result of searchResults) {
    result.x = 1;
    result.y = currentY;
    currentY += getWrappedContentHeight(String(result.content), Math.max(process.stdout.columns - 4, 20)) + 2;
  }

  return currentY;
}



export async function CreateResultsScreen(
  renderer: any,
  searchInput: any,
  searchInputId: any,
  resultTextId: any,
  exa: any,
  searchResults: any,
  searchUrls: string[],
  index: number,
  aiSummary: AiSummaryState,
) {
  const search = searchInput.value.trim();
  if (search === "") {
    return "search"
  }
  aiSummary.query = search;
  const normalizedSearch = search.startsWith("@web")
    ? search.replace(/^@web\b/, "").trim()
    : search;

  if (normalizedSearch === "") {
    return "search";
  }

  searchInput.value = "";
  let result: any;

  searchInput.blur()
  
  if (search.startsWith("@wikipedia") || search.startsWith("@wiki")) {
    aiSummary.content = "";
    aiSummary.height = 0;
    const res = await fetch(
      "https://en.wikipedia.org/api/rest_v1/page/summary/" +
        encodeURIComponent(search.replace("@wikipedia", "").replace("@wiki", "").trim()),
    );
    result = await res.json();

    renderer.root.remove(searchInputId);
    renderSearchQuery(renderer, aiSummary.query);

    renderer.root.add(
      new TextRenderable(renderer, {
        id: resultTextId,
        content: result.extract,
        attributes: TextAttributes.BOLD,
        fg: textPrimary,
      }),
    );

    const resultText = renderer.root.getRenderable(resultTextId);
    if (resultText) {
      resultText.x = 1;
      resultText.y = 5;
    }

    return "results";
  } else if (search.startsWith("@help")) {
    aiSummary.content = "";
    aiSummary.height = 0;
    renderer.root.remove(searchInputId)
    renderSearchQuery(renderer, aiSummary.query);
    renderResultsMeta(renderer, "Help and usage", 4);
    renderDivider(renderer, 5);
    await createMarkdown(renderer, helpcontent, "readme", { x: 0, y: 6, height: Math.max(process.stdout.rows - 6, 5) })
    return "results";
  } else if (search.startsWith("http")) {
    aiSummary.content = "";
    aiSummary.height = 0;
    const url = "https://markdown.gonna.party/?url=" + search.trim()
    const res = await fetch(url)
    const text = await res.text()
    renderer.root.remove(searchInputId)
    renderSearchQuery(renderer, aiSummary.query);
    renderResultsMeta(renderer, "Page preview", 4);
    renderDivider(renderer, 5);
    await createMarkdown(renderer, text, "readme", { x: 0, y: 6, height: Math.max(process.stdout.rows - 6, 5) })
    return "results";
  } else if (search.startsWith("@native")) {
    aiSummary.content = "";
    aiSummary.height = 0;
    searchInput.placeholder = "Searching...";

    const nativeQuery = search
      .replace(/^@native\b/, "")
      .trim();

    const res = await fetch("http://localhost:3000/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ search: nativeQuery }),
    });
    const nativeResults = (await res.json()) as NativeSearchResult[];

    renderer.root.remove(searchInputId);
    renderSearchQuery(renderer, aiSummary.query);

    if (nativeResults.length === 0) {
      renderer.root.add(
        new TextRenderable(renderer, {
          id: resultTextId,
          content: "No results found.",
          attributes: TextAttributes.BOLD,
          fg: textPrimary,
        }),
      );

      const resultText = renderer.root.getRenderable(resultTextId);
      if (resultText) {
        resultText.x = 1;
        resultText.y = 6;
      }

      return "results";
    }

    renderResultsMeta(renderer, `${nativeResults.length} native matches`, 4);
    renderDivider(renderer, 5);
    const resultsScrollbox = new ScrollBoxRenderable(renderer, {
      id: resultsScrollboxId,
      width: "100%",
      height: Math.max(process.stdout.rows - 7, 5),
    })
    resultsScrollbox.x = 1
    resultsScrollbox.y = 6

    for (const [nativeIndex, item] of nativeResults.entries()) {
      const nativeId = stripFileExtension(item.file);
      searchUrls.push(`native:${nativeId}`);

      searchResults.push(
        new TextRenderable(renderer, {
          id: `searchResult-${nativeIndex}`,
          content: `${String(nativeIndex + 1).padStart(2, "0")}  ${nativeId}\n${item.file}\nSimilarity score ${item.similarity.toFixed(3)}`,
          fg: textPrimary,
        }),
      );
    }

    positionResults(searchResults, 1);

    for (const result of searchResults) {
      resultsScrollbox.add(result);
    }

    const selectedResult = searchResults[index];

    if (selectedResult) {
      selectedResult.attributes = TextAttributes.BOLD;
      selectedResult.fg = selected;
    }

    renderer.root.add(resultsScrollbox)

    return "results";

  } else {
    searchInput.placeholder = "Searching...";
    result = await exa.search(normalizedSearch, {
      type: "fast",
      contents: {
        summary: true,
      },
    });
  }

  renderer.root.remove(searchInputId);
  renderSearchQuery(renderer, aiSummary.query);
  aiSummary.content = "";
  aiSummary.height = 0;
  let resultsStartY = 7;

  if (ENABLE_AI_SUMMARY) {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system" , content: "You are an AI which is designed to summarize web searches, ensure summarizes are only around 3 - 5 sentences long and provide the detail needed to satisfy the users request. Also ensure you cite the websites you used for the data."},
        { role: "system", content: "Here is the data from the search request:" + result},
        { role: "user", content: normalizedSearch.trim()}
      ]
    })

    const completionText =
      (completion.choices[0]?.message?.content ?? "No response generated.") +
      "\n Generated by: " +
      model;
    const summaryWidth = Math.max(process.stdout.columns - 4, 20);
    const summaryHeight = getWrappedContentHeight(completionText, summaryWidth) + 1;

    aiSummary.content = completionText;
    aiSummary.height = summaryHeight;

    await createMarkdown(renderer, completionText, "ai-generated",  {
      x: 0,
      y: 7,
      width: "100%",
      height: aiSummary.height,
    });

    resultsStartY = 7 + Number(aiSummary.height) + 1;
  }

  const results = result.results ?? [];
  renderResultsMeta(renderer, `${results.length} web results`, 4);
  renderDivider(renderer, 5);
  const scrollboxY = ENABLE_AI_SUMMARY && aiSummary.content ? 7 + Number(aiSummary.height) + 1 : 6;
  const resultsScrollbox = new ScrollBoxRenderable(renderer, {
    id: resultsScrollboxId,
    width: "100%",
    height: Math.max(process.stdout.rows - scrollboxY - 1, 5),
  })
  resultsScrollbox.x = 1
  resultsScrollbox.y = scrollboxY

  if (results.length === 0) {
    renderer.root.add(
      new TextRenderable(renderer, {
        id: resultTextId,
        content: "No results found.",
        attributes: TextAttributes.BOLD,
        fg: textPrimary,
      }),
    );

    const resultText = renderer.root.getRenderable(resultTextId);
    if (resultText) {
      resultText.x = 1;
      resultText.y = scrollboxY;
    }
  }

  for (const [index, item] of results.entries()) {
    const title = item.title ?? "Untitled";
    const url = item.url ?? "";
    const description =
      item.summary?.trim() ||
      item.text?.trim() ||
      "No description available.";

    searchUrls.push(item.url);

    searchResults.push(
      new TextRenderable(renderer, {
        id: `searchResult-${index}`,
        content: createResultBlock(index, title, description, url),
        fg: textPrimary,
      }),
    );
  }

  positionResults(searchResults, 1);

  for (const result of searchResults) {
    resultsScrollbox.add(result);
  }

  const selectedResult = searchResults[index];

  if (selectedResult) {
    selectedResult.attributes = TextAttributes.BOLD;
    selectedResult.fg = selected;
  }

  renderer.root.add(resultsScrollbox)

  return "results";
}

export async function ResumeResultsScreen(
  renderer: any,
  searchResults: TextRenderable[],
  index: number,
  aiSummary: AiSummaryState,
) {
  if (aiSummary.query) {
    renderSearchQuery(renderer, aiSummary.query);
  }

  let resultsStartY = 7;
  renderResultsMeta(renderer, `${searchResults.length} results`, 4);
  if (aiSummary.content) {
    await createMarkdown(renderer, aiSummary.content, "ai-generated", {
      x: 0,
      y: 7,
      width: "100%",
      height: aiSummary.height,
    });
    resultsStartY = 7 + Number(aiSummary.height) + 1;
  }

  renderDivider(renderer, 5);
  const scrollboxY = aiSummary.content ? 7 + Number(aiSummary.height) + 1 : 6;
  const resultsScrollbox = new ScrollBoxRenderable(renderer, {
    id: resultsScrollboxId,
    width: "100%",
    height: Math.max(process.stdout.rows - scrollboxY - 1, 5),
  })
  resultsScrollbox.x = 1
  resultsScrollbox.y = scrollboxY

  positionResults(searchResults, 1);

  for (const result of searchResults) {
    resultsScrollbox.add(result);
    result.attributes = 0;
    result.fg = textPrimary;
  }

  const selectedResult = searchResults[index];

  if (selectedResult) {
    selectedResult.attributes = TextAttributes.BOLD;
    selectedResult.fg = selected;
  }

  renderer.root.add(resultsScrollbox)

  return "results";
}
