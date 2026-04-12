import {
  createCliRenderer,
  TextAttributes,
  parseColor,
  InputRenderable,
  TextRenderable,
} from "@opentui/core";

import Exa from "exa-js";

import { CreateSplashScreen } from "./views/splashscreen";
import { CreateSearchScreen } from "./views/search";
import { CreateResultsScreen, ResumeResultsScreen } from "./views/results";
import { createMarkdown } from "./components/markdown";
import { CreateTestScreen } from "./views/test";

import data from "../test.json"

export const history: string[] = []
let historyIndex = 0;
let searchTypeIndex = 0;
const searchTypeList = [
  "@help",
  "@wikipedia"
]

const exa = new Exa(process.env.EXA_API_KEY || "");

const renderer = await createCliRenderer({ exitOnCtrlC: true });

const splashscreenId = "splashscreen";
const searchInputId = "searchInput";
const resultTextId = "resultText";
const pagescreenId = "pagescreen"
let searchResults: TextRenderable[] = [];
let searchUrls: string[] = [];
let searchIndex = 0;
const aiSummary = { content: "", height: 0 };
let state = "test";

const blue = parseColor("79B8FF");
const red = parseColor("#FF7B72");


const searchInput = new InputRenderable(renderer, {
  placeholder: "Search anything...",
  width: process.stdout.columns - 60,
});

process.stdout.on("resize", () => {
  searchInput.width = Math.max(process.stdout.columns - 60, 20);
});


switch (state) {
  case "splashscreen": {
    CreateSplashScreen(renderer, splashscreenId, state)

    break;
  }
  case "search": {
    CreateSearchScreen(renderer, splashscreenId, searchInput, searchInputId)
    break;
  }
  case "test": {
    state = CreateTestScreen(renderer, "", "test", data)
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
        const value = searchInput.value
        const currentIndex = searchTypeList.findIndex((type) => value.startsWith(type));

        if (currentIndex >= 0) {
          const currentType = searchTypeList[currentIndex];
          const nextIndex = (currentIndex + 1) % searchTypeList.length;
          const nextType = searchTypeList[nextIndex];

          if (currentType && nextType) {
            searchInput.value = searchInput.value.replace(currentType, nextType);
          }
        } else {
          searchTypeIndex = 0
          searchInput.value = searchTypeList[searchTypeIndex] + " " + searchInput.value
        }
      }
      break;
    }

    case "return": {
      switch (state) {
        case "splashscreen": {
          state = CreateSearchScreen(renderer, splashscreenId, searchInput, searchInputId)

          break;
        }
        case "search": {
          history.push(searchInput.value)
          historyIndex = history.length
          state = await CreateResultsScreen(renderer, searchInput, searchInputId, resultTextId, exa, searchResults, searchUrls, searchIndex, aiSummary)
          break;
        }
        case "results": {
          state = "page"
          const url = "https://markdown.gonna.party/?url=" + searchUrls[searchIndex]
          const res = await fetch(url)
          const text = await res.text()
          renderer.root.remove("ai-generated")
          for (const result of searchResults) {
            if (result.id) {
              renderer.root.remove(result.id);
            }
          }
          await createMarkdown(renderer, text, pagescreenId)
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
        selectedResult.attributes = TextAttributes.BOLD | TextAttributes.UNDERLINE;
        selectedResult.fg = red;
          }

          const oldSelectedResult = searchResults[searchIndex + 1];

          if (oldSelectedResult) {
        oldSelectedResult.attributes = TextAttributes.BOLD;
        oldSelectedResult.fg = blue;
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
          
          if (searchIndex < 0) {
            searchIndex = 0;
          }

          const selectedResult = searchResults[searchIndex];
          
          if (selectedResult) {
            selectedResult.attributes = TextAttributes.BOLD | TextAttributes.UNDERLINE;
            selectedResult.fg = red;
          }
          
          const oldSelectedResult = searchResults[searchIndex - 1];

          if (oldSelectedResult) {
            oldSelectedResult.attributes = TextAttributes.BOLD;
            oldSelectedResult.fg = blue;
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
        state = CreateSearchScreen(renderer, splashscreenId, searchInput, searchInputId);
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
