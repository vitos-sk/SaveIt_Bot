import { Context } from "telegraf";

// Legacy compatibility layer:
// Older versions had a separate "link save" flow with cat_/skip_ callbacks.
// The new bot uses universal flow (ucat_/utskip_), but index.ts still routes legacy callbacks.

export function cancelWaitingTitle(_userId: number) {
  // no-op (legacy)
}

export async function handleCategorySelection(ctx: any) {
  await ctx.answerCbQuery("Эта кнопка больше не используется.");
}

export async function handleSkipTitle(_ctx: Context) {
  // no-op (legacy)
}

export async function handleSkipTitleCallback(ctx: any) {
  await ctx.answerCbQuery("Эта кнопка больше не используется.");
}

