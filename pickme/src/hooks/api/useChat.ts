import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type { ChatMessage, ChatThread, Paginated, UUID } from "@/lib/api-types";
import { qk } from "@/lib/query-client";

export function useChatThreads() {
  return useQuery({
    queryKey: qk.threads(),
    queryFn: () => api.get<Paginated<ChatThread>>("/chat-threads/"),
    select: (page) => page.results,
  });
}

export function useMessages(threadId: UUID | undefined) {
  return useQuery({
    queryKey: qk.messages(threadId ?? ""),
    queryFn: () =>
      api.get<Paginated<ChatMessage>>(`/chat-threads/${threadId}/messages/`),
    select: (page) => page.results,
    enabled: !!threadId,
  });
}

export function useSendMessage(threadId: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { content?: string; attachment_url?: string }) =>
      api.post<ChatMessage>(`/chat-threads/${threadId}/messages/`, {
        message_type: "text",
        ...input,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.messages(threadId) }),
  });
}
