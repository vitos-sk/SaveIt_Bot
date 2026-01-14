import { Context } from "telegraf";
import { ItemDraft, createPendingItem, hasPendingTitle } from "./categoryFlow/state";
import { categoryKeyboard } from "./categoryFlow/ui";
export { hasPendingTitle };
export {
  handleUniversalCategorySelection,
  handleUniversalSkipTitleCallback,
  handleUniversalSkipTitleCommand,
  handleUniversalTitleText,
} from "./categoryFlow/handlers";

export async function askCategory(ctx: Context, userId: number, itemDraft: ItemDraft) {
  const id = createPendingItem(userId, itemDraft);
  await ctx.reply("Выберите категорию:", { reply_markup: categoryKeyboard(id) });
}
