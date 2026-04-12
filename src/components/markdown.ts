// src/info/helpinfo.ts
import { MarkdownRenderable, ScrollBoxRenderable,SyntaxStyle, RGBA, getTreeSitterClient } from "@opentui/core";

let treeSitterClientPromise: Promise<any | null> | null = null;

async function getInitializedTreeSitterClient() {
  if (treeSitterClientPromise) {
    return treeSitterClientPromise;
  }

  treeSitterClientPromise = (async () => {
    try {
      const client = getTreeSitterClient();
      await client.initialize();
      return client;
    } catch {
      return null;
    }
  })();

  return treeSitterClientPromise;
}

export async function createMarkdown(
  renderer: any,
  content: string,
  id: string,
  options?: { width?: number | string; height?: number | string },
) {
  const syntaxStyle = SyntaxStyle.fromStyles({
    keyword: { fg: RGBA.fromHex("#FF7B72"), bold: true },
    string: { fg: RGBA.fromHex("#A5D6FF") },
    comment: { fg: RGBA.fromHex("#8B949E"), italic: true },
    number: { fg: RGBA.fromHex("#79C0FF") },
    function: { fg: RGBA.fromHex("#D2A8FF") },
    type: { fg: RGBA.fromHex("#FFA657") },
    operator: { fg: RGBA.fromHex("#FF7B72") },
    variable: { fg: RGBA.fromHex("#E6EDF3") },
    property: { fg: RGBA.fromHex("#79C0FF") },
    "punctuation.bracket": { fg: RGBA.fromHex("#F0F6FC") },
    "punctuation.delimiter": { fg: RGBA.fromHex("#C9D1D9") },
    "markup.heading": { fg: RGBA.fromHex("#58A6FF"), bold: true },
    "markup.heading.1": { fg: RGBA.fromHex("#00FF88"), bold: true, underline: true },
    "markup.heading.2": { fg: RGBA.fromHex("#00D7FF"), bold: true },
    "markup.heading.3": { fg: RGBA.fromHex("#FF69B4") },
    "markup.heading.4": { fg: RGBA.fromHex("#58A6FF"), bold: true },
    "markup.heading.5": { fg: RGBA.fromHex("#58A6FF"), bold: true },
    "markup.heading.6": { fg: RGBA.fromHex("#58A6FF"), bold: true },
    "markup.bold": { fg: RGBA.fromHex("#F0F6FC"), bold: true },
    "markup.list": { fg: RGBA.fromHex("#FF7B72") },
    "markup.list.checked": { fg: RGBA.fromHex("#FF7B72") },
    "markup.list.unchecked": { fg: RGBA.fromHex("#FF7B72") },
    "markup.raw": { fg: RGBA.fromHex("#A5D6FF"), bg: RGBA.fromHex("#161B22") },
    "markup.raw.block": { fg: RGBA.fromHex("#A5D6FF"), bg: RGBA.fromHex("#161B22") },
    "markup.raw.inline": { fg: RGBA.fromHex("#A5D6FF"), bg: RGBA.fromHex("#161B22") },
    "markup.strong": { fg: RGBA.fromHex("#F0F6FC"), bold: true },
    "markup.italic": { fg: RGBA.fromHex("#F0F6FC"), italic: true },
    "markup.quote": { fg: RGBA.fromHex("#8B949E"), italic: true },
    "markup.link": { fg: RGBA.fromHex("#58A6FF"), underline: true },
    "markup.link.label": { fg: RGBA.fromHex("#A5D6FF"), underline: true },
    "markup.link.url": { fg: RGBA.fromHex("#58A6FF"), underline: true },
    label: { fg: RGBA.fromHex("#7EE787") },
    conceal: { fg: RGBA.fromHex("#6E7681") },
    "punctuation.special": { fg: RGBA.fromHex("#8B949E") },
    default: { fg: RGBA.fromHex("#E6EDF3") },
  });

  const treeSitterClient = await getInitializedTreeSitterClient();

  const markdownOptions: any = {
    // id: id,
    width: 60,
    content: content,
    syntaxStyle,
    fg: RGBA.fromHex("#E6EDF3"),
    bg: RGBA.fromHex("#0D1117"),
    conceal: true,
  };

  if (treeSitterClient) {
    markdownOptions.treeSitterClient = treeSitterClient;
  }

  const existingMarkdown = renderer.root.getRenderable(id);
  if (existingMarkdown) {
    renderer.root.remove(id);
  }

  const scrollbox = new ScrollBoxRenderable(renderer, {
    id,
    width: (options?.width ?? "100%") as number | "auto" | `${number}%`,
    height: (options?.height ?? "100%") as number | "auto" | `${number}%`,
  });

  const markdown = new MarkdownRenderable(renderer, markdownOptions);

  scrollbox.add(markdown);
  renderer.root.add(scrollbox);
}
