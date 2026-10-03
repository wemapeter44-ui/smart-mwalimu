import { useAuth } from '../../contexts/AuthContext';

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AnnouncementCard({ item, onEdit, onDelete, onTogglePin }) {
  const { user } = useAuth();
  const isAuthor = item.author_id && user?.id === item.author_id;

  return (
    <div className={`bg-[#0d1e35] border rounded-lg p-4 ${item.pinned ? 'border-amber-500/40' : 'border-blue-900/40'}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {item.pinned && (
              <span className="text-[10px] uppercase tracking-wider text-amber-400 border border-amber-500/40 rounded-full px-2 py-0.5">
                Pinned
              </span>
            )}
            {item.audience === 'department' && (
              <span className="text-[10px] uppercase tracking-wider text-blue-300 border border-blue-900/60 rounded-full px-2 py-0.5">
                {item.audience_subject || 'Department'}
              </span>
            )}
            {item.audience === 'all' && (
              <span className="text-[10px] uppercase tracking-wider text-blue-500 border border-blue-900/40 rounded-full px-2 py-0.5">
                All staff
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-white mt-1.5">{item.title}</h3>
        </div>

        {isAuthor && (
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => onTogglePin(item)}
              className={`p-1 transition ${item.pinned ? 'text-amber-400 hover:text-amber-300' : 'text-blue-400 hover:text-white'}`}
              title={item.pinned ? 'Unpin' : 'Pin'}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M12 17v5M5 9l7-7 7 7v6a2 2 0 01-2 2H7a2 2 0 01-2-2V9z" />
              </svg>
            </button>
            <button
              onClick={() => onEdit(item)}
              className="text-blue-400 hover:text-white p-1 transition"
              title="Edit"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(item)}
              className="text-red-400 hover:text-red-300 p-1 transition"
              title="Delete"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <p className="text-sm text-blue-200 whitespace-pre-wrap leading-relaxed">{item.message}</p>

      <div className="mt-3 pt-3 border-t border-blue-900/30 flex items-center justify-between text-[10px] text-blue-500">
        <span>{item.author || 'Unknown'}</span>
        <span>{timeAgo(item.created_at)}</span>
      </div>
    </div>
  );
}