import { telegramPostLinksFromChat } from "../../utils/telegramLinks";

export function getOriginTelegramLinks(
  ctx: any,
  message: any
): { openTelegramUrl: string; deepUrl: string } | undefined {
  // Prefer source of forwarded message if available (channel/group/user)
  const forwardedFrom = message?.forward_from_chat || message?.forward_from;
  const forwardedMessageId = message?.forward_from_message_id;
  if (forwardedFrom && forwardedMessageId) {
    return telegramPostLinksFromChat(
      forwardedFrom.id,
      forwardedMessageId,
      forwardedFrom.username
    );
  }

  // For messages inside channel/group/supergroup we can build a post link from chatId+messageId
  const chatId = ctx.chat?.id;
  const messageId = message?.message_id;
  const chatType = (ctx.chat as any)?.type;
  const username = (ctx.chat as any)?.username;
  if (
    chatType !== "private" &&
    typeof chatId === "number" &&
    typeof messageId === "number"
  ) {
    return telegramPostLinksFromChat(chatId, messageId, username);
  }

  return undefined;
}
