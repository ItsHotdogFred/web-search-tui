import {
  ASCIIFont,
  Box,
  createCliRenderer,
  Text,
  TextAttributes,
  parseColor,
  InputRenderable,
  TextRenderable,
  t,
  fg 
} from "@opentui/core";

import Exa from "exa-js";

import { CreateSplashScreen } from "./views/splashscreen";
import { CreateSearchScreen } from "./views/search";
import { CreateResultsScreen } from "./views/results";

const exa = new Exa(process.env.EXA_API_KEY || "");

const renderer = await createCliRenderer({ exitOnCtrlC: true });

const splashscreenId = "splashscreen";
const searchInputId = "searchInput";
const resultTextId = "resultText";
let searchResults: TextRenderable[] = [];
let index = 0;
let state = "splashscreen";

const blue = parseColor("79B8FF");
const red = parseColor("#FF7B72");


const searchInput = new InputRenderable(renderer, {
  placeholder: "Search anything...",
  width: process.stdout.columns - 60,
});

CreateSplashScreen(renderer, splashscreenId, state)

renderer.keyInput.on("keypress", async (key) => {
  switch (key.name) {
    case "return": {
      switch (state) {
        case "splashscreen": {
          state = CreateSearchScreen(renderer, splashscreenId, searchInput, searchInputId)

          break;
        }
        case "search": {
          state = await CreateResultsScreen(renderer, searchInput, searchInputId, resultTextId, exa, searchResults, index)
          break;
        }
        case "results": {
          break;
        }

        default:
          break;
      }

      break;
    }
    case "up":
    case "left": {
      index -= 1;

      if (index >= searchResults.length) {
        index = searchResults.length - 1;
      }

      const selectedResult = searchResults[index];

      if (selectedResult) {
        selectedResult.attributes = TextAttributes.BOLD | TextAttributes.UNDERLINE;
        selectedResult.fg = red;
      }

      const oldSelectedResult = searchResults[index + 1];

      if (oldSelectedResult) {
        oldSelectedResult.attributes = TextAttributes.BOLD;
        oldSelectedResult.fg = blue
      }

      break;
    }
    case "right":
    case "down": {
      index += 1;
      
      if (index < 0) {
        index = 0;
      }

      const selectedResult = searchResults[index];
      
      if (selectedResult) {
        selectedResult.attributes = TextAttributes.BOLD | TextAttributes.UNDERLINE;
        selectedResult.fg = red;
      }
      
      const oldSelectedResult = searchResults[index - 1];

      if (oldSelectedResult) {
        oldSelectedResult.attributes = TextAttributes.BOLD;
        oldSelectedResult.fg = blue;
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

        for (const result of searchResults) {
          if (result.id) {
            renderer.root.remove(result.id);
          }
        }
      

      searchResults = [];
      index = 0;

      process.stdout.write('\x1b[2J\x1b[H');
      if (state === "results") {
        state = CreateSearchScreen(renderer, splashscreenId, searchInput, searchInputId);
        searchInput.focus();
        searchInput.placeholder = "Search anything...";
      } else if (state === "search") {
        state = CreateSplashScreen(renderer, splashscreenId, state)
        searchInput.blur()
      }

    }
      break;
    }

    default:
      break;
  }
});

renderer.start();
