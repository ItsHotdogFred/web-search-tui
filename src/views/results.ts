import {
  Text,
  TextAttributes,
  TextRenderable,
  parseColor,
} from "@opentui/core";

const blue = parseColor("79B8FF");
const red = parseColor("#FF7B72");

export async function CreateResultsScreen(
  renderer: any,
  searchInput: any,
  searchInputId: any,
  resultTextId: any,
  exa: any,
  searchResults: any,
  index: number,
) {
  const search = searchInput.value.trim();
  searchInput.value = "";
  let result: any;

  searchInput.blur()
  
  if (search.startsWith("@wikipedia")) {
    const res = await fetch(
      "https://en.wikipedia.org/api/rest_v1/page/summary/" +
        encodeURIComponent(search.replace("@wikipedia", "").trim()),
    );
    result = await res.json();

    renderer.root.remove(searchInputId);

    renderer.root.add(
      Text({
        id: resultTextId,
        content: result.extract,
        attributes: TextAttributes.BOLD,
        fg: blue,
      }),
    );

    return "results";
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
      Text({
        id: resultTextId,
        content: "No results found.",
        attributes: TextAttributes.BOLD,
        fg: blue,
      }),
    );
  }

  for (const [index, item] of results.entries()) {
    const title = JSON.stringify(item.title ?? null, null, 2);
    const url = JSON.stringify(item.url ?? null, null, 2);

    searchResults.push(
      new TextRenderable(renderer, {
        id: `searchResult-${index}`,
        content: `${index + 1}. Title: ${title}\nURL: ${url}`,
        attributes: TextAttributes.BOLD,
        fg: blue,
      }),
    );

    renderer.root.add(searchResults[index]);
  }

  const selectedResult = searchResults[index];

  if (selectedResult) {
    selectedResult.attributes = TextAttributes.BOLD | TextAttributes.UNDERLINE;
    selectedResult.fg = red;
  }

  return "results";
}
