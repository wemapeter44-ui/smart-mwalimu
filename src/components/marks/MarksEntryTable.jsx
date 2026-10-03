export default function MarksEntryTable({ students, values, onChange }) {
  if (!students.length) return null;

  return (
    <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg overflow-hidden print:hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-blue-900/40">
            <th className="text-left text-[10px] uppercase tracking-wider text-blue-500 font-semibold px-3 py-2.5 w-10">#</th>
            <th className="text-left text-[10px] uppercase tracking-wider text-blue-500 font-semibold px-3 py-2.5">Name</th>
            <th className="text-left text-[10px] uppercase tracking-wider text-blue-500 font-semibold px-3 py-2.5 hidden sm:table-cell">Admission</th>
            <th className="text-right text-[10px] uppercase tracking-wider text-blue-500 font-semibold px-3 py-2.5 w-28">Score</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => {
            const v = values[s.id];
            const num = v === '' || v == null ? null : Number(v);
            const invalid = num != null && (isNaN(num) || num < 0 || num > 100);

            return (
              <tr key={s.id} className="border-b border-blue-900/20">
                <td className="px-3 py-2 text-xs text-blue-500">{i + 1}</td>
                <td className="px-3 py-2 text-sm text-white">{s.name}</td>
                <td className="px-3 py-2 text-xs text-blue-300 hidden sm:table-cell">{s.admission_no}</td>
                <td className="px-3 py-2 text-right">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={v ?? ''}
                    onChange={e => onChange(s.id, e.target.value)}
                    placeholder="—"
                    className={`w-20 bg-[#0a1628] border rounded-md px-2 py-1 text-sm text-white text-right focus:outline-none ${
                      invalid ? 'border-red-500' : 'border-blue-900/60 focus:border-blue-500'
                    }`}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}