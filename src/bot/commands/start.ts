import fs from "node:fs";
import path from "node:path";
import { Context } from "telegraf";
import { createUser } from "../../models/User";

function getStartImageSource(): { source: NodeJS.ReadableStream } | null {
  // Put your image here (and commit it): assets/start.jpg
  // On Railway it will exist because the repo is copied into /app.
  const filePath = path.resolve(process.cwd(), "assets/start.jpg");
  if (!fs.existsSync(filePath)) return null;
  return { source: fs.createReadStream(filePath) };
}

export async function handleStart(ctx: Context) {
  const user = ctx.from;
  if (!user) return;

  await createUser(user.id, user.username, user.first_name);

  const caption =
    `Привет, ${user.first_name}!\n\n` +
    `Я бот для сохранения материалов по категориям.\n\n` +
    `📌 Как использовать:\n` +
    `1) Отправьте мне ССЫЛКУ на пост/музыку/видео (в Telegram: «Копировать ссылку»)\n` +
    `   - Важно: я сохраняю материал по ссылке на конкретный пост\n` +
    `   - Материалы из директа (личных диалогов между людьми) не сохраняются\n` +
    `2) Выберите категорию\n` +
    `3) Добавьте название (или пропустите)\n\n` +
    `Команды:\n` +
    `/help — справка\n` +
    `/links — мои материалы`;

  const photo = getStartImageSource();
  if (photo) {
    await ctx.replyWithPhoto(photo, { caption });
    return;
  }

  await ctx.reply(caption);
}
