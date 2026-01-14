import { Context } from "telegraf";
import { getUserByTelegramId } from "../../models/User";
import { getUserLinks, ContentType } from "../../models/Link";

export async function handleList(ctx: Context, contentType?: ContentType) {
  const user = ctx.from;
  if (!user) return;

  const dbUser = await getUserByTelegramId(user.id);
  if (!dbUser) {
    await ctx.reply("Вы еще не зарегистрированы. Используйте /start для начала работы.");
    return;
  }

  if (!dbUser.id) {
    await ctx.reply("Ошибка: не найден ID пользователя.");
    return;
  }

  const links = await getUserLinks(dbUser.id, contentType);
  if (links.length === 0) {
    await ctx.reply("Нет данных.");
    return;
  }

  let message = `Ссылки:\n\n`;
  links.forEach((link, index) => {
    message += `${index + 1}. ${link.url}\n`;
  });

  if (message.length > 4000) {
    await ctx.reply(message.slice(0, 3900) + "\n…");
    return;
  }

  await ctx.reply(message);
}
