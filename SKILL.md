---
name: search-solar
description: A dead simple CLI to search Solar icons. Built for agents. 
---

# search-solar — Agent Skill

You have access to the `search-solar` CLI for finding Solar icons by name, category, or tag.

## When to use this skill

Use this skill whenever the user asks for an icon, e.g.:
- "find an icon for notifications"
- "I need a home icon"
- "what icons are available for arrows?"
- "is there a video camera icon?"

---

## How to find an icon

### Step 1 — start with `query`

Always start with a broad `query` before trying narrower commands. It searches name, category, and tags at once and ranks by relevance.

```bash
search-solar query <term> [--limit <n>]
```

If results are too noisy, add `--limit 5` to see only the top matches.

### Step 2 — narrow with `search` if needed

If `query` returns too many results or you want to match on a specific field:

```bash
search-solar search --name <n> [--limit <n>]
search-solar search --tag <tag> [--limit <n>]
search-solar search --category <category> [--limit <n>]
search-solar search --name <n> --tag <tag>   # all flags are ANDed
```

`-n`, `-t`, and `-c` are short aliases for `--name`, `--tag`, and `--category`.

### Step 3 — browse a category with `list`

`list` is distinct from `search` — use it when you want to see everything within a known category rather than filtering by keyword. It's the right tool after `categories` tells you what's available.

```bash
search-solar list --category <category> [--limit <n>]   # scoped to a category
search-solar list [--limit <n>]                         # all icons (use sparingly)
```

`-c` is a short alias for `--category`.

### Step 4 — explore with `categories` or `tags` if stuck

If you're unsure what terms to search for:

```bash
search-solar categories                      # see all available categories
search-solar tags --category <category>      # see tags within a category
search-solar tags                            # all tags across all icons
```

---

## Reading results

Each result looks like this:

```
name:     ChatRound
category: Messages
tags:     chat, message, bubble, communication
import:   import { ChatRound } from "@solar-icons/react-perf/<Broken|Outline|Linear|Bold|LineDuotone|BoldDuotone>"
```

- **name** — the exact component name to use in code
- **category** — the icon's group; useful for follow-up searches
- **tags** — keywords associated with this icon
- **import** — replace `<Broken|Outline|...>` with one style (see below)

### Styles

| Style | Character |
|---|---|
| `Broken` | Broken/dashed strokes |
| `Outline` | Clean outlined |
| `Linear` | Thin linear strokes |
| `Bold` | Thick/filled |
| `LineDuotone` | Two-tone linear |
| `BoldDuotone` | Two-tone bold |

When the user hasn't specified a style, default to **`Linear`** as it's the most versatile. If they mention "filled" use `Bold`, "two-tone" use `LineDuotone`.

### Empty results

When no icons match, the CLI outputs:
```
No icons found.
```
No error is thrown and the exit code is 0. When you see this, try a synonym before giving up (see Tips).

---

## Decision flow

```
User asks for an icon
        │
        ▼
search-solar query <term> --limit 10
        │
        ├─ Good match found? → return name + import to user (see Presenting Results)
        │
        └─ "No icons found" / too broad?
                │
                ├─ Try a synonym: e.g. "bell" instead of "notification"
                ├─ search-solar search --tag <term>
                └─ search-solar categories
                        │
                        └─ search-solar list --category <cat> --limit 20
```

---

## Presenting results to the user

When you find a match, present it clearly:

1. State the icon name and what style you chose and why (if the user didn't specify).
2. Give the import in a code block with the style already substituted in.

Example:
> Here's a good match — `ChatRound` from the Messages category. I've used the `Linear` style as a default:
> ```js
> import { ChatRound } from "@solar-icons/react-perf/Linear"
> ```
> If you'd prefer a filled version, swap `Linear` for `Bold`.

---

## Example workflows

**User:** "I need an icon for sending a message"
```bash
search-solar query "send message" --limit 5
# → likely surfaces ChatSend, SendSquare, etc.
```

**User:** "Show me all arrow icons"
```bash
search-solar categories
# → confirms "Arrows" exists
search-solar list --category arrows --limit 20
```

**User:** "I want a filled home icon"
```bash
search-solar query "home" --limit 5
# → pick the best match, present with Bold style
```

**User:** "What notification icons are there?"
```bash
search-solar query "notification"
# if weak results, try:
search-solar search --tag "notification"
```

---

## Tips

- Icon names are PascalCase — pass them as-is into the import.
- If a search returns `No icons found.`, try a synonym before giving up: `bell` → `notification`, `trash` → `delete`, `pen` → `edit`.
- Tags and category names are case-insensitive in all commands.
- `-c`, `-n`, `-t` are short aliases for `--category`, `--name`, `--tag` respectively.
- `--limit` is supported on `query`, `search`, and `list`. Use 5–10 to avoid overwhelming the user.
- All icons are React-specific (`@solar-icons/react-perf`). If the user is working in Vue, plain HTML, or another framework, provide the icon name and note that the import shown is React-only.