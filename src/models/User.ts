import db from "../db/connection";

export interface User {
  id?: string;
  telegram_id: number;
  username?: string;
  first_name?: string;
  created_at: number;
}

export async function createUser(
  telegramId: number,
  username?: string,
  firstName?: string
): Promise<User> {
  // Проверяем, существует ли пользователь
  const existingUser = await getUserByTelegramId(telegramId);

  if (existingUser) {
    // Обновляем существующего пользователя
    const updates: any = {};
    if (username !== undefined) updates.username = username;
    if (firstName !== undefined) updates.first_name = firstName;

    await db.ref(`users/${existingUser.id}`).update(updates);

    const snapshot = await db.ref(`users/${existingUser.id}`).once("value");
    return { id: existingUser.id, ...snapshot.val() } as User;
  }

  // Создаем нового пользователя
  const userRef = db.ref("users").push();
  const userData: Omit<User, "id"> = {
    telegram_id: telegramId,
    username: username,
    first_name: firstName,
    created_at: Date.now(),
  };

  await userRef.set(userData);
  const snapshot = await userRef.once("value");
  return { id: userRef.key!, ...snapshot.val() } as User;
}

export async function getUserByTelegramId(telegramId: number): Promise<User | null> {
  const snapshot = await db.ref("users").once("value");
  const users = snapshot.val();

  if (!users) {
    return null;
  }

  // Ищем пользователя по telegram_id
  for (const [id, userData] of Object.entries(users)) {
    const user = userData as User;
    if (user.telegram_id === telegramId) {
      return { id, ...user };
    }
  }

  return null;
}
