import CompetencyBadge from './CompetencyBadge';

const COMPETENCY_KEYS = ['EE', 'ME', 'AE', 'BE'];

export default function MarksSummary({ summary, subject, term, assessmentType, strand, subStrand }) {
  const { total, entered, levels, average, needAttention } = summary;

  return (
    <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-4 mb-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="text-xs text-blue-400 uppercase tracking-wider font-semibold">
          {subject} • {term}
          {assessmentType && <span className="ml-2 text-blue-300">({assessmentType})</span>}
        </div>
        <p className="text-[11px] text-blue-500">
          {entered} of {total} entered
        </p>
      </div>

      {(strand || subStrand) && (
        <p className="text-[11px] text-blue-400 mb-3">
          {strand}{strand && subStrand ? ' · ' : ''}{subStrand}
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div>
          <p className="text-xl font-bold text-blue-300">{average != null ? average : '—'}</p>
          <p className="text-[10px] uppercase tracking-wider text-blue-500">Avg Score</p>
        </div>
        {COMPETENCY_KEYS.map(k => (
          <div key={k}>
            <p className={`text-xl font-bold ${
              k === 'EE' ? 'text-green-400' :
              k === 'ME' ? 'text-blue-400' :
              k === 'AE' ? 'text-amber-400' :
              k === 'BE' ? 'text-red-400' : 'text-blue-500'
            }`}>
              {levels[k] || 0}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-blue-500">{k}</p>
          </div>
        ))}
      </div>

      {needAttention.length > 0 && (
        <div className="mt-4 pt-4 border-t border-blue-900/40">
          <p className="text-[11px] font-semibold text-red-400 uppercase tracking-wider mb-2">
            Needs attention ({needAttention.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {needAttention.map(s => (
              <span
                key={s.id}
                className="text-[11px] bg-red-500/10 border border-red-500/30 text-red-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1"
              >
                {s.name}
                <CompetencyBadge level={s.level} size="sm" />
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}