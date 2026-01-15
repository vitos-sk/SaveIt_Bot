// import { Context } from "telegraf";
// import { createUser } from "../../models/User";

// export async function handleStart(ctx: Context) {
//   const user = ctx.from;
//   if (!user) return;

//   await createUser(user.id, user.username, user.first_name);

//   await ctx.replyWithPhoto(
//     { url: "https://ru.pinterest.com/pin/174796029284593704/" },
//     {
//       caption: `Привет, ${user.first_name}!
// Отправь ссылку на пост, видео или музыку — я сохраню её прямо в приложении, и ты сможешь вернуться к ней в любой момент.`,
//     }
//   );
// }
