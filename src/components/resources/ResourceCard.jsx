import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

function hostOf(url) {
  try { return new URL(url).hostname.replace('www.', ''); }
  catch { return url; }
}

export default function ResourceCard({ item, onEdit, onDelete }) {
  const { user } = useAuth();
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const isAuthor = item.created_by && user?.id === item.created_by;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(item.link);
      setCopied(true);
      toast.success('Link copied.', 'Copied');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy link.');
    }
  }

  return (
    <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-4">
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="min-w-0">
          {item.subject && (
            <span className="text-[10px] uppercase tracking-wider text-blue-400 border border-blue-900/60 rounded-full px-2 py-0.5">
              {item.subject}
            </span>
          )}
          <h3 className="text-sm font-bold text-white mt-1.5">{item.title}</h3>
        </div>

        {isAuthor && (
          <div className="flex gap-1 flex-shrink-0">
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

      {item.description && (
        <p className="text-sm text-blue-200 leading-relaxed mb-3">{item.description}</p>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[10px] text-blue-500 truncate">
          🔗 {hostOf(item.link)}
        </p>
        <div className="flex gap-2">
          <button
            onClick={copyLink}
            className="text-[11px] text-blue-300 border border-blue-900/60 hover:bg-blue-900/40 rounded-md px-3 py-1.5 transition"
          >
            {copied ? 'Copied' : 'Copy link'}
          </button>
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-white bg-blue-600 hover:bg-blue-500 rounded-md px-3 py-1.5 transition"
          >
            Open →
          </a>
        </div>
      </div>
    </div>
  );
}