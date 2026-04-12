export const helpcontent : string = `# OpenTUI Markdown Demo

Welcome to the **MarkdownRenderable** showcase! This demonstrates automatic table alignment and syntax highlighting.

## Features

- Automatic **table column alignment** based on content width
- Proper handling of \`inline code\`, **bold**, and *italic* in tables
- Multiple syntax themes to choose from
- Conceal mode hides formatting markers

## Comparison Table

| Feature | Status | Priority | Notes |
|---|---|---|---|
| Table alignment | **Done** | High | Uses \`marked\` parser |
| Conceal mode | *Working* | Medium | Hides \`**\`, \`\`\`\`, etc. |
| Theme switching | **Done** | Low | Multiple themes available |
| Unicode support | 日本語 | High | CJK characters |

## Code Examples

Here's how to use it:

\`\`\`typescript
import { MarkdownRenderable } from "@opentui/core"

const md = new MarkdownRenderable(renderer, {
  content: "# Hello World",
  syntaxStyle: mySyntaxStyle,
  fg: "#24292F",
  bg: "#FFFFFF",
  conceal: true, // Hide formatting markers
})
\`\`\`

And a JSON configuration example:

\`\`\`json
{
  "name": "opentui-markdown-demo",
  "theme": "github",
  "features": ["table-alignment", "syntax-highlighting", "conceal-mode"],
  "streaming": {
    "enabled": true,
    "speed": "slowest"
  }
}
\`\`\`

Here's a TSX component example:

\`\`\`tsx
import React from "react"
import { useState } from "react"

interface Props {
  title: string
  count: number
}

export const Counter: React.FC<Props> = ({ title, count: initialCount }) => {
  const [count, setCount] = useState(initialCount)

  return (
    <div className="counter">
      <h1>{title}</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
    </div>
  )
}
\`\`\`

## Light Theme Fallback Checks

Press \`T\` until **GitHub Light**. These fences intentionally skip syntax
highlighting and should still inherit the theme text color.

Unlabeled fenced block:

\`\`\`
this fence has no language tag
it should stay readable in GitHub Light
\`\`\`

Unsupported parser fallback:

\`\`\`toml
title = "GitHub Light"
status = "fallback text should stay readable"
\`\`\`

### API Reference

| Method | Parameters | Returns | Description |
|---|---|---|---|
| \`constructor\` | \`ctx, options\` | \`MarkdownRenderable\` | Create new instance |
| \`clearCache\` | none | \`void\` | Force re-render content |

## Inline Formatting Examples

| Style | Syntax | Rendered |
|---|---|---|
| Bold | \`**text**\` | **bold text** |
| Italic | \`*text*\` | *italic text* |
| Code | \`code\` | \`inline code\` |
| Link | \`[text](url)\` | [OpenTUI](https://github.com) |

## Mixed Content

> **Note**: This blockquote contains **bold** and \`code\` formatting.
> It should render correctly with proper styling.

### Emoji Support

| Emoji | Name | Category |
|---|---|---|
| 🚀 | Rocket | Transport |
| 🎨 | Palette | Art |
| ⚡ | Lightning | Nature |
| 🔥 | Fire | Nature |

---

## Alignment Examples

| Left | Center | Right |
|:---|:---:|---:|
| L1 | C1 | R1 |
| Left aligned | Centered text | Right aligned |
| Short | Medium length | Longer content here |

## Performance

The table alignment uses:
1. AST-based parsing with \`marked\`
2. Caching for repeated content
3. Smart width calculation accounting for concealed chars

---

*Press \`?\` for keybindings*`