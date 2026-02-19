import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { postAiChat, InputType as ChatInput } from "../endpoints/ai/chat_POST.schema";

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export function useAiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const mutation = useMutation({
    mutationFn: (message: string) => {
      // Prepare the input with history
      const input: ChatInput = {
        message,
        conversationHistory: messages,
      };
      return postAiChat(input);
    },
    onSuccess: (data, variables) => {
      // Add the assistant's response to the history
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply }
      ]);
    },
  });

  const sendMessage = useCallback((message: string) => {
    // Optimistically add user message to UI
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: message }
    ]);
    
    // Trigger the API call
    mutation.mutate(message);
  }, [mutation]);

  const clearChat = useCallback(() => {
    setMessages([]);
    mutation.reset();
  }, [mutation]);

  return {
    messages,
    sendMessage,
    isLoading: mutation.isPending,
    error: mutation.error,
    clearChat,
  };
}