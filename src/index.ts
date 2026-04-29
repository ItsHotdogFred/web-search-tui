import {
  createCliRenderer,
  TextAttributes,
  parseColor,
  InputRenderable,
  TextRenderable,
  Text,
} from "@opentui/core";

import Exa from "exa-js";

import { CreateSplashScreen } from "./views/splashscreen";
import { CreateSearchScreen } from "./views/search";
import { CreateResultsScreen, ResumeResultsScreen } from "./views/results";
import { createMarkdown } from "./components/markdown";
import { CreateNativeScreen } from "./views/native";

import data from "../test.json"

export const history: string[] = []
let historyIndex = 0;
let searchTypeIndex = 0;
const searchTypeList = [
  "@web",
  "@help",
  "@wikipedia",
  "@native",
]

const exa = new Exa(process.env.EXA_API_KEY || "");

const renderer = await createCliRenderer({ exitOnCtrlC: true, useMouse: true });

const splashscreenId = "splashscreen";
const searchInputId = "searchInput";
const resultTextId = "resultText";
const pagescreenId = "pagescreen"
const nativeResultsId = "native-results"
let searchResults: TextRenderable[] = [];
let searchUrls: string[] = [];
let searchIndex = 0;
const aiSummary = { content: "", height: 0, query: "" };
let state = "search";

const resultDefault = parseColor("#E8EAED");
const resultSelected = parseColor("#F28B82");


const searchInput = new InputRenderable(renderer, {
  placeholder: "Search anything...",
  width: process.stdout.columns - 60,
});

process.stdout.on("resize", () => {
  searchInput.width = Math.max(process.stdout.columns - 60, 20);
});

async function openMarkdownPage(url: string) {
  const markdownUrl = "https://markdown.gonna.party/?url=" + encodeURIComponent(url);
  const res = await fetch(markdownUrl);
  const text = await res.text();

  await createMarkdown(renderer, text, pagescreenId, {
    baseUrl: url,
    onLinkClick: openMarkdownPage,
  });
}


switch (state) {
  case "splashscreen": {
    CreateSplashScreen(renderer, splashscreenId, state)

    break;
  }
  case "search": {
    CreateSearchScreen(renderer, splashscreenId, searchInput, searchInputId, searchTypeList[searchTypeIndex] || "@web")
    break;
  }
  case "native": {
    state = CreateNativeScreen(renderer, "", "native", data)
    break;
  }

  default:
    break;
}
// CreateSplashScreen(renderer, splashscreenId, state)

