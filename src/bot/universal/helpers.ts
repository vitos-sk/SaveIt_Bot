export function firstN(text: string, n: number): string {
  const t = (text || "").trim();
  if (t.length <= n) return t;
  return t.slice(0, n);
}
