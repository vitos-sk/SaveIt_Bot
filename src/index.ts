import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import { handleStart, handleSave, handleHelp, handleLinks } from "./bot/commands";
import {
  handleCategorySelection,
  handleSkipTitle,
  handleSkipTitleCallback,
  extractUrlsFromMessage,
} from "./bot/linkHandler";
import { showMenu, handleMenuCallback } from "./bot/menu";
import { saveIncomingUniversal } from "./bot/universalSaver";
import {
  handleUniversalCategorySelection,
  handleUniversalSkipTitleCallback,
  handleUniversalSkipTitleCommand,
} from "./bot/categorySaveFlow";

dotenv.config();

console.log("🔧 Инициализация бота...");

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error("❌ BOT_TOKEN не установлен! Установите его в переменных окружения.");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
console.log("✅ Telegraf инициализирован");

async function setupBotUi() {
  // Команды бота (видны в меню команд)
  const commands = [
    { command: "menu", description: "📋 Главное меню" },
    { command: "start", description: "🚀 Начать работу" },
    { command: "links", description: "🔗 Мои ссылки" },
    { command: "help", description: "❓ Справка" },
  ] as const;

  // Default scope
  await bot.telegram.setMyCommands(commands);
  // Explicitly set for private chats (some clients behave better with this)
  await bot.telegram.setMyCommands(commands, { scope: { type: "all_private_chats" } });

  // Кнопка меню в нижнем баре (возле инпута)
  // При нажатии пользователь увидит список команд.
  await bot.telegram.setChatMenuButton({ menuButton: { type: "commands" } });

  // Debug logs (visible in Railway logs)
  try {
    const btn = await bot.telegram.getChatMenuButton();
    const cmds = await bot.telegram.getMyCommands();
    console.log("ℹ️ Default menu button:", JSON.stringify(btn));
    console.log("ℹ️ Default commands:", JSON.stringify(cmds));
  } catch (e: any) {
    console.log("⚠️ Не удалось прочитать menu/commands:", e?.message ?? e);
  }
}

// Команды (обрабатываются первыми)
bot.command("start", async (ctx: any) => {
  const { cancelWaitingTitle } = await import("./bot/linkHandler");
  if (ctx.from) cancelWaitingTitle(ctx.from.id);
  await handleStart(ctx);

  // Ensure menu button is set for THIS private chat specifically
  try {
    if (ctx.chat?.type === "private") {
      await ctx.setChatMenuButton({ type: "commands" });
      await bot.telegram.setMyCommands(
        [
          { command: "menu", description: "📋 Главное меню" },
          { command: "start", description: "🚀 Начать работу" },
          { command: "links", description: "🔗 Мои ссылки" },
          { command: "help", description: "❓ Справка" },
        ],
        { scope: { type: "chat", chat_id: ctx.chat.id } }
      );
      const btn = await bot.telegram.getChatMenuButton({ chatId: ctx.chat.id });
      console.log("ℹ️ Chat menu button:", ctx.chat.id, JSON.stringify(btn));
    }
  } catch (e: any) {
    console.log("⚠️ Не удалось настроить menu button для чата:", e?.message ?? e);
  }
});

bot.command("help", async (ctx: any) => {
  const { cancelWaitingTitle } = await import("./bot/linkHandler");
  if (ctx.from) cancelWaitingTitle(ctx.from.id);
  await handleHelp(ctx);
});

// Команда для просмотра всех ссылок
bot.command("links", async (ctx: any) => {
  const { cancelWaitingTitle } = await import("./bot/linkHandler");
  if (ctx.from) cancelWaitingTitle(ctx.from.id);
  await handleLinks(ctx);
});

// Команда меню
bot.command("menu", async (ctx: any) => {
  await showMenu(ctx);
});

// Сохранение ссылок (старые команды оставлены для совместимости, но лучше использовать новые категории)
bot.command("save", (ctx: any) => handleSave(ctx));

// Пропустить добавление названия
bot.command("skip", async (ctx: any) => {
  // Prefer universal flow skip (new saver)
  const handled = await handleUniversalSkipTitleCommand(ctx);
  if (handled) return;
  // Fallback to legacy link flow
  await handleSkipTitle(ctx);
});

// Обработка текстовых сообщений (ссылки)
// Важно: этот обработчик должен быть после команд, чтобы команды обрабатывались первыми
bot.on("text", async (ctx: any) => {
  try {
    await saveIncomingUniversal(ctx);
  } catch (error) {
    console.error("❌ Ошибка в handleTextMessage:", error);
    await ctx.reply("❌ Произошла ошибка при обработке сообщения.");
  }
});

// Обработка файлов и медиа (фото, видео, документы, аудио и т.д.)
bot.on(
  ["photo", "video", "document", "audio", "voice", "video_note", "sticker"],
  async (ctx: any) => {
    try {
      await saveIncomingUniversal(ctx);
    } catch (error) {
      console.error("❌ Ошибка при обработке медиа:", error);
      await ctx.reply("❌ Произошла ошибка при обработке файла.");
    }
  }
);

// Обработка callback от кнопок
bot.on("callback_query", async (ctx: any) => {
  try {
    const callbackData = ctx.callbackQuery.data;
    if (callbackData) {
      if (callbackData.startsWith("ucat_")) {
        await handleUniversalCategorySelection(ctx);
      } else if (callbackData.startsWith("utskip_")) {
        await handleUniversalSkipTitleCallback(ctx);
      } else if (callbackData.startsWith("cat_")) {
        await handleCategorySelection(ctx);
      } else if (callbackData.startsWith("skip_")) {
        await handleSkipTitleCallback(ctx);
      } else if (callbackData.startsWith("menu_")) {
        await handleMenuCallback(ctx);
      }
    }
  } catch (error) {
    console.error("❌ Ошибка в callback_query:", error);
    await ctx.answerCbQuery("❌ Произошла ошибка");
  }
});

// Обработка ошибок
bot.catch((err: any, ctx: any) => {
  console.error(`Ошибка для ${ctx.updateType}:`, err);
});

// Запуск бота
const PORT = process.env.PORT || 3000;

// Для Railway обычно используется polling, но можно настроить webhook
if (process.env.WEBHOOK_URL) {
  // Если указан webhook URL, используем webhook
  bot
    .launch({
      webhook: {
        domain: process.env.WEBHOOK_URL.replace("https://", "").replace("http://", ""),
        port: Number(PORT),
      },
    })
    .then(async () => {
      console.log("🤖 Бот запущен через webhook!");
      console.log("✅ Бот готов к работе!");

      try {
        await setupBotUi();
        console.log("✅ Команды и Menu Button настроены!");
      } catch (error: any) {
        console.log(
          "⚠️ Не удалось настроить команды/Menu Button:",
          error?.message ?? error
        );
      }
    });
} else {
  // Для локальной разработки и Railway используем polling
  bot
    .launch()
    .then(async () => {
      console.log("🤖 Бот запущен через polling!");
      console.log("✅ Бот готов к работе!");

      try {
        await setupBotUi();
        console.log("✅ Команды и Menu Button настроены!");
      } catch (error: any) {
        console.log(
          "⚠️ Не удалось настроить команды/Menu Button:",
          error?.message ?? error
        );
      }
    })
    .catch((error) => {
      console.error("❌ Ошибка при запуске бота:", error);
      process.exit(1);
    });
}

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