renderer.keyInput.on("keypress", async (key) => {
  switch (key.name) {

    case "tab": {
      if (state == "search") {
        searchTypeIndex = (searchTypeIndex + 1) % searchTypeList.length;
        CreateSearchScreen(renderer, splashscreenId, searchInput, searchInputId, searchTypeList[searchTypeIndex] || "@web")
      }
      break;
    }

    case "return": {
      switch (state) {
        case "splashscreen": {
          state = CreateSearchScreen(renderer, splashscreenId, searchInput, searchInputId, searchTypeList[searchTypeIndex] || "@web")

          break;
        }
        case "search": {
          const inputValue = searchInput.value;
          const hasExplicitType = searchTypeList.some((type) => inputValue.startsWith(type)) || inputValue.startsWith("@wiki");
          const activeType = searchTypeList[searchTypeIndex] || "@web";
          const shouldApplyMode = !hasExplicitType && inputValue.trim() !== "" && activeType !== "@web";
          const effectiveValue = shouldApplyMode ? `${activeType} ${inputValue}` : inputValue;

          history.push(effectiveValue)
          historyIndex = history.length
          searchInput.value = effectiveValue;
          state = await CreateResultsScreen(renderer, searchInput, searchInputId, resultTextId, exa, searchResults, searchUrls, searchIndex, aiSummary)
          break;
        }
        case "results": {
          state = "page"
          const selectedUrl = searchUrls[searchIndex]
          renderer.root.remove("ai-generated")
          renderer.root.remove("search-query")
          renderer.root.remove("results-meta")
          renderer.root.remove("results-divider")
          renderer.root.remove("results-scrollbox")
          renderer.root.remove(nativeResultsId)
          for (const result of searchResults) {
            if (result.id) {
              renderer.root.remove(result.id);
            }
          }

          if (selectedUrl?.startsWith("native:")) {
            const nativeId = selectedUrl.replace("native:", "");
            const nativeViewUrl = new URL("https://native.itsfred.dev/api/view/")
            nativeViewUrl.searchParams.set("page", nativeId)
            const res = await fetch(nativeViewUrl)
            const nativeJson = await res.json()
            CreateNativeScreen(renderer, pagescreenId, "native", nativeJson)
          } else if (selectedUrl) {
            await openMarkdownPage(selectedUrl)
          }

          // renderer.root.add(Text({
          //   id : pagescreenId,
          //   content: text 
          // }))
          break;
        }

        default:
          break;
      }

      break;
    }
    case "up": {
      switch (state) {
        case "results": {
          searchIndex -= 1;

          if (searchIndex < 0) {
        searchIndex = 0;
          }

          const selectedResult = searchResults[searchIndex];

          if (selectedResult) {
        selectedResult.attributes = TextAttributes.BOLD;
        selectedResult.fg = resultSelected;
          }

          const oldSelectedResult = searchResults[searchIndex + 1];

          if (oldSelectedResult) {
        oldSelectedResult.attributes = 0;
        oldSelectedResult.fg = resultDefault;
          }
          break;
        }
        case "search": {
          if (history.length === 0) break;
          
          if (historyIndex === -1) {
            historyIndex = history.length;
          }
          
          historyIndex -= 1;
          
          if (historyIndex < 0) {
            historyIndex = 0;
          }

          const currentHistory = history[historyIndex];

          if (currentHistory) {
            searchInput.value = currentHistory;
          }

          break;
        }
      }

      break;
    }
    case "down": {
      switch (state) {
        case "results": {
          searchIndex += 1;
          searchIndex = Math.min(searchIndex, searchResults.length - 1);

          const selectedResult = searchResults[searchIndex];
          
          if (selectedResult) {
            selectedResult.attributes = TextAttributes.BOLD;
            selectedResult.fg = resultSelected;
          }
          
          const oldSelectedResult = searchResults[searchIndex - 1];

          if (oldSelectedResult) {
            oldSelectedResult.attributes = 0;
            oldSelectedResult.fg = resultDefault;
          }

          break;
        }
        case "search": {
          if (history.length === 0) break;
          
          historyIndex += 1;
          
          if (historyIndex >= history.length) {
            historyIndex = -1;
            searchInput.value = "";
          } else {
            const currentHistory = history[historyIndex];
            if (currentHistory) {
              searchInput.value = currentHistory;
            }
          }

          break;
        }
      }

      break;
    }
    case "escape": {
      if (state !== "splashscreen") {
        searchInput.value = "";
        searchInput.placeholder = "";

        renderer.root.remove(searchInputId);
        renderer.root.remove(resultTextId);
        renderer.root.remove(splashscreenId);
        renderer.root.remove(pagescreenId)
        renderer.root.remove("readme")
        renderer.root.remove("ai-generated")
        renderer.root.remove("search-query")
        renderer.root.remove("results-meta")
        renderer.root.remove("results-divider")
        renderer.root.remove("results-scrollbox")
        renderer.root.remove(nativeResultsId)

        for (const result of searchResults) {
          if (result.id) {
            renderer.root.remove(result.id);
          }
        }
      

      process.stdout.write('\x1b[2J\x1b[H');
      if (state === "results") {
        searchResults = [];
        searchUrls = [];
        searchIndex = 0;
        state = CreateSearchScreen(renderer, splashscreenId, searchInput, searchInputId, searchTypeList[searchTypeIndex] || "@web");
        searchInput.focus();
        searchInput.placeholder = "Search anything...";
      } else if (state === "search") {
        searchResults = [];
        searchUrls = [];
        searchIndex = 0;
        state = CreateSplashScreen(renderer, splashscreenId, state)
        searchInput.blur()
      } else if (state === "page") {
        state = await ResumeResultsScreen(renderer, searchResults, searchIndex, aiSummary)
      }

    }
      break;
    }

    default:
      break;
  }
});

renderer.start();
