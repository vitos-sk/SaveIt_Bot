export function isDirectForwardFromUser(message: any): boolean {
  // "Direct" = forwarded from a user (private dialog between people)
  // Allowed: forwards from chats/channels (forward_from_chat).
  return !!message?.forward_from && !message?.forward_from_chat;
}
