import {
  ASCIIFont,
  Box,
  Text,
  t,
  fg 
} from "@opentui/core";

const helpColor = "#4da3ff"
const webColor = "#ff8c42"
const wikipediaColor = "#ffd166"
const nativeColor = "#7bd88f"

export function CreateSearchScreen(renderer: any, splashscreenId : any, searchInput : any, searchInputId : any, activeSearchType: string) {
    const splashscreenRoot = renderer.root.getRenderable(splashscreenId);
    const existingSearchRoot = renderer.root.getRenderable(searchInputId);

    if (splashscreenRoot) {
    renderer.root.remove(splashscreenId);
    }

    if (existingSearchRoot) {
    renderer.root.remove(searchInputId);
    }

    const modeColor = activeSearchType === "@wikipedia" || activeSearchType === "@wiki"
      ? wikipediaColor
      : activeSearchType === "@web"
        ? webColor
      : activeSearchType === "@native"
        ? nativeColor
        : helpColor;

    const hintContent = activeSearchType === "@wikipedia" || activeSearchType === "@wiki"
      ? t`${fg(wikipediaColor)("Wikipedia")} · search using wikipedia`
      : activeSearchType === "@web"
        ? t`${fg(webColor)("Web")} · normal web search`
      : activeSearchType === "@native"
        ? t`${fg(nativeColor)("Native")} · search native pages`
        : t`${fg(helpColor)("Help")} · show help`;

    renderer.root.add(
    Box(
        { backgroundColor: "#0a0a0a",id: searchInputId, alignItems: "center", justifyContent: "center", flexGrow: 1, flexDirection: "column", gap: 2 },
        ASCIIFont({ font: "tiny", text: "OpenSearch" }),
        Box(
        { backgroundColor: "#1e1e1e", border: ["left", "right"], borderColor: modeColor, padding: 1, height: 5, justifyContent: "flex-start", alignItems: "flex-start", flexDirection: "column", gap: 1 },
        searchInput,
        Text({
            content: hintContent
        })
        ),
        Text(
        {
            content: "Press Tab to cycle between modes",
            fg: "#666666",
        }
    )
    ),
    );

    searchInput.focus();

    return "search";
}
