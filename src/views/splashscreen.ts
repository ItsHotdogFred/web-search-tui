import {
  ASCIIFont,
  Box,
  Text,
  TextAttributes,

} from "@opentui/core";

export function CreateSplashScreen(renderer: any, splashscreenId: any, state : string ) {
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
    return "splashscreen"
}