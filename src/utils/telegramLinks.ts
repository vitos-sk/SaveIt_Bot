export function telegramWebLinkToDeepLink(rawUrl: string): string | null {
  try {
    const u = new URL(rawUrl);
    const host = (u.hostname || "").toLowerCase();
    if (host !== "t.me" && host !== "telegram.me") return null;

    // Path examples:
    // - /some_channel/123
    // - /c/123456789/321
    const parts = u.pathname.split("/").filter(Boolean);

    // Private channel/supergroup post
    if (parts.length >= 3 && parts[0] === "c") {
      const channel = parts[1];
      const post = parts[2];
      if (/^\d+$/.test(channel) && /^\d+$/.test(post)) {
        return `tg://privatepost?channel=${channel}&post=${post}`;
      }
      return null;
    }

    // Public channel/group post by username
    if (parts.length >= 2) {
      const domain = parts[0];
      const post = parts[1];
      if (domain && /^\d+$/.test(post)) {
        return `tg://resolve?domain=${domain}&post=${post}`;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function telegramWebLinkToOpenTelegramUrl(rawUrl: string): string | null {
  try {
    const u = new URL(rawUrl);
    const host = (u.hostname || "").toLowerCase();
    if (host !== "t.me" && host !== "telegram.me") return null;

    const parts = u.pathname.split("/").filter(Boolean);

    // /c/<internalChatId>/<messageId>
    if (parts.length >= 3 && parts[0] === "c") {
      const internalChatId = parts[1];
      const messageId = parts[2];
      if (/^\d+$/.test(internalChatId) && /^\d+$/.test(messageId)) {
        return `https://t.me/c/${internalChatId}/${messageId}`;
      }
      return null;
    }

    // /<username>/<messageId>
    if (parts.length >= 2) {
      const username = parts[0];
      const messageId = parts[1];
      if (username && /^\d+$/.test(messageId)) {
        return `https://t.me/${username}/${messageId}`;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function telegramPostLinksFromChat(
  chatId: number,
  messageId: number,
  username?: string
): { openTelegramUrl: string; deepUrl: string } {
  if (username && username.trim()) {
    return {
      openTelegramUrl: `https://t.me/${username.trim()}/${messageId}`,
      deepUrl: `tg://resolve?domain=${username.trim()}&post=${messageId}`,
    };
  }

  let internalChatId = Math.abs(chatId).toString();
  if (internalChatId.startsWith("100")) {
    internalChatId = internalChatId.substring(3);
  }

  return {
    openTelegramUrl: `https://t.me/c/${internalChatId}/${messageId}`,
    deepUrl: `tg://privatepost?channel=${internalChatId}&post=${messageId}`,
  };
}

export function ensureTelegramDeepLink(url: string): string {
  if (!url || typeof url !== "string") return url;
  if (url.startsWith("tg://")) return url;
  const deep = telegramWebLinkToDeepLink(url);
  return deep || url;
}

export function ensureTelegramOpenTelegramUrl(url: string): string {
  if (!url || typeof url !== "string") return url;
  if (url.startsWith("https://t.me/") || url.startsWith("http://t.me/")) {
    // normalize to https
    return url.replace(/^http:\/\//, "https://");
  }
  const open = telegramWebLinkToOpenTelegramUrl(url);
  return open || url;
}
