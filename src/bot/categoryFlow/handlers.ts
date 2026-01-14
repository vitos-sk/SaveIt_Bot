import { Context } from "telegraf";
import { createSavedItem, SavedCategory, SavedItem } from "../../models/SavedItem";
import { CATEGORY_ENGLISH, defaultTitleFor } from "./constants";
import { titleKeyboard, titlePromptText } from "./ui";
import { createPendingTitle, popPendingItem, popPendingTitleById, popPendingTitleForUser } from "./state";

export async function handleUniversalCategorySelection(ctx: any) {
  const user = ctx.from;
  if (!user) return;

  const callbackData = ctx.callbackQuery?.data as string;
  const match = callbackData?.match(/^ucat_(\w+)_(.+)$/);
  if (!match) {
    await ctx.answerCbQuery("❌ Ошибка обработки");
    return;
  }

  const category = match[1] as SavedCategory;
  const pendingId = match[2];
  const pending = popPendingItem(pendingId);

  if (!pending || pending.userId !== user.id) {
    await ctx.answerCbQuery("❌ Черновик не найден или истёк");
    return;
  }

  const titleId = createPendingTitle(user.id, category, pending.itemDraft);

  await ctx.answerCbQuery(`✅ ${CATEGORY_ENGLISH[category]}`);
  const text = titlePromptText(category);
  const keyboard = titleKeyboard(titleId);
  try {
    await ctx.editMessageText(text, { reply_markup: keyboard });
  } catch {
    await ctx.reply(text, { reply_markup: keyboard });
  }
}

export async function handleUniversalTitleText(ctx: Context): Promise<boolean> {
  const user = ctx.from;
  if (!user) return false;

  const pending = popPendingTitleForUser(user.id);
  if (!pending) return false;

  const message: any = (ctx as any).message;
  const text = (message?.text || "").toString();
  if (!text.trim()) {
    // Put back? For simplicity, tell user and ask again (they can re-send category if needed).
    await ctx.reply("Название не может быть пустым. Отправьте текстом или нажмите «Пропустить».");
    return true;
  }

  const now = Date.now();
  const itemToSave: Omit<SavedItem, "id"> = {
    ...(pending.itemDraft as any),
    category: pending.category,
    title: text.trim(),
    updatedAt: now,
  };

  await createSavedItem(user.id, itemToSave);
  await ctx.reply("Готово: материал сохранён.");
  return true;
}

export async function handleUniversalSkipTitleCallback(ctx: any): Promise<boolean> {
  const user = ctx.from;
  if (!user) return false;

  const callbackData = ctx.callbackQuery?.data as string;
  const match = callbackData?.match(/^utskip_(.+)$/);
  if (!match) return false;

  const pending = popPendingTitleById(match[1]);
  if (!pending || pending.userId !== user.id) {
    await ctx.answerCbQuery("❌ Черновик не найден или истёк");
    return true;
  }

  const now = Date.now();
  const title = defaultTitleFor(pending.category, pending.itemDraft);
  const itemToSave: Omit<SavedItem, "id"> = {
    ...(pending.itemDraft as any),
    category: pending.category,
    title,
    updatedAt: now,
  };

  await createSavedItem(user.id, itemToSave);
  await ctx.answerCbQuery("⏭️ Пропущено");
  try {
    await ctx.editMessageText("Готово: сохранено без названия (использовано авто-имя).");
  } catch {
    await ctx.reply("Готово: сохранено без названия (использовано авто-имя).");
  }
  return true;
}

export async function handleUniversalSkipTitleCommand(ctx: Context): Promise<boolean> {
  const user = ctx.from;
  if (!user) return false;

  const pending = popPendingTitleForUser(user.id);
  if (!pending) return false;

  const now = Date.now();
  const title = defaultTitleFor(pending.category, pending.itemDraft);
  const itemToSave: Omit<SavedItem, "id"> = {
    ...(pending.itemDraft as any),
    category: pending.category,
    title,
    updatedAt: now,
  };

  await createSavedItem(user.id, itemToSave);
  await ctx.reply("Готово: сохранено без названия (использовано авто-имя).");
  return true;
}

