export interface NormalizedChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  content: string;
  createdAt: string;
  attachments: any[];
  deliveryStatus?: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  deliveredAt?: string;
  readAt?: string;
  clientId?: string;
  isOptimistic?: boolean;
}

export function normalizeChatMessage(raw: any): NormalizedChatMessage {
  const id = String(raw?.id ?? raw?.uuid ?? raw?.message_id ?? raw?.client_id ?? '');
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
  const deliveryStatus = raw?.delivery_status ?? raw?.deliveryStatus ?? 'SENT';
  const deliveredAt = raw?.delivered_at ?? raw?.deliveredAt;
  const readAt = raw?.read_at ?? raw?.readAt;

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
    deliveryStatus,
    deliveredAt,
    readAt,
    clientId: raw?.client_id || raw?.clientId,
    isOptimistic: raw?.isOptimistic,
  };
}
