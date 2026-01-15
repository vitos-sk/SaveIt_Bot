import fs from "node:fs";
import path from "node:path";
import { Context } from "telegraf";
import { createUser, markUserWelcomed } from "../../models/User";

function getStartImageSource(): { source: NodeJS.ReadableStream } | null {
  // Put your image here (and commit it): assets/start.jpg (or start.png / start.jpeg)
  // On Railway it will exist because the repo is copied into /app.
  const candidates = ["assets/start.jpg", "assets/start.jpeg", "assets/start.png"].map(
    (p) => path.resolve(process.cwd(), p)
  );
  const filePath = candidates.find((p) => fs.existsSync(p));
  if (!filePath) return null;
  return { source: fs.createReadStream(filePath) };
}

export async function sendWelcomePhotoOnly(ctx: Context) {
  const user = ctx.from;
  if (!user) return;

  const savedUser = await createUser(user.id, user.username, user.first_name);
  const photo = getStartImageSource();
  if (photo) {
    await ctx.replyWithPhoto(photo);
  }
  if (savedUser.id && !savedUser.welcome_sent_at) await markUserWelcomed(savedUser.id);
}

export async function handleStart(ctx: Context) {
  const user = ctx.from;
  if (!user) return;

  await createUser(user.id, user.username, user.first_name);

  // /start: send ONLY text (as requested)
  await ctx.reply(
    `Привет, ${user.first_name}!\n` +
      `Отправь мне ссылку на пост, видео или музыку — и я сохраню это прямо в твоей категории.`
  );
}
