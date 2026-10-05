import { useState, useRef, useEffect } from 'react';

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = Math.min(ref.current.scrollHeight, 160) + 'px';
    }
  }, [text]);

  function handleSend() {
    const t = text.trim();
    if (!t || disabled) return;
    setText('');
    onSend(t);
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="border-t border-blue-900/40 bg-[#0d1e35] p-3">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <textarea
          ref={ref}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          disabled={disabled}
          placeholder="Ask anything — lesson plan, exam questions, explanation…"
          className="flex-1 resize-none bg-[#0a1628] border border-blue-900/60 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-blue-700 focus:outline-none focus:border-blue-500 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl p-2.5 transition flex-shrink-0"
          aria-label="Send"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}