const LEVEL_STYLES = {
  EE: 'bg-green-500/15 text-green-300 border-green-500/40',
  ME: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
  AE: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  BE: 'bg-red-500/15 text-red-300 border-red-500/40',
};

const LEVEL_LABELS = {
  EE: 'Exceeding',
  ME: 'Meeting',
  AE: 'Approaching',
  BE: 'Below',
};

export default function CompetencyBadge({ level, showLabel = false, size = 'md' }) {
  if (!level) return <span className="text-blue-500 text-xs">—</span>;
  const s = LEVEL_STYLES[level] || 'bg-blue-900/40 text-blue-300 border-blue-900/60';
  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';
  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full border ${s} ${sizeClass}`}>
      <span>{level}</span>
      {showLabel && <span className="font-normal opacity-80">· {LEVEL_LABELS[level]}</span>}
    </span>
  );
}

export { LEVEL_LABELS };