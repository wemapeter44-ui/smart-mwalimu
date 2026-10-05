export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-sm'
            : isError
              ? 'bg-red-500/10 border border-red-500/30 text-red-300 rounded-bl-sm'
              : 'bg-[#0a1628] border border-blue-900/40 text-blue-100 rounded-bl-sm'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}