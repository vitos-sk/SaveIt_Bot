import { Context } from "telegraf";
import { createUser, getUserByTelegramId } from "../../models/User";
import { createLink, ContentType } from "../../models/Link";
import { isValidUrl } from "../../utils/urlValidator";
import { ensureTelegramDeepLink } from "../../utils/telegramLinks";

export async function handleSave(ctx: Context, contentType?: ContentType) {
  const user = ctx.from;
  if (!user) return;

  // /save оставляем как раньше: можно вызывать и в личке, и в группах.
  const chatType = (ctx.chat as any)?.type;

  // Убеждаемся, что пользователь существует в БД
  let dbUser = await getUserByTelegramId(user.id);
  if (!dbUser) {
    dbUser = await createUser(user.id, user.username, user.first_name);
  }

  const text = (ctx.message as any)?.text || "";
  const parts = text.split(" ").slice(1);

  if (parts.length === 0) {
    await ctx.reply(
      "Пожалуйста, укажите ссылку после команды.\nПример: /save https://youtube.com/watch?v=..."
    );
    return;
  }

  const url = parts.join(" ").trim();

  if (!isValidUrl(url)) {
    await ctx.reply(
      "❌ Неверный формат ссылки. Пожалуйста, укажите полную ссылку (начинающуюся с http:// или https://)"
    );
    return;
  }

  // Если это Telegram web-link (t.me/...), сохраняем как tg://... чтобы открывалось сразу в Telegram
  const finalUrl = ensureTelegramDeepLink(url);

  // Если категория не указана, используем "all" по умолчанию
  const detectedType = contentType || "all";

  try {
    if (!dbUser.id) {
      throw new Error("User ID is missing");
    }
    await createLink(dbUser.id, finalUrl, detectedType);
    await ctx.reply(`Ссылка сохранена.\nURL: ${finalUrl}`);
  } catch (error) {
    console.error("Error saving link:", error);
    await ctx.reply("❌ Произошла ошибка при сохранении ссылки. Попробуйте позже.");
  }
}
