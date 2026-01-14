import { Context } from "telegraf";
import { getSavedItems } from "../../models/SavedItem";

export async function handleLinks(ctx: Context) {
  const user = ctx.from;
  if (!user) return;

  const items = await getSavedItems(user.id);
  if (items.length === 0) {
    await ctx.reply("У вас пока нет сохранённых материалов.");
    return;
  }

  const typeEmoji: Record<string, string> = {
    text: "📝",
    photo: "🖼️",
    video: "🎬",
    voice: "🎤",
    document: "📄",
    sticker: "🧩",
    link: "🔗",
  };

  let message = `📋 <b>Ваши материалы (${items.length}):</b>\n\n`;

  items.slice(0, 50).forEach((item: any, index) => {
    const emoji = typeEmoji[item.type] || "💾";
    const cat = item.category ? String(item.category) : "-";
    message += `${index + 1}. ${emoji} <b>[${item.type}]</b> <code>${cat}</code>\n`;

    const safeTitle = (item.title || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    if (safeTitle) message += `   ${safeTitle}\n`;

    const openUrl = item.openTelegramUrl || item.url;
    if (openUrl) {
      const safeUrl = String(openUrl)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      message += `   <a href="${safeUrl}">Открыть</a>\n`;
    }

    const dateStr =
      typeof item.createdAt === "number"
        ? new Date(item.createdAt).toLocaleDateString("ru-RU", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Неизвестно";
    message += `   📅 ${dateStr}\n\n`;
  });

  if (items.length > 50) {
    message += `Показано 50 из ${items.length}.\n`;
  }

  await ctx.reply(message, { parse_mode: "HTML" });
}
