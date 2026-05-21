import { useEffect, useRef, useState } from "react";
import { FiMessageCircle, FiSend, FiX } from "react-icons/fi";
import ChatMessage from "./ChatMessage.jsx";
import useChat from "../../../redux/hooks/useChat.js";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, status, send } = useChat();
  const isSending = status === "loading";
  const scrollRef = useRef(null);
  const controllerRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  const sendMessage = async (event) => {
    event.preventDefault();

    const trimmed = input.trim();
    if (!trimmed || isSending) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
      products: [],
    };
    const nextRequestId = requestIdRef.current + 1;
    requestIdRef.current = nextRequestId;

    controllerRef.current?.abort();
    const controller = send(trimmed, 4);
    controllerRef.current = controller;
    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {isOpen ? (
        <div className="flex h-[520px] w-[92vw] max-w-md flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">TrendsWave Assistant</p>
              <p className="text-xs text-gray-500">Search, match, and discover products fast</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              aria-label="Close chatbot"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-gray-50 to-white px-4 py-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isSending ? (
              <ChatMessage
                message={{
                  id: "typing",
                  role: "assistant",
                  text: "Checking products...",
                  products: [],
                  meta: { typing: true },
                }}
              />
            ) : null}
            <div ref={scrollRef} />
          </div>

          <form onSubmit={sendMessage} className="border-t border-gray-100 p-3">
            <div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm focus-within:border-black">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about products, colors, or styling..."
                rows={1}
                className="max-h-28 flex-1 resize-none bg-transparent py-1 text-sm outline-none placeholder:text-gray-400"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage(event);
                  }
                }}
              />
              <button
                type="submit"
                disabled={isSending || !input.trim()}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <FiSend className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-gray-800"
          aria-label="Open chatbot"
        >
          <FiMessageCircle className="h-4 w-4" />
          Chat with us
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
