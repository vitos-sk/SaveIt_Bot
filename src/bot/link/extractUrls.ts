import { isValidUrl } from "../../utils/urlValidator";

function normalizeUrl(text: string): string | null {
  if (!text || typeof text !== "string") return null;
  let trimmed = text.trim();
  if (!trimmed) return null;

  // remove trailing punctuation
  trimmed = trimmed.replace(/[.,;:!?)\]}]+$/, "");

  if (isValidUrl(trimmed)) return trimmed;

  // allow t.me without protocol
  if (/^(t\.me|telegram\.me)\//i.test(trimmed)) {
    const withProtocol = `https://${trimmed}`;
    if (isValidUrl(withProtocol)) return withProtocol;
  }

  // allow www / domain without protocol
  if (trimmed.includes(".") && !trimmed.includes("://")) {
    const cleaned = trimmed.replace(/^(www\.)/i, "");
    const withProtocol = `https://${cleaned}`;
    if (isValidUrl(withProtocol)) return withProtocol;
  }

  return null;
}

export function extractUrlsFromMessage(message: any): string[] {
  const urls: string[] = [];
  const text = message?.text || message?.caption || "";

  const entities = message?.entities || message?.caption_entities || [];
  for (const entity of entities) {
    if (entity.type === "url" && typeof entity.offset === "number" && typeof entity.length === "number") {
      const u = text.substring(entity.offset, entity.offset + entity.length);
      urls.push(u);
    } else if (entity.type === "text_link" && entity.url) {
      urls.push(entity.url);
    }
  }

  // fallback regex
  const matches = String(text).match(/(?:https?:\/\/|t\.me\/|telegram\.me\/|www\.)[^\s<>"']+/gi);
  if (matches) urls.push(...matches);

  const normalized: string[] = [];
  for (const u of urls) {
    const n = normalizeUrl(u);
    if (n && !normalized.includes(n)) normalized.push(n);
  }
  return normalized;
}

