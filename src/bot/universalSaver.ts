import { Context } from "telegraf";
import { createUser } from "../models/User";
import { extractUrlsFromMessage } from "./linkHandler";
import {
  askCategory,
  handleUniversalTitleText,
  hasPendingTitle,
} from "./categorySaveFlow";
import { getOriginTelegramLinks } from "./universal/originLinks";
import { isDirectForwardFromUser } from "./universal/rules";
import { buildLinkDraft, buildMediaDraft, buildTextDraft } from "./universal/drafts";

export async function saveIncomingUniversal(ctx: Context) {
  const user = ctx.from;
  if (!user) return;

  // If user is currently picking a title for the previous save — treat next text as title.
  if (hasPendingTitle(user.id)) {
    const message: any = (ctx as any).message;
    const text = (message?.text || "").toString();
    if (text && !text.startsWith("/")) {
      const handled = await handleUniversalTitleText(ctx);
      if (handled) return;
    }

    await ctx.reply(
      "Сначала отправьте название (текстом) или нажмите «Пропустить название»."
    );
    return;
  }

  // Ensure user exists (we keep this for compatibility with existing DB layout)
  await createUser(user.id, user.username, user.first_name);

  const message: any = (ctx as any).message;
  if (!message) return;

  // Запрещаем сохранение контента, который пришёл из личных диалогов между людьми (forward_from — пользователь).
  // Разрешаем только пересылки из каналов/групп (forward_from_chat) или сообщения из каналов/групп, где есть chatId/messageId.
  if (isDirectForwardFromUser(message)) {
    await ctx.reply(
      "Материалы из личных диалогов (директ) я не сохраняю.\n\n" +
        "Перешлите пост из канала/группы или отправьте ссылку на пост из канала/группы (t.me/.../ID)."
    );
    return;
  }

  const chatId: number = (ctx.chat as any)?.id;
  const messageId: number = message?.message_id;
  if (typeof chatId !== "number" || typeof messageId !== "number") return;

  const now = Date.now();
  const originLinks = getOriginTelegramLinks(ctx as any, message);
  const base = { chatId, messageId, createdAt: now };

  // Media (priority over text)
  const mediaDraft = buildMediaDraft(message, base, originLinks);
  if (mediaDraft) {
    await askCategory(ctx, user.id, mediaDraft);
    return;
  }

  // Text / Links
  const text: string = message?.text || message?.caption || "";
  const urls = extractUrlsFromMessage(message);
  if (urls.length > 0) {
    const linkDraft = buildLinkDraft(urls[0], base, originLinks);
    await askCategory(ctx, user.id, linkDraft);
    return;
  }

  await askCategory(ctx, user.id, buildTextDraft(text, base, originLinks));
}
