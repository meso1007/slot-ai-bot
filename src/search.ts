export function normalizeText(input: string): string {
  return input
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[ぁ-ん]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 0x60))
    .replace(/[のノ]/g, '')
    .replace(/[\s　・:：\-‐_/／（）()「」【】]/g, '')
    .replace(/^(l|スマスロ|パチスロ|スロット)+/, '');
}

export function matchIds(
  query: string,
  entries: { id: string; name: string; aliases?: string[] }[],
): string[] {
  const q = normalizeText(query);
  if (q.length < 2) return [];
  const hits: { id: string; score: number }[] = [];
  for (const { id, name, aliases } of entries) {
    const candidates = [name, ...(aliases ?? [])].map(normalizeText);
    let score = 0;
    for (const n of candidates) {
      if (n && n.includes(q)) score = Math.max(score, q.length / Math.max(1, n.length));
    }
    if (score > 0) hits.push({ id, score });
  }
  return hits.sort((a, b) => b.score - a.score).map((h) => h.id);
}
