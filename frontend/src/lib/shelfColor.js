const SHELF_COLORS = [
  "var(--shelf-1)",
  "var(--shelf-2)",
  "var(--shelf-3)",
  "var(--shelf-4)",
  "var(--shelf-5)",
];

export function shelfColor(id = "") {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return SHELF_COLORS[hash % SHELF_COLORS.length];
}
