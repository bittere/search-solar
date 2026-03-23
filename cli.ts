#!/usr/bin/env node
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Command } from "commander";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, "data", "icons.json");

const STYLES = ["Broken", "Outline", "Linear", "Bold", "LineDuotone", "BoldDuotone"];

interface IconData {
  name: string;
  category: string;
  categoryTags: string[];
  tags: string[];
}

// ── Output helpers ────────────────────────────────────────────────────────────

const SEP = "─".repeat(60);

function formatIcon(icon: IconData): string {
  return [
    `name:     ${icon.name}`,
    `category: ${icon.category}`,
    `tags:     ${[...icon.tags, ...icon.categoryTags].join(", ")}`,
    `import:   import { ${icon.name} } from "@solar-icons/react-perf/<${STYLES.join("|")}>"`,
  ].join("\n");
}

function printResults(results: IconData[]): void {
  if (results.length === 0) {
    console.log("No icons found.");
    return;
  }
  console.log(`Found ${results.length} icon(s):\n`);
  results.forEach((icon, i) => {
    console.log(formatIcon(icon));
    if (i < results.length - 1) console.log(SEP);
  });
}

function fail(message: string, exitCode = 1): never {
  console.error(`Error: ${message}`);
  process.exit(exitCode);
}

function loadIcons(): IconData[] {
  try {
    const data = readFileSync(dataPath, "utf-8");
    return JSON.parse(data);
  } catch {
    fail("Could not read data/icons.json — make sure the file exists.");
  }
}

// ── Search logic ──────────────────────────────────────────────────────────────

/**
 * Global text search across name, category, and all tags.
 * Ranked: name match (3pts) > category match (2pts) > tag match (1pt).
 */
function globalSearch(icons: IconData[], query: string): IconData[] {
  const q = query.toLowerCase();

  return icons
    .map((icon) => {
      let score = 0;
      if (icon.name.toLowerCase().includes(q)) score += 3;
      if (icon.category.toLowerCase().includes(q)) score += 2;
      const allTags = [...icon.tags, ...icon.categoryTags].map((t) =>
        t.toLowerCase()
      );
      if (allTags.some((t) => t.includes(q))) score += 1;
      return { icon, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ icon }) => icon);
}

function filterIcons(
  icons: IconData[],
  options: { name?: string; tag?: string; category?: string }
): IconData[] {
  return icons.filter((icon) => {
    if (options.name) {
      if (!icon.name.toLowerCase().includes(options.name.toLowerCase()))
        return false;
    }
    if (options.category) {
      if (!icon.category.toLowerCase().includes(options.category.toLowerCase()))
        return false;
    }
    if (options.tag) {
      const q = options.tag.toLowerCase();
      const allTags = [...icon.tags, ...icon.categoryTags].map((t) =>
        t.toLowerCase()
      );
      if (!allTags.some((t) => t.includes(q))) return false;
    }
    return true;
  });
}

// ── CLI ───────────────────────────────────────────────────────────────────────

const program = new Command();

program
  .name("search-solar")
  .description("CLI tool for searching Solar icons.")
  .version("1.0.0");

// ── query (global text search) ────────────────────────────────────────────────
program
  .command("query <text>")
  .description(
    "Global text search across name, category, and all tags.\n" +
      "Results ranked: name match > category match > tag match."
  )
  .option("--limit <n>", "Max results to return (default: 20)", parseInt)
  .action((text: string, options) => {
    if (!text?.trim()) fail("Query text must not be empty.");
    const icons = loadIcons();
    const limit = options.limit ?? 20;
    const results = globalSearch(icons, text).slice(0, limit);
    printResults(results);
  });

// ── search (filtered) ─────────────────────────────────────────────────────────
program
  .command("search")
  .description(
    "Search icons by name, tag, and/or category. All filters are ANDed."
  )
  .option("-n, --name <n>", "Filter by icon name (substring match)")
  .option("-t, --tag <tag>", "Filter by tag or categoryTag (substring match)")
  .option("-c, --category <category>", "Filter by category (substring match)")
  .option("--limit <n>", "Max results to return", parseInt)
  .action((options) => {
    if (!options.name && !options.tag && !options.category) {
      fail("Provide at least one of --name, --tag, or --category.");
    }
    const icons = loadIcons();
    let results = filterIcons(icons, options);
    if (options.limit) results = results.slice(0, options.limit);
    printResults(results);
  });

// ── list ──────────────────────────────────────────────────────────────────────
program
  .command("list")
  .description("List all icons, optionally filtered by category.")
  .option("-c, --category <category>", "Filter by category (substring match)")
  .option("--limit <n>", "Max results to return", parseInt)
  .action((options) => {
    const icons = loadIcons();
    let results = options.category
      ? icons.filter((icon) =>
          icon.category.toLowerCase().includes(options.category.toLowerCase())
        )
      : icons;
    if (options.limit) results = results.slice(0, options.limit);
    printResults(results);
  });

// ── categories ────────────────────────────────────────────────────────────────
program
  .command("categories")
  .description("List all unique categories.")
  .action(() => {
    const icons = loadIcons();
    const categories = [...new Set(icons.map((icon) => icon.category))].sort();
    console.log(`Categories (${categories.length}):\n`);
    categories.forEach((cat) => console.log(`  ${cat}`));
  });

// ── tags ──────────────────────────────────────────────────────────────────────
program
  .command("tags")
  .description("List all unique tags (icon tags + category tags combined).")
  .option("--category <category>", "Limit to tags within a category")
  .action((options) => {
    const icons = loadIcons();
    const source = options.category
      ? icons.filter((i) =>
          i.category.toLowerCase().includes(options.category.toLowerCase())
        )
      : icons;
    const tags = new Set<string>();
    source.forEach((icon) => {
      icon.tags.forEach((t) => tags.add(t));
      icon.categoryTags.forEach((t) => tags.add(t));
    });
    const sorted = [...tags].sort();
    console.log(`Tags (${sorted.length}):\n`);
    sorted.forEach((tag) => console.log(`  ${tag}`));
  });

program.parse();