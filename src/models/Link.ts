import db from "../db/connection";

export type ContentType =
  | "all"
  | "idea"
  | "task"
  | "knowledge"
  | "note"
  | "bookmark"
  | "quote"
  | "study"
  | "fun";

export interface Link {
  id?: string;
  user_id: string;
  url: string;
  content_type: ContentType;
  title?: string;
  created_at: number;
}

export async function createLink(
  userId: string,
  url: string,
  contentType: ContentType,
  title?: string
): Promise<Link> {
  const linkRef = db.ref("links").push();

  // Firebase Realtime Database не принимает undefined, используем null или не включаем поле
  const linkData: any = {
    user_id: userId,
    url: url,
    content_type: contentType,
    created_at: Date.now(),
  };

  // Добавляем title только если он есть (не undefined)
  if (title !== undefined && title !== null && title.trim() !== "") {
    linkData.title = title.trim();
  }

  await linkRef.set(linkData);
  const snapshot = await linkRef.once("value");
  return { id: linkRef.key!, ...snapshot.val() } as Link;
}

export async function getUserLinks(
  userId: string,
  contentType?: ContentType
): Promise<Link[]> {
  const snapshot = await db.ref("links").once("value");
  const links = snapshot.val();

  if (!links) {
    return [];
  }

  // Фильтруем ссылки по user_id и опционально по content_type
  const result: Link[] = [];
  for (const [id, linkData] of Object.entries(links)) {
    const link = linkData as Link;
    if (link.user_id === userId) {
      if (!contentType || link.content_type === contentType) {
        result.push({ id, ...link });
      }
    }
  }

  // Сортируем по дате создания (убывание)
  return result.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
}

export async function deleteLink(linkId: string, userId: string): Promise<boolean> {
  const snapshot = await db.ref(`links/${linkId}`).once("value");
  const linkData = snapshot.val() as Link | null;

  if (!linkData) {
    return false;
  }

  if (linkData.user_id !== userId) {
    return false;
  }

  await db.ref(`links/${linkId}`).remove();
  return true;
}
