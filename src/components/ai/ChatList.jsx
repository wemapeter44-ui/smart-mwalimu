export default function ChatList({ chats, currentChat, onSelect, onDelete, loading }) {
  if (loading) {
    return <p className="text-xs text-blue-400 text-center py-4">Loading…</p>;
  }
  if (!chats.length) {
    return <p className="text-xs text-blue-500 text-center py-6 px-3">No chats yet. Start a new one.</p>;
  }

  return (
    <div className="space-y-1">
      {chats.map(c => {
        const active = currentChat?.id === c.id;
        return (
          <div
            key={c.id}
            className={`group flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition ${
              active ? 'bg-blue-600 text-white' : 'text-blue-300 hover:bg-blue-900/40'
            }`}
            onClick={() => onSelect(c)}
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            <span className="flex-1 text-xs truncate">{c.title || 'Untitled chat'}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(c); }}
              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition"
              title="Delete"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}