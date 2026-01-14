export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.protocol === "http:" ||
      urlObj.protocol === "https:" ||
      urlObj.protocol === "tg:"
    );
  } catch {
    return false;
  }
}

export function detectContentType(
  url: string
): "video" | "music" | "post" | "article" | "other" {
  const lowerUrl = url.toLowerCase();

  // Видео платформы
  const videoDomains = [
    "youtube.com",
    "youtu.be",
    "vimeo.com",
    "tiktok.com",
    "instagram.com/reel",
    "vk.com/video",
  ];
  if (videoDomains.some((domain) => lowerUrl.includes(domain))) {
    return "video";
  }

  // Музыка платформы
  const musicDomains = [
    "spotify.com",
    "soundcloud.com",
    "youtube.com/watch",
    "music.yandex.ru",
    "vk.com/audio",
  ];
  if (musicDomains.some((domain) => lowerUrl.includes(domain))) {
    return "music";
  }

  // Социальные сети (посты)
  const postDomains = [
    "twitter.com",
    "x.com",
    "facebook.com",
    "vk.com/wall",
    "instagram.com/p",
  ];
  if (postDomains.some((domain) => lowerUrl.includes(domain))) {
    return "post";
  }

  // Статьи и блоги
  const articleDomains = ["medium.com", "habr.com", "dev.to", "github.com"];
  if (articleDomains.some((domain) => lowerUrl.includes(domain))) {
    return "article";
  }

  return "other";
}
