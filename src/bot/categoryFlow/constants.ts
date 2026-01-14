import { SavedCategory } from "../../models/SavedItem";

export const CATEGORY_LABELS: Record<SavedCategory, string> = {
  all: "📋 Все",
  idea: "💡 Идеи",
  task: "✅ Задачи",
  knowledge: "📚 База",
  note: "📝 Заметки",
  bookmark: "🔖 Закладки",
  quote: "💭 Вдохновение",
  study: "📖 Учеба",
  fun: "🎮 Фан",
};

export const CATEGORY_ENGLISH: Record<SavedCategory, string> = {
  all: "all",
  idea: "idea",
  task: "task",
  knowledge: "knowledge",
  note: "note",
  bookmark: "bookmark",
  quote: "quote",
  study: "study",
  fun: "fun",
};

export function defaultTitleFor(category: SavedCategory, itemDraft: any): string {
  const existing = (itemDraft?.title || "").toString().trim();
  if (existing) return existing;
  return CATEGORY_ENGLISH[category];
}

