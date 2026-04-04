import {
  ASCIIFont,
  Box,
  createCliRenderer,
  Text,
  TextAttributes,
  parseColor,
  InputRenderable,
  TextRenderable,
} from "@opentui/core";

import Exa from "exa-js";

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
  width: process.stdout.columns - 5,
  backgroundColor: "#0D1117",
});

renderer.root.add(
  Box(
    { id: splashscreenId, alignItems: "center", justifyContent: "center", flexGrow: 1 },
    Box(
      { justifyContent: "center", alignItems: "flex-end" },
      ASCIIFont({ font: "tiny", text: "WebTUI" }),
      Text({ content: "Press ENTER to start", attributes: TextAttributes.DIM }),
    ),
  ),
);

renderer.keyInput.on("keypress", async (key) => {
  switch (key.name) {
    case "return": {
      switch (state) {
        case "splashscreen": {
          state = "search";

          const splashscreenRoot = renderer.root.getRenderable(splashscreenId);

          if (splashscreenRoot) {
            renderer.root.remove(splashscreenId);
          }

          searchInput.focus();

          renderer.root.add(
            Box(
              { id: searchInputId, alignItems: "center", justifyContent: "center", flexGrow: 1 },
              ASCIIFont({ font: "tiny", text: "TUIGLE" }),
              Box({ borderStyle: "single", padding: 1 }, searchInput),
            ),
          );

          break;
        }
        case "search": {
          const search = searchInput.value.trim();
          searchInput.value = "";
          let result: any;

          if (search.startsWith("@wikipedia")) {
            const res = await fetch(
              "https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(search.replace("@wikipedia", "").trim()),
            );
            result = await res.json();

            renderer.root.remove(searchInputId);

            renderer.root.add(
              Text({ id: resultTextId, content: result.extract, attributes: TextAttributes.BOLD, fg: blue }),
            );

            state = "results";

          } else {
            searchInput.placeholder = "Searching...";
            result = await exa.search(search, {
              type: "instant",
            });
          }

          renderer.root.remove(searchInputId);

          const results = result.results ?? [];

          if (results.length === 0) {
            renderer.root.add(
              Text({ id: resultTextId, content: "No results found.", attributes: TextAttributes.BOLD, fg: blue }),
            );
            break;
          }

          for (const [index, item] of results.entries()) {
            const title = JSON.stringify(item.title ?? null, null, 2);
            const url = JSON.stringify(item.url ?? null, null, 2);

            searchResults.push(new TextRenderable(renderer, {
              id: `searchResult-${index}`,
              content: `${index + 1}. Title: ${title}\nURL: ${url}`,
              attributes: TextAttributes.BOLD,
              fg: blue,
            }));

            renderer.root.add(searchResults[index]);
          }

          const selectedResult = searchResults[index];

          if (selectedResult) {
            selectedResult.attributes = TextAttributes.BOLD | TextAttributes.UNDERLINE;
            selectedResult.fg = red;
          }

          state = "results";

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
      if (state === "results") {
        state = "search";

        for (const result of searchResults) {
          if (result.id) {
            renderer.root.remove(result.id);
          }
        }

        renderer.root.remove(resultTextId);

          searchResults = [];
          index = 0;

          renderer.root.add(
            Box(
              { id: searchInputId, alignItems: "center", justifyContent: "center", flexGrow: 1 },
              ASCIIFont({ font: "tiny", text: "TUIGLE" }),
              Box({ borderStyle: "single", padding: 1 }, searchInput),
            ),
          );

          searchInput.placeholder = "Search anything...";
          searchInput.focus();

        break;
      }

      break;
    }

    default:
      break;
  }
});

renderer.start();
