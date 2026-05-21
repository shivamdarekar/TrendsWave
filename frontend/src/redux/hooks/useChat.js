import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUserMessage, sendChat } from "../slices/chatSlice.js";

export function useChat() {
  const dispatch = useDispatch();
  const messages = useSelector((s) => s.chat.messages);
  const status = useSelector((s) => s.chat.status);

  const send = useCallback(
    (text, limit = 4) => {
      const userMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        text,
        products: [],
      };

      dispatch(addUserMessage(userMessage));
      const controller = new AbortController();
      dispatch(sendChat({ message: text, limit, signal: controller.signal }));
      return controller;
    },
    [dispatch]
  );

  return { messages, status, send };
}

export default useChat;
