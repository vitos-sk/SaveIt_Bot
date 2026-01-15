import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import { handleStart, handleSave, handleHelp, handleLinks } from "./bot/commands";
import { getUserByTelegramId } from "./models/User";
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

// Автоприветствие: Telegram не даёт написать "просто при открытии чата",
// но мы можем отправить приветствие при первом любом сообщении пользователя.
bot.use(async (ctx: any, next) => {
  try {
    if (!ctx?.from) return next();
    if (!ctx?.chat || ctx.chat.type !== "private") return next();
    if (ctx.updateType !== "message") return next();

    const text = ctx.message?.text;
    if (typeof text === "string" && text.startsWith("/start")) return next();

    const existingUser = await getUserByTelegramId(ctx.from.id);
    if (!existingUser || !existingUser.welcome_sent_at) {
      await handleStart(ctx);
    }
  } catch (e) {
    console.error("⚠️ Ошибка автоприветствия:", e);
  }

  return next();
});

// Команды (обрабатываются первыми)
bot.command("start", async (ctx: any) => {
  const { cancelWaitingTitle } = await import("./bot/linkHandler");
  if (ctx.from) cancelWaitingTitle(ctx.from.id);
  await handleStart(ctx);
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
    .then(() => {
      console.log("🤖 Бот запущен через webhook!");
    });
} else {
  // Для локальной разработки и Railway используем polling
  bot
    .launch()
    .then(async () => {
      console.log("🤖 Бот запущен через polling!");
      console.log("✅ Бот готов к работе!");

      // Настраиваем Menu Button и команды бота
      try {
        // Устанавливаем команды бота (они появятся в Menu Button)
        await bot.telegram.setMyCommands([
          { command: "menu", description: "📋 Главное меню" },
          { command: "start", description: "🚀 Начать работу" },
          { command: "links", description: "🔗 Мои ссылки" },
          { command: "help", description: "❓ Справка" },
        ]);

        // Настраиваем Menu Button (кнопка меню в нижнем баре)
        // При нажатии на эту кнопку пользователь увидит список команд
        // Команда /menu будет первой в списке
        try {
          await bot.telegram.setChatMenuButton({
            menuButton: {
              type: "commands",
            },
          });
          console.log("✅ Menu Button настроена!");
        } catch (error: any) {
          // Если не удалось установить Menu Button, это не критично
          console.log(
            "⚠️ Menu Button не настроена (может быть недоступно для этого бота):",
            error.message
          );
        }

        console.log("✅ Команды бота настроены!");
        console.log("💡 Кнопка меню появится в нижнем баре чата с ботом");
        console.log("💡 При нажатии на неё выберите команду /menu для открытия меню");
      } catch (error) {
        console.error("⚠️ Ошибка при настройке Menu Button:", error);
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
