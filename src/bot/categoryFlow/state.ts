import { SavedCategory, SavedItem } from "../../models/SavedItem";

export type ItemDraft = Omit<SavedItem, "id" | "category" | "title" | "updatedAt">;

interface PendingItem {
  userId: number;
  itemDraft: ItemDraft;
  timestamp: number;
}

interface PendingTitle {
  userId: number;
  category: SavedCategory;
  itemDraft: ItemDraft;
  timestamp: number;
}

const pendingItems: Map<string, PendingItem> = new Map();
const pendingTitles: Map<string, PendingTitle> = new Map();

function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return (timestamp + random).slice(0, 20);
}

export function cleanupOld() {
  const oneHourAgo = Date.now() - 3600000;
  for (const [id, p] of pendingItems.entries()) {
    if (p.timestamp < oneHourAgo) pendingItems.delete(id);
  }
  for (const [id, p] of pendingTitles.entries()) {
    if (p.timestamp < oneHourAgo) pendingTitles.delete(id);
  }
}

export function createPendingItem(userId: number, itemDraft: ItemDraft): string {
  cleanupOld();
  const id = generateId();
  pendingItems.set(id, { userId, itemDraft, timestamp: Date.now() });
  return id;
}

export function popPendingItem(id: string): PendingItem | null {
  const p = pendingItems.get(id) || null;
  if (p) pendingItems.delete(id);
  return p;
}

export function createPendingTitle(
  userId: number,
  category: SavedCategory,
  itemDraft: ItemDraft
): string {
  cleanupOld();
  const id = generateId();
  pendingTitles.set(id, { userId, category, itemDraft, timestamp: Date.now() });
  return id;
}

export function popPendingTitleById(id: string): PendingTitle | null {
  const p = pendingTitles.get(id) || null;
  if (p) pendingTitles.delete(id);
  return p;
}

export function popPendingTitleForUser(userId: number): PendingTitle | null {
  cleanupOld();
  for (const [id, p] of pendingTitles.entries()) {
    if (p.userId === userId) {
      pendingTitles.delete(id);
      return p;
    }
  }
  return null;
}

export function hasPendingTitle(userId: number): boolean {
  cleanupOld();
  for (const p of pendingTitles.values()) {
    if (p.userId === userId) return true;
  }
  return false;
}

