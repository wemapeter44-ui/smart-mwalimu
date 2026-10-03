export default function RegisterSummary({ total, present, absent, marked, savedAt }) {
  return (
    <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-4 mb-4 flex items-center gap-6 flex-wrap">
      <Stat label="Total" value={total} color="text-white" />
      <Stat label="Marked" value={marked} color="text-blue-300" />
      <Stat label="Present" value={present} color="text-green-400" />
      <Stat label="Absent" value={absent} color="text-red-400" />
      {savedAt && (
        <span className="ml-auto text-[11px] text-green-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          Saved
        </span>
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