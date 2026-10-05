import { prettyDate } from '../../lib/dates';

const LEVEL_LABEL = {
  EE: 'Exceeding Expectation',
  ME: 'Meeting Expectation',
  AE: 'Approaching Expectation',
  BE: 'Below Expectation',
};

export default function ReportCardPrint({ report, teacher, aiComment }) {
  if (!report) return null;
  const { student, subjects, levelCounts, overallAverage, overallLevel, term } = report;

  return (
    <div id="report-print" className="hidden print:block bg-white text-black p-6">
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold uppercase">The Ribe Boys High School</h1>
        <p className="text-xs mt-0.5">Pamoja Tutashinda</p>
        <h2 className="text-sm font-semibold mt-2">
          Competency-Based Report Card
        </h2>
        <p className="text-xs">
          {term ? term : 'All Terms'} • {prettyDate(new Date())}
        </p>
      </div>

      <table className="w-full text-xs mb-3 border-collapse">
        <tbody>
          <tr>
            <td className="border border-black px-2 py-1 w-32 font-semibold">Name</td>
            <td className="border border-black px-2 py-1">{student.name}</td>
            <td className="border border-black px-2 py-1 w-32 font-semibold">Admission</td>
            <td className="border border-black px-2 py-1 w-32">{student.admission_no}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1 font-semibold">Grade</td>
            <td className="border border-black px-2 py-1">{student.form || '—'}</td>
            <td className="border border-black px-2 py-1 font-semibold">Stream</td>
            <td className="border border-black px-2 py-1">{student.stream || '—'}</td>
          </tr>
        </tbody>
      </table>

      <table className="w-full text-xs border-collapse mb-3">
        <thead>
          <tr>
            <th className="border border-black px-2 py-1 text-left">Subject</th>
            <th className="border border-black px-2 py-1 text-center w-20">Avg Score</th>
            <th className="border border-black px-2 py-1 text-center w-24">Overall Level</th>
            <th className="border border-black px-2 py-1 text-left w-56">Teacher Comment</th>
          </tr>
        </thead>
        <tbody>
          {subjects.length === 0 ? (
            <tr>
              <td colSpan="4" className="border border-black px-2 py-3 text-center">
                No marks recorded for this term.
              </td>
            </tr>
          ) : (
            subjects.map(s => (
              <tr key={s.subject}>
                <td className="border border-black px-2 py-1">{s.subject}</td>
                <td className="border border-black px-2 py-1 text-center">{s.average ?? '—'}</td>
                <td className="border border-black px-2 py-1 text-center font-semibold">{s.overallLevel || '—'}</td>
                <td className="border border-black px-2 py-1">{s.comment || ''}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <table className="w-full text-xs border-collapse mb-3">
        <thead>
          <tr>
            <th className="border border-black px-2 py-1 text-left w-40">Overall Summary</th>
            <th className="border border-black px-2 py-1 text-center">EE</th>
            <th className="border border-black px-2 py-1 text-center">ME</th>
            <th className="border border-black px-2 py-1 text-center">AE</th>
            <th className="border border-black px-2 py-1 text-center">BE</th>
            <th className="border border-black px-2 py-1 text-center w-24">Avg</th>
            <th className="border border-black px-2 py-1 text-center w-24">Level</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-black px-2 py-1 font-semibold">Assessment count</td>
            <td className="border border-black px-2 py-1 text-center">{levelCounts.EE}</td>
            <td className="border border-black px-2 py-1 text-center">{levelCounts.ME}</td>
            <td className="border border-black px-2 py-1 text-center">{levelCounts.AE}</td>
            <td className="border border-black px-2 py-1 text-center">{levelCounts.BE}</td>
            <td className="border border-black px-2 py-1 text-center font-semibold">{overallAverage ?? '—'}</td>
            <td className="border border-black px-2 py-1 text-center font-semibold">{overallLevel || '—'}</td>
          </tr>
        </tbody>
      </table>

      {aiComment && (
        <div className="border border-black px-2 py-2 mb-3">
          <p className="text-[10px] font-semibold uppercase mb-1">Overall Teacher Comment</p>
          <p className="text-xs leading-relaxed">{aiComment}</p>
        </div>
      )}

      <p className="text-[10px] mt-1">
        Legend: EE — {LEVEL_LABEL.EE} • ME — {LEVEL_LABEL.ME} • AE — {LEVEL_LABEL.AE} • BE — {LEVEL_LABEL.BE}
      </p>

      <div className="mt-10 text-xs flex justify-between">
        <p>Class Teacher: ______________________</p>
        <p>Principal: ______________________</p>
      </div>
      <p className="text-[10px] mt-2 text-right">
        Generated by Smart Mwalimu — {teacher?.name || ''}
      </p>
    </div>
  );
}