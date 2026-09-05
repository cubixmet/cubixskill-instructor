export interface NormalizedChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  content: string;
  createdAt: string;
  attachments: any[];
}

export function normalizeChatMessage(raw: any): NormalizedChatMessage {
  const id = String(raw?.id ?? raw?.uuid ?? raw?.message_id ?? '');
  const roomId = String(
    raw?.room_id ??
    raw?.room?.id ??
    raw?.room ??
    ''
  );
  const senderId = String(
    raw?.sender_id ??
    raw?.sender?.id ??
    raw?.sender?.uuid ??
    raw?.senderId ??
    raw?.user_id ??
    raw?.author_id ??
    raw?.author?.id ??
    ''
  );
  const senderName =
    raw?.sender_name ??
    raw?.sender?.full_name ??
    raw?.sender?.name ??
    raw?.senderName ??
    raw?.author_name ??
    '';
  const senderRole =
    raw?.sender_role ??
    raw?.sender?.role ??
    raw?.senderRole ??
    undefined;
  const content = raw?.content ?? '';
  const createdAt = raw?.created_at ?? raw?.createdAt ?? new Date().toISOString();
  const attachments = raw?.attachments ?? raw?.media_files ?? raw?.mediaFiles ?? [];

  if (!senderId && id && import.meta.env.DEV) {
    console.warn('Personal Chat message missing sender identity', id, raw);
  }

  return {
    id,
    roomId,
    senderId,
    senderName,
    senderRole,
    content,
    createdAt,
    attachments,
  };
}
