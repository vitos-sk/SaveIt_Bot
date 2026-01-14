import { Context } from "telegraf";
import { InlineKeyboardMarkup } from "telegraf/types";
import { handleHelp } from "./commands";
import { cancelWaitingTitle } from "./linkHandler";

export async function showMenu(ctx: Context) {
  const user = ctx.from;
  if (!user) return;

  // Отменяем ожидание названия, если есть
  cancelWaitingTitle(user.id);

  const keyboard: InlineKeyboardMarkup = {
    inline_keyboard: [
      [
        {
          text: "📖 Помощь",
          callback_data: "menu_help",
        },
      ],
      [
        {
          text: "📞 Контакты",
          callback_data: "menu_contacts",
        },
      ],
    ],
  };

  await ctx.reply(`📋 Главное меню\n\n` + `Выберите действие:`, {
    reply_markup: keyboard,
  });
}

export async function handleMenuCallback(ctx: any) {
  const callbackData = ctx.callbackQuery.data;

  switch (callbackData) {
    case "menu_help":
      await ctx.answerCbQuery("📖 Открываю справку...");
      await handleHelp(ctx);
      break;

    case "menu_contacts":
      await ctx.answerCbQuery("📞 Контактная информация");
      await ctx.reply(
        `📞 Контактная информация\n\n` +
          `Если у вас есть вопросы или предложения, свяжитесь с нами:\n\n` +
          `💬 Поддержка: @your_support_username\n` +
          `📧 Email: support@example.com\n\n` +
          `Мы всегда готовы помочь! 😊`
      );
      break;

    default:
      await ctx.answerCbQuery("❌ Неизвестная команда");
  }
}
