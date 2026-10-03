import { classStatus, formatTime } from '../../lib/dates';

const STATUS_STYLES = {
  'in-progress': {
    border: 'border-green-500/60',
    bg: 'bg-green-500/10',
    badge: 'bg-green-500 text-white',
    label: 'In progress',
  },
  upcoming: {
    border: 'border-blue-500/40',
    bg: 'bg-blue-500/5',
    badge: 'bg-blue-600 text-white',
    label: 'Upcoming',
  },
  ended: {
    border: 'border-blue-900/40',
    bg: 'bg-transparent',
    badge: 'bg-blue-900/60 text-blue-300',
    label: 'Ended',
  },
};

export default function ClassCard({ cls, showStatus = true, onEdit, onDelete, compact = false }) {
  const status = classStatus(cls.start_time, cls.end_time);
  const s = STATUS_STYLES[status];

  return (
    <div className={`rounded-lg border ${s.border} ${s.bg} ${compact ? 'p-3' : 'p-4'} transition`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`${compact ? 'text-xs' : 'text-sm'} font-bold text-white`}>{cls.subject}</h3>
            <span className={`${compact ? 'text-[10px]' : 'text-xs'} text-blue-300`}>
              {cls.form}{cls.stream ? ` ${cls.stream}` : ''}
            </span>
          </div>
          <p className={`${compact ? 'text-[10px]' : 'text-xs'} text-blue-400 mt-1`}>
            {formatTime(cls.start_time)} – {formatTime(cls.end_time)}
          </p>
        </div>

        {showStatus && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${s.badge}`}>
            {s.label}
          </span>
        )}

        {(onEdit || onDelete) && (
          <div className="flex gap-1 flex-shrink-0">
            {onEdit && (
              <button
                onClick={() => onEdit(cls)}
                className="text-blue-400 hover:text-white p-1 transition"
                aria-label="Edit"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(cls)}
                className="text-red-400 hover:text-red-300 p-1 transition"
                aria-label="Delete"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}