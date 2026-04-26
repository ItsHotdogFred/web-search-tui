// src/info/helpinfo.ts
import { MarkdownRenderable, ScrollBoxRenderable, SyntaxStyle, RGBA, getTreeSitterClient, getLinkId, MouseButton } from "@opentui/core";

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

type CreateMarkdownOptions = {
  x?: number;
  y?: number;
  width?: number | string;
  height?: number | string;
  baseUrl?: string;
  onLinkClick?: (url: string) => void | Promise<void>;
};

function getClickedLinkUrl(renderer: any, x: number, y: number) {
  if (!renderer.lib?.linkGetUrl) {
    return null;
  }

  const buffers = [
    renderer.currentRenderBuffer,
    renderer.nextRenderBuffer,
  ].filter(Boolean);

  const offsets = [
    [0, 0],
    [-1, 0],
    [1, 0],
  ] as const;

  for (const [offsetX, offsetY] of offsets) {
    const cellX = x + offsetX;
    const cellY = y + offsetY;

    for (const buffer of buffers) {
      if (cellX < 0 || cellY < 0 || cellX >= buffer.width || cellY >= buffer.height) {
        continue;
      }

      const attributes = buffer.buffers.attributes[cellY * buffer.width + cellX];

      if (attributes === undefined) {
        continue;
      }

      const linkId = getLinkId(attributes);

      if (linkId) {
        return renderer.lib.linkGetUrl(linkId) as string;
      }
    }
  }

  return null;
}

export async function createMarkdown(
  renderer: any,
  content: string,
  id: string,
  options?: CreateMarkdownOptions,
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
    width: (options?.width ?? "100%") as number | "auto" | `${number}%`,
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

  if (options?.x !== undefined) {
    scrollbox.x = options.x;
  }

  if (options?.y !== undefined) {
    scrollbox.y = options.y;
  }

  const onLinkClick = options?.onLinkClick;

  if (onLinkClick) {
    scrollbox.onMouseUp = async (event) => {
      if (event.button !== MouseButton.LEFT) {
        return;
      }

      const href = getClickedLinkUrl(renderer, event.x, event.y);

      if (!href) {
        return;
      }

      let url: URL;

      try {
        url = new URL(href, options.baseUrl);
      } catch {
        return;
      }

      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      await onLinkClick(url.toString());
    };
  }

  const markdown = new MarkdownRenderable(renderer, markdownOptions);

  scrollbox.add(markdown);
  renderer.root.add(scrollbox);
}
