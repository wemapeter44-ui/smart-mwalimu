import { COMPETENCY_LEVELS } from '../../lib/constants';
import CompetencyBadge from './CompetencyBadge';

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
            <th className="text-right text-[10px] uppercase tracking-wider text-blue-500 font-semibold px-3 py-2.5 w-24">Score</th>
            <th className="text-right text-[10px] uppercase tracking-wider text-blue-500 font-semibold px-3 py-2.5 w-36">Competency</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => {
            const v = values[s.id] || {};
            const scoreVal = v.score ?? '';
            const level = v.competency_level || '';
            const comment = v.teacher_comment || '';
            const num = scoreVal === '' ? null : Number(scoreVal);
            const invalid = num != null && (isNaN(num) || num < 0 || num > 100);

            return (
              <tr key={s.id} className="border-b border-blue-900/20">
                <td className="px-3 py-2 text-xs text-blue-500 align-top">{i + 1}</td>
                <td className="px-3 py-2 align-top">
                  <p className="text-sm text-white">{s.name}</p>
                  <textarea
                    value={comment}
                    onChange={e => onChange(s.id, { teacher_comment: e.target.value })}
                    rows={2}
                    placeholder="Comment (auto-generated, editable)"
                    className="mt-1.5 w-full min-w-[200px] text-[11px] bg-[#0a1628] border border-blue-900/60 rounded-md px-2 py-1 text-blue-200 placeholder:text-blue-700 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </td>
                <td className="px-3 py-2 text-xs text-blue-300 hidden sm:table-cell align-top">
                  {s.admission_no}
                </td>
                <td className="px-3 py-2 text-right align-top">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={scoreVal}
                    onChange={e => onChange(s.id, { score: e.target.value })}
                    placeholder="—"
                    className={`w-20 bg-[#0a1628] border rounded-md px-2 py-1 text-sm text-white text-right focus:outline-none ${
                      invalid ? 'border-red-500' : 'border-blue-900/60 focus:border-blue-500'
                    }`}
                  />
                </td>
                <td className="px-3 py-2 text-right align-top">
                  <div className="flex flex-col items-end gap-1.5">
                    <select
                      value={level}
                      onChange={e => onChange(s.id, { competency_level: e.target.value })}
                      className="bg-[#0a1628] border border-blue-900/60 rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">—</option>
                      {COMPETENCY_LEVELS.map(l => (
                        <option key={l.value} value={l.value}>{l.value}</option>
                      ))}
                    </select>
                    {level && <CompetencyBadge level={level} size="sm" />}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}