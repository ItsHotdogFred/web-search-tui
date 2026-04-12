import {
  ASCIIFont,
  Box,
  Text,
  t,
  fg 
} from "@opentui/core";

const helpColor = "#4087ca"

export function CreateSearchScreen(renderer: any, splashscreenId : any, searchInput : any, searchInputId : any) {
    const splashscreenRoot = renderer.root.getRenderable(splashscreenId);

    if (splashscreenRoot) {
    renderer.root.remove(splashscreenId);
    }

    renderer.root.add(
    Box(
        { backgroundColor: "#0a0a0a",id: searchInputId, alignItems: "center", justifyContent: "center", flexGrow: 1, flexDirection: "column", gap: 2 },
        ASCIIFont({ font: "tiny", text: "OpenSearch" }),
        Box(
        {gap: 1},
        Text({
            content: t`${fg(helpColor)("@help")}  show help`
        }),
        Text({
            content: t`${fg(helpColor)("@wikipedia")}  Search using wikipedia`
        })
        ),
        Box({ backgroundColor: "#1e1e1e", border: ["left", "right"], borderColor: "white", padding: 1, alignItems: "center" }, searchInput),
    ),
    );

    searchInput.focus();

    return "search";
}