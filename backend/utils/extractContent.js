const fs = require("fs");
const mammoth = require("mammoth");
const pdfParse = require("pdf-parse");

const NUMBER_WORDS =
  "one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty";
const NUMBER_WORD_VALUES = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
  nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
  fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
};

function keySortValue(key) {
  const dashIndex = key.indexOf("-");
  const kind = key.slice(0, dashIndex);
  const val = key.slice(dashIndex + 1);
  const group = kind === "appendix" ? 1 : 0;
  let num = Number(val);
  if (Number.isNaN(num)) {
    num = NUMBER_WORD_VALUES[val];
    if (num === undefined) {
      num = val.length === 1 ? val.charCodeAt(0) - "a".charCodeAt(0) + 1 : 999;
    }
  }
  return { group, num };
}
const HEADING_START = `(?:chapter|part)\\s+(?:\\d+|${NUMBER_WORDS})|appendix\\s+[a-z0-9]+`;

const HEADING_REGEX = new RegExp(`^[ \\t]*(${HEADING_START})\\b.{0,100}`, "gim");

function looksLikeTocLine(line) {
  return /\.{3,}\s*\d+\s*$/.test(line) || /\.{2,}/.test(line);
}

function normalizeKey(headingText) {
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

function splitIntoChapters(rawText) {
  const allMatches = [...rawText.matchAll(HEADING_REGEX)].map((m) => ({
    index: m.index,
    text: m[0].trim(),
  }));

  if (allMatches.length === 0) {
    return [{ title: "Full Text", content: rawText.trim() }];
  }

  const withKeys = allMatches.map((m) => ({ ...m, key: normalizeKey(m.text) }));

  const titleMap = new Map();
  for (const m of withKeys) {
    const candidate = extractLineTitle(rawText, m.index);
    const current = titleMap.get(m.key) || "";
    if (candidate.length > current.length) titleMap.set(m.key, candidate);
  }

  const candidates = withKeys.filter((m) => !looksLikeTocLine(m.text));
  if (candidates.length === 0) {
    return [{ title: "Full Text", content: rawText.trim() }];
  }

  for (let i = 0; i < candidates.length; i++) {
    let j = i + 1;
    while (j < candidates.length && candidates[j].key === candidates[i].key) j++;
    candidates[i].span =
      (j < candidates.length ? candidates[j].index : rawText.length) - candidates[i].index;
  }

  const byKey = new Map();
  for (const m of candidates) {
    if (!byKey.has(m.key)) byKey.set(m.key, []);
    byKey.get(m.key).push(m);
  }

  const MIN_SPAN = 250;
  const canonical = [];
  for (const [, occurrences] of byKey) {
    const best = occurrences.reduce((a, b) => (b.span > a.span ? b : a));

    if (occurrences.length === 1 || best.span >= MIN_SPAN) canonical.push(best);
  }
  if (canonical.length === 0) {
    return [{ title: "Full Text", content: rawText.trim() }];
  }


  canonical.sort((a, b) => a.index - b.index);
  const withContent = canonical.map((m, i) => {
    const end = i + 1 < canonical.length ? canonical[i + 1].index : rawText.length;
    const descriptiveTitle = titleMap.get(m.key);
    const title = descriptiveTitle
      ? `${formatKeyLabel(m.key)}: ${descriptiveTitle}`
      : formatKeyLabel(m.key);
    return { key: m.key, title, content: rawText.slice(m.index, end).trim() };
  });

  withContent.sort((a, b) => {
    const av = keySortValue(a.key);
    const bv = keySortValue(b.key);
    if (av.group !== bv.group) return av.group - bv.group;
    return av.num - bv.num;
  });

  return withContent.map(({ title, content }) => ({ title, content }));
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
