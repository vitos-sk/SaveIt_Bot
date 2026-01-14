import db from "../db/connection";

export type SavedItemType =
  | "text"
  | "photo"
  | "video"
  | "voice"
  | "document"
  | "sticker"
  | "link";
export type SavedMediaType = "photo" | "video" | "voice" | "document" | "sticker";
export type SavedCategory =
  | "all"
  | "idea"
  | "task"
  | "knowledge"
  | "note"
  | "bookmark"
  | "quote"
  | "study"
  | "fun";

export interface SavedItemBase {
  id?: string;
  type: SavedItemType;
  category: SavedCategory;
  chatId: number;
  messageId: number;
  createdAt: number;
  updatedAt: number;
  // Mini App-safe: should be opened via Telegram.WebApp.openTelegramLink(openTelegramUrl)
  openTelegramUrl?: string;
  // Optional fallback deep link (often blocked by WebView, but can be useful elsewhere)
  deepUrl?: string;
  // Optional external URL or legacy field (kept for backward-compat)
  url?: string;
  // Optional universal title (Mini App-friendly)
  title?: string;
}

export interface SavedTextItem extends SavedItemBase {
  type: "text";
  title: string;
  content: string;
}

export interface SavedLinkItem extends SavedItemBase {
  type: "link";
  url: string;
}

export interface SavedMediaItem extends SavedItemBase {
  type: SavedMediaType;
  mediaType: SavedMediaType;
  mediaFileId: string;
  // Document-only
  fileName?: string;
  mimeType?: string;
  // Sticker-only
  emoji?: string;
}

export type SavedItem = SavedTextItem | SavedLinkItem | SavedMediaItem;

export async function createSavedItem(
  telegramUserId: number,
  item: Omit<SavedItem, "id">
) {
  const ref = db.ref(`savedItems/${telegramUserId}`).push();

  // Firebase doesn't like undefined
  const clean: any = { ...item };
  Object.keys(clean).forEach((k) => clean[k] === undefined && delete clean[k]);

  await ref.set(clean);
  const snapshot = await ref.once("value");
  return { id: ref.key!, ...snapshot.val() } as SavedItem;
}

export async function getSavedItems(telegramUserId: number): Promise<SavedItem[]> {
  const snapshot = await db.ref(`savedItems/${telegramUserId}`).once("value");
  const items = snapshot.val();
  if (!items) return [];

  const result: SavedItem[] = [];
  for (const [id, data] of Object.entries(items)) {
    result.push({ id, ...(data as any) } as SavedItem);
  }

  return result.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}
