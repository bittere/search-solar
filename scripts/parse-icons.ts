#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";

/**
 * Strips the `Icon` property from a JS object array in a text file.
 *
 * The file contains JS object literals (not valid JSON), e.g.:
 *   {name:"chat-round-money", ..., Icon:ZQ.ChatRoundMoney}
 *
 * Usage:
 *   node dist/parse-icons.js <input.txt>
 */

const inputPath = process.argv[2];
const outputPath = "data/icons.json";

if (!inputPath) {
  console.error("Usage: node dist/parse-icons.js <input.txt>");
  process.exit(1);
}

// ── Read input ────────────────────────────────────────────────────────────────
const raw = readFileSync(inputPath, "utf-8");

// ── Step 1: strip the Icon property ──────────────────────────────────────────
const withoutIcon = raw.replace(
  /,?\s*Icon\s*:\s*[A-Za-z_$][A-Za-z0-9_$]*(?:\.[A-Za-z_$][A-Za-z0-9_$]*)*/g,
  ""
);

// ── Step 2: JS object literal → valid JSON ────────────────────────────────────
const quotedKeys = withoutIcon.replace(
  /([{,]\s*)([A-Za-z_$][A-Za-z0-9_$]*)(\s*:)/g,
  '$1"$2"$3'
);

const doubleQuoted = quotedKeys.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"');

const cleaned = doubleQuoted.replace(/,(\s*[}\]])/g, "$1");

// ── Step 3: parse ─────────────────────────────────────────────────────────────
let parsed: unknown[];

try {
  const json = JSON.parse(cleaned);
  parsed = Array.isArray(json) ? json : [json];
} catch (err) {
  throw new Error(`JSON parse failed: ${(err as Error).message}`);
}

// ── Step 4: write output ──────────────────────────────────────────────────────
const result = JSON.stringify(parsed);

writeFileSync(outputPath, result);
console.log(`✓ Written ${parsed.length} objects to ${outputPath}`);