# search-solar

CLI tool for searching [Solar icons (`react-perf`)](https://www.npmjs.com/package/@solar-icons/react-perf).

## Install

```bash
npm install -g search-solar
```

## Commands

### `query <text>` — global search
Searches across name, category, and tags at once. Results ranked by relevance.
```bash
search-solar query chat
search-solar query "arrow left" --limit 5
```

### `search` — filtered search
Filter by any combination of name, tag, and category (all filters are ANDed).
```bash
search-solar search -n chat
search-solar search -t chat
search-solar search -n chat -c messages
search-solar search --category messages --tag video
```

### `list` — browse icons
```bash
search-solar list                  # all icons
search-solar list -c arrows        # scoped to a category
search-solar list -c arrows --limit 20
```

### `categories` — list all categories
Useful before using `search -c` or `list -c`.
```bash
search-solar categories
```

### `tags` — list all tags
```bash
search-solar tags                       # all tags
search-solar tags --category arrows     # tags within a category
```

## Output format

Every matched icon shows:
```
name:     ChatRound
category: Messages
tags:     chat, message, bubble, communication
import:   import { ChatRound } from "@solar-icons/react-perf/<Broken|Outline|Linear|Bold|LineDuotone|BoldDuotone>"
```

## Global options

| Flag | Description | Commands |
|---|---|---|
| `--limit <n>` | Max results to return | `query`, `search`, `list` |

## Development

You will need to grab the Solar Icons list from their website ([https://solar-icons.vercel.app/](https://solar-icons.vercel.app/)). Open DevTools, do some digging around, find the list of all icons and their tags, categories, etc. Save it to a file, run the `parse` script on that file to generate `data/icons.json`.

```bash
npm run build   # Build and copy data file
npm run parse   # Parse icons data
```