import {
  ensureTelegramDeepLink,
  telegramWebLinkToOpenTelegramUrl,
} from "../../utils/telegramLinks";
import { firstN } from "./helpers";

export function buildMediaDraft(message: any, base: any, originLinks?: any): any | null {
  if (message.photo && Array.isArray(message.photo) && message.photo.length > 0) {
    const best = message.photo[message.photo.length - 1];
    return {
      ...base,
      type: "photo",
      mediaType: "photo",
      mediaFileId: best.file_id,
      ...(originLinks ? originLinks : {}),
    };
  }

  if (message.video) {
    return {
      ...base,
      type: "video",
      mediaType: "video",
      mediaFileId: message.video.file_id,
      ...(originLinks ? originLinks : {}),
    };
  }

  if (message.video_note) {
    return {
      ...base,
      type: "video",
      mediaType: "video",
      mediaFileId: message.video_note.file_id,
      ...(originLinks ? originLinks : {}),
    };
  }

  if (message.voice) {
    return {
      ...base,
      type: "voice",
      mediaType: "voice",
      mediaFileId: message.voice.file_id,
      ...(originLinks ? originLinks : {}),
    };
  }

  if (message.document) {
    return {
      ...base,
      type: "document",
      mediaType: "document",
      mediaFileId: message.document.file_id,
      fileName: message.document.file_name,
      mimeType: message.document.mime_type,
      ...(originLinks ? originLinks : {}),
    };
  }

  if (message.audio) {
    // Keep file_id-only rule; represent as "document"
    return {
      ...base,
      type: "document",
      mediaType: "document",
      mediaFileId: message.audio.file_id,
      fileName: message.audio.file_name || message.audio.title,
      mimeType: message.audio.mime_type,
      ...(originLinks ? originLinks : {}),
    };
  }

  if (message.sticker) {
    return {
      ...base,
      type: "sticker",
      mediaType: "sticker",
      mediaFileId: message.sticker.file_id,
      emoji: message.sticker.emoji,
      ...(originLinks ? originLinks : {}),
    };
  }

  return null;
}

export function buildLinkDraft(rawUrl: string, base: any, originLinks?: any): any {
  const maybeOpenTg = telegramWebLinkToOpenTelegramUrl(rawUrl);

  const draft: any = { ...base, type: "link" };

  if (originLinks) {
    Object.assign(draft, originLinks);
    draft.url = originLinks.openTelegramUrl;
    return draft;
  }

  if (maybeOpenTg) {
    draft.openTelegramUrl = maybeOpenTg;
    draft.deepUrl = ensureTelegramDeepLink(maybeOpenTg);
    draft.url = maybeOpenTg;
    return draft;
  }

  draft.url = rawUrl;
  return draft;
}

export function buildTextDraft(text: string, base: any, originLinks?: any): any {
  return {
    ...base,
    type: "text",
    title: firstN(text, 50),
    content: text,
    ...(originLinks ? originLinks : {}),
  };
}
