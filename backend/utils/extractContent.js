const fs = require("fs");
const mammoth = require("mammoth");
const pdfParse = require("pdf-parse");

// Matches heading-style lines: "Chapter 1", "CHAPTER ONE", "Appendix A",
// "Part 2". Word-numbers are limited to an explicit list so we don't
// accidentally match ordinary prose like "the chapter is about...".
const NUMBER_WORDS =
  "one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty";
const HEADING_START = `(?:chapter|part)\\s+(?:\\d+|${NUMBER_WORDS})|appendix\\s+[a-z0-9]+`;
// Heading text is capped to 100 chars after the keyword — real headings
// are short lines; capping prevents a runaway match from swallowing a
// whole paragraph if a body line happens to start with "Chapter"/"Appendix"
// with no line break nearby (JS "." already stops at newlines, this just
// bounds it further).
const HEADING_REGEX = new RegExp(`^[ \\t]*(${HEADING_START})\\b.{0,100}`, "gim");

// A line from a table of contents / bookmarks list looks like a heading
// (it literally contains "Chapter 4") but is a dot-leader line ending in
// a page number: "Chapter 4 .......... 81". Real chapter headings in the
// body text don't look like this — but TOC lines are exactly where the
// full descriptive chapter name lives, so we don't discard them outright;
// we just don't treat them as candidates for where a chapter *starts*.
function looksLikeTocLine(line) {
  return /\.{3,}\s*\d+\s*$/.test(line) || /\.{2,}/.test(line);
}

function normalizeKey(headingText) {
  // Only look at the first few words — right where the chapter/appendix
  // number lives — so text appearing later in a long captured line can't
  // be mistaken for the heading's actual number.
  const head = headingText.toLowerCase().trim().slice(0, 30);
  const isAppendix = head.startsWith("appendix");
  const numberMatch = head.match(/\d+/);
  if (numberMatch) return (isAppendix ? "appendix-" : "chapter-") + numberMatch[0];
  const wordMatch = head.match(new RegExp(`\\b(${NUMBER_WORDS})\\b`));
  if (wordMatch) return (isAppendix ? "appendix-" : "chapter-") + wordMatch[1];
  const letterMatch = head.match(/appendix\s+([a-z0-9]+)/);
  if (letterMatch) return "appendix-" + letterMatch[1];
  return head;
}

// Turns a key like "chapter-3" into "Chapter 3", or "appendix-a" into
// "Appendix A" — used as a fallback label when no descriptive title text
// could be found anywhere in the document for that section.
function formatKeyLabel(key) {
  const [kind, ...rest] = key.split("-");
  const val = rest.join("-");
  const kindLabel = kind === "appendix" ? "Appendix" : "Chapter";
  const valLabel = /^\d+$/.test(val) ? val : val.charAt(0).toUpperCase() + val.slice(1);
  return `${kindLabel} ${valLabel}`;
}

function collapseWhitespace(text) {
  return text.replace(/\s+/g, " ").trim();
}

// Given a match's start position, pulls the rest of that source line and
// strips away the leading "Chapter N" / "Appendix X" label, any leading
// punctuation, and a trailing page number (with or without dot leaders)
// — leaving just the descriptive title text, e.g. "Presentation of Data".
// Returns "" if nothing meaningful remains.
function extractLineTitle(rawText, matchIndex) {
  const lineEnd = rawText.indexOf("\n", matchIndex);
  const line = lineEnd === -1 ? rawText.slice(matchIndex) : rawText.slice(matchIndex, lineEnd);
  let rest = line.replace(new RegExp(`^\\s*(?:${HEADING_START})\\b`, "i"), "");
  rest = rest.replace(/^[\s:.\-–—]+/, "");
  rest = rest.replace(/[\s.]*\.{2,}[\s.]*\d+\s*$/, ""); // "..... 19" dot-leader + page number
  rest = rest.replace(/\s+\d{1,4}\s*$/, ""); // a plain trailing page number, no dots
  rest = collapseWhitespace(rest);
  return rest.length >= 3 ? rest : "";
}

// Splits extracted plain text into chapters. Source files often contain a
// table of contents and/or a duplicated bookmarks list ahead of the real
// content, all repeating the same "Chapter N" text — and the real body
// heading is frequently just a bare "CHAPTER 3" with no descriptive title
// on the same line (the title is set as a separate design element). So:
//   1. Find every heading-shaped line in the whole document.
//   2. Build a title map: for each chapter/appendix number, remember the
//      longest descriptive title found anywhere for it (this is normally
//      the table-of-contents line, since bare body headings yield "").
//   3. For picking where each chapter's content actually starts, ignore
//      obvious TOC dot-leader lines, then for each number keep only the
//      occurrence followed by the most content before a *different*
//      chapter number appears — a real heading is followed by pages of
//      body text, a stray repeat is followed almost immediately by the
//      next listing entry.
//   4. Rebuild chapters from those content-start positions, using the
//      title map (falling back to "Chapter N") for the display title.
function splitIntoChapters(rawText) {
  const allMatches = [...rawText.matchAll(HEADING_REGEX)].map((m) => ({
    index: m.index,
    text: m[0].trim(),
  }));

  if (allMatches.length === 0) {
    return [{ title: "Full Text", content: rawText.trim() }];
  }

  const withKeys = allMatches.map((m) => ({ ...m, key: normalizeKey(m.text) }));

  // Title map: longest descriptive title found anywhere for each key.
  const titleMap = new Map();
  for (const m of withKeys) {
    const candidate = extractLineTitle(rawText, m.index);
    const current = titleMap.get(m.key) || "";
    if (candidate.length > current.length) titleMap.set(m.key, candidate);
  }

  // Candidates for where content actually starts: drop TOC-style lines.
  const candidates = withKeys.filter((m) => !looksLikeTocLine(m.text));
  if (candidates.length === 0) {
    return [{ title: "Full Text", content: rawText.trim() }];
  }

  // For each candidate, measure the distance to the next candidate with a
  // *different* key (same-key repeats — e.g. a running header on every
  // page of the same chapter — don't count against it).
  for (let i = 0; i < candidates.length; i++) {
    let j = i + 1;
    while (j < candidates.length && candidates[j].key === candidates[i].key) j++;
    candidates[i].span =
      (j < candidates.length ? candidates[j].index : rawText.length) - candidates[i].index;
  }

  // Group by key, keeping every occurrence's best span.
  const byKey = new Map();
  for (const m of candidates) {
    if (!byKey.has(m.key)) byKey.set(m.key, []);
    byKey.get(m.key).push(m);
  }

  const MIN_SPAN = 250; // a real chapter has well over this much content
  const canonical = [];
  for (const [, occurrences] of byKey) {
    const best = occurrences.reduce((a, b) => (b.span > a.span ? b : a));
    // Only enforce the minimum-content threshold when there were multiple
    // competing occurrences to choose between. A key with just one
    // occurrence has nothing to be a false positive *against* — keeping
    // it is what stops short sections (like a brief appendix) from being
    // dropped entirely.
    if (occurrences.length === 1 || best.span >= MIN_SPAN) canonical.push(best);
  }
  canonical.sort((a, b) => a.index - b.index);

  if (canonical.length === 0) {
    return [{ title: "Full Text", content: rawText.trim() }];
  }

  return canonical.map((m, i) => {
    const end = i + 1 < canonical.length ? canonical[i + 1].index : rawText.length;
    const descriptiveTitle = titleMap.get(m.key);
    const title = descriptiveTitle
      ? `${formatKeyLabel(m.key)}: ${descriptiveTitle}`
      : formatKeyLabel(m.key);
    return { title, content: rawText.slice(m.index, end).trim() };
  });
}

async function extractFromFile(filePath, mimetype) {
  let rawText = "";

  if (mimetype === "application/pdf") {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    rawText = data.text;
  } else if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimetype === "application/msword"
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    rawText = result.value;
  } else {
    throw new Error("Unsupported file type. Upload a .docx or .pdf file.");
  }

  if (!rawText || !rawText.trim()) {
    throw new Error(
      "No extractable text found. The file may be a scanned image without OCR text."
    );
  }

  return splitIntoChapters(rawText);
}

module.exports = { extractFromFile };