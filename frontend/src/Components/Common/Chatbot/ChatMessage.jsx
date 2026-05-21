import ChatProductCard from "./ChatProductCard.jsx";

const ChatMessage = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${isUser ? "bg-black text-white" : "bg-gray-100 text-gray-900"}`}>
        <p className="whitespace-pre-wrap leading-6">{message.text}</p>

        {message.timestamp ? (
          <div className={`mt-2 text-xs ${isUser ? "text-gray-200 text-right" : "text-gray-500 text-left"}`}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        ) : null}

        {message.products?.length ? (
          <div className="mt-3 grid gap-2">
            {message.products.map((product) => (
              <ChatProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : null}

        {message.meta?.typing ? (
          <div className="mt-2 text-xs text-gray-500">Searching products...</div>
        ) : null}
      </div>
    </div>
  );
};

export default ChatMessage;
