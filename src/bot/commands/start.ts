import { Context } from "telegraf";
import { createUser } from "../../models/User";

export async function handleStart(ctx: Context) {
  const user = ctx.from;
  if (!user) return;

  await createUser(user.id, user.username, user.first_name);

  await ctx.reply(
    `Привет, ${user.first_name}!  
Твой персональный архив материалов в Telegram.  
Шаг 1: пришли ссылку. Шаг 2: выбери категорию. Всё готово!`
  );
}
