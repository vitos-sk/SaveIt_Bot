import { InlineKeyboardMarkup } from "telegraf/types";
import { SavedCategory } from "../../models/SavedItem";
import { CATEGORY_ENGLISH, CATEGORY_LABELS } from "./constants";

export function categoryKeyboard(id: string): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: CATEGORY_LABELS.all, callback_data: `ucat_all_${id}` }],
      [
        { text: CATEGORY_LABELS.idea, callback_data: `ucat_idea_${id}` },
        { text: CATEGORY_LABELS.task, callback_data: `ucat_task_${id}` },
      ],
      [
        { text: CATEGORY_LABELS.knowledge, callback_data: `ucat_knowledge_${id}` },
        { text: CATEGORY_LABELS.note, callback_data: `ucat_note_${id}` },
      ],
      [
        { text: CATEGORY_LABELS.bookmark, callback_data: `ucat_bookmark_${id}` },
        { text: CATEGORY_LABELS.quote, callback_data: `ucat_quote_${id}` },
      ],
      [
        { text: CATEGORY_LABELS.study, callback_data: `ucat_study_${id}` },
        { text: CATEGORY_LABELS.fun, callback_data: `ucat_fun_${id}` },
      ],
    ],
  };
}

export function titleKeyboard(titleId: string): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        {
          text: "⏭️ Пропустить название",
          callback_data: `utskip_${titleId}`,
        },
      ],
    ],
  };
}

export function titlePromptText(category: SavedCategory): string {
  const cat = CATEGORY_ENGLISH[category];
  return `Категория: ${cat}\n\nВведите название (текстом) или нажмите «Пропустить название».`;
}

