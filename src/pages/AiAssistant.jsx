import { useEffect, useRef } from 'react';
import { useAiChat } from '../hooks/useAiChat';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';
import ChatMessage from '../components/ai/ChatMessage';
import ChatInput from '../components/ai/ChatInput';
import ChatList from '../components/ai/ChatList';

const QUICK_PROMPTS = [
  'Create a Grade 10 Mathematics lesson plan on Quadratic Equations (CBE)',
  'Generate 5 SBA exam questions on Photosynthesis for Grade 11 Biology with marking scheme',
  'Explain the concept of Newton\'s Laws of Motion for a Grade 10 Physics class',
  'Draft a scheme of work for Grade 10 English, Term 1',
  'Suggest 3 competency-based activities for teaching Algebra',
  'Write teacher comments for a student rated AE in Chemistry',
];

export default function AiAssistant() {
  const toast = useToast();
  const { confirm } = useConfirm();
  const {
    chats, currentChat, messages,
    loadingChats, sending, error,
    createChat, selectChat, deleteChat, sendMessage,
  } = useAiChat();

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  async function handleNewChat() {
    try {
      await createChat();
    } catch (err) {
      toast.error(err.message || 'Could not create chat.');
    }
  }

  async function handleDelete(chat) {
    const ok = await confirm({
      title: 'Delete this chat?',
      message: `"${chat.title || 'Untitled chat'}" will be permanently removed.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteChat(chat.id);
      toast.success('Chat deleted.', 'Deleted');
    } catch (err) {
      toast.error(err.message || 'Could not delete chat.');
    }
  }

  async function handleSend(text) {
    try {
      await sendMessage(text);
    } catch (err) {
      toast.error(err.message || 'Could not send message.');
    }
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Sidebar: chat list */}
      <aside className="hidden md:flex w-64 flex-col border-r border-blue-900/40 bg-[#0d1e35]">
        <div className="p-3 border-b border-blue-900/40">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-md py-2 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <ChatList
            chats={chats}
            currentChat={currentChat}
            onSelect={selectChat}
            onDelete={handleDelete}
            loading={loadingChats}
          />
        </div>
      </aside>

      {/* Main chat */}
      <section className="flex-1 flex flex-col min-w-0 bg-[#0a1628]">
        {/* Header for mobile */}
        <div className="md:hidden flex items-center justify-between px-3 py-2 border-b border-blue-900/40 bg-[#0d1e35]">
          <span className="text-xs text-blue-300 truncate">
            {currentChat?.title || 'New chat'}
          </span>
          <button
            onClick={handleNewChat}
            className="text-xs text-blue-300 hover:text-white px-2 py-1 rounded border border-blue-900/60"
          >
            + New
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
          {!hasMessages ? (
            <div className="max-w-2xl mx-auto pt-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-600 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M12 2a5 5 0 015 5v3a5 5 0 01-10 0V7a5 5 0 015-5zM4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-white">Smart Mwalimu AI</h2>
                <p className="text-xs text-blue-400 mt-1">
                  Your CBE-aligned teaching assistant. Ask anything.
                </p>
              </div>

              <p className="text-[11px] uppercase tracking-wider text-blue-500 font-semibold mb-2">
                Try one of these
              </p>
              <div className="grid gap-2">
                {QUICK_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(p)}
                    disabled={sending}
                    className="text-left text-xs text-blue-200 border border-blue-900/40 hover:border-blue-700 hover:bg-blue-900/30 rounded-md px-3 py-2.5 transition disabled:opacity-50"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-3">
              {messages.map(m => <ChatMessage key={m.id} message={m} />)}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-[#0a1628] border border-blue-900/40 rounded-2xl rounded-bl-sm px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.15s' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="px-4 pb-2 max-w-3xl mx-auto w-full">
            <p className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-1.5">
              {error}
            </p>
          </div>
        )}

        <ChatInput onSend={handleSend} disabled={sending} />
      </section>
    </div>
  );
}