import fs from "node:fs";
import path from "node:path";
import { Context } from "telegraf";
import { createUser } from "../../models/User";

function getStartImageSource(): { source: NodeJS.ReadableStream } | null {
  // Put your image here (and commit it): assets/start.png or assets/start.jpg
  // On Railway it will exist because the repo is copied into /app.
  const candidates = ["assets/start.png", "assets/start.jpg"].map((p) =>
    path.resolve(process.cwd(), p)
  );
  const filePath = candidates.find((p) => fs.existsSync(p));
  if (!filePath) return null;
  return { source: fs.createReadStream(filePath) };
}

export async function handleStart(ctx: Context) {
  const user = ctx.from;
  if (!user) return;

  await createUser(user.id, user.username, user.first_name);

  const caption = `Привет, ${user.first_name}!  
Отправь мне ссылку на пост, видео или музыку — и я сохраню это прямо в твоей категории.`;

  const photo = getStartImageSource();
  if (photo) {
    await ctx.replyWithPhoto(photo, { caption });
    return;
  }

  await ctx.reply(caption);
}
