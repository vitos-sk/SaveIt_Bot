import { Context } from "telegraf";
import { createUser } from "../../models/User";

export async function handleStart(ctx: Context) {
  const user = ctx.from;
  if (!user) return;

  await createUser(user.id, user.username, user.first_name);

  await ctx.reply(
    `Привет, ${user.first_name}! 👋\n\n` +
      `Я бот для сохранения полезных материалов 📌\n\n` +
      `Чтобы добавить материал, отправь мне ССЫЛКУ 🔗\n` +
      `на пост, видео, музыку или любой другой контент.\n\n` +
      `Важно:\n` +
      `⚠️ Ссылка должна быть на публичный пост или канал.\n` +
      `⚠️ Ссылки из личных диалогов (директа) не сохраняются.\n\n` +
      `Как получить ссылку в Telegram:\n` +
      `👉 Нажми «Поделиться» или «⋯» у поста\n` +
      `👉 Выбери «Копировать ссылку»\n` +
      `👉 Отправь её мне\n\n` +
      `После этого я сохраню материал в приложении 📂`
  );
}
