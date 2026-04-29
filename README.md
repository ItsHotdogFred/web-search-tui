

https://github.com/user-attachments/assets/8f12571b-905f-438d-bc54-282af75ebafe


# web search tui

A terminal app for searching the web, reading Wikipedia articles, and previewing any URL, all without leaving your terminal. Built with [OpenTUI](https://git.new/create-tui).

It uses the Exa search API for web results, can fetch and render Wikipedia articles inline, and converts any URL to readable markdown. There is also experimental support for AI summaries of search results via OpenRouter.
For native search, it uses [Native Pages API](https://github.com/ItsHotdogFred/Native-Pages-API) which I made that uses embeddings for accurate search results.

You can test it out using ssh by typing:
```bash
ssh -p 2222 root@opensearch.itsfred.dev
```
in your terminal

## getting started

You need [Bun](https://bun.sh) installed.

```bash
bun install
bun dev
```

Create a `.env` file with your API keys:

```
EXA_API_KEY=your_exa_key
OPENROUTER_API_KEY=your_openrouter_key
```

The Exa key is required. The OpenRouter key is only needed if you enable AI summaries (off by default).

## usage

Type a query and hit Enter to search the web. Press Tab to switch between search modes:

| Mode | What it does |
|---|---|
| `@web` | Web search using Exa (default) |
| `@wikipedia` or `@wiki` | Fetches and renders a Wikipedia article |
| `@native` | Searches via a local companion server |

You can also paste a full URL to preview any webpage as markdown.

Arrow keys navigate results, Enter opens a link, Escape goes back. Links inside articles are clickable with the mouse.

## project structure

```
src/
  index.ts                  App entry, state machine, key bindings
  components/markdown.ts    Markdown renderer with syntax highlighting
  info/helpinfo.ts          Help page content
  views/
    splashscreen.ts         Splash screen
    search.ts               Search input
    results/
      index.ts              Routes queries to the right handler
      web-search.ts         Exa web search + AI summary
      wikipedia.ts          Wikipedia fetch and parse
      url-preview.ts        URL to markdown conversion
      native-search.ts      Local server search
      help.ts               Help screen
```

## ai summaries

There is a flag `ENABLE_AI_SUMMARY` in `src/views/results/web-search.ts`. Set it to `true` and provide an OpenRouter API key to get a short AI summary at the top of your web search results. Uses `x-ai/grok-4.20` by default.

## license

MIT
