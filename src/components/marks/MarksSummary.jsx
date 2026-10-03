export default function MarksSummary({ summary, subject, exam, term }) {
  const { total, entered, average, highest, lowest, needAttention } = summary;

  return (
    <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-4 mb-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <p className="text-xs text-blue-400 uppercase tracking-wider font-semibold">
            {subject} • {exam} • {term}
          </p>
        </div>
        <p className="text-[11px] text-blue-500">
          {entered} of {total} entered
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Average" value={average != null ? average : '—'} color="text-blue-300" />
        <Stat label="Highest" value={highest != null ? highest : '—'} color="text-green-400" />
        <Stat label="Lowest" value={lowest != null ? lowest : '—'} color="text-amber-400" />
        <Stat label="Entered" value={`${entered}/${total}`} color="text-white" />
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
                className="text-[11px] bg-red-500/10 border border-red-500/30 text-red-300 px-2 py-0.5 rounded-full"
              >
                {s.name} · {s.score}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-blue-500">{label}</p>
    </div>
  );
}