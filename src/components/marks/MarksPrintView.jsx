import { prettyDate } from '../../lib/dates';

export default function MarksPrintView({
  students, values, subject, term, form, stream, teacher,
  strand, subStrand, assessmentType,
}) {
  const scores = students
    .map(s => values[s.id]?.score)
    .filter(v => v !== '' && v != null && !isNaN(Number(v)))
    .map(Number);

  const average = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;

  return (
    <div id="marks-print" className="hidden print:block bg-white text-black p-6">
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold uppercase">The Ribe Boys High School</h1>
        <p className="text-xs mt-0.5">Pamoja Tutashinda</p>
        <h2 className="text-sm font-semibold mt-2">
          {subject} — Mark Sheet
        </h2>
        <p className="text-xs">
          {form}{stream ? ' ' + stream : ''}
          {term ? ` • ${term}` : ''}
          {assessmentType ? ` • ${assessmentType}` : ''}
        </p>
        {(strand || subStrand) && (
          <p className="text-xs">
            {strand}{strand && subStrand ? ' · ' : ''}{subStrand}
          </p>
        )}
        <p className="text-xs">
          {prettyDate(new Date())} • Teacher: {teacher?.name || '—'}
        </p>
      </div>

      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="border border-black px-2 py-1 text-left w-10">#</th>
            <th className="border border-black px-2 py-1 text-left">Name</th>
            <th className="border border-black px-2 py-1 text-left w-28">Admission</th>
            <th className="border border-black px-2 py-1 text-center w-16">Score</th>
            <th className="border border-black px-2 py-1 text-center w-20">Level</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => {
            const v = values[s.id] || {};
            const score = v.score === '' || v.score == null ? '' : v.score;
            const level = v.competency_level || '';
            return (
              <tr key={s.id}>
                <td className="border border-black px-2 py-1">{i + 1}</td>
                <td className="border border-black px-2 py-1">{s.name}</td>
                <td className="border border-black px-2 py-1">{s.admission_no}</td>
                <td className="border border-black px-2 py-1 text-center">{score}</td>
                <td className="border border-black px-2 py-1 text-center font-semibold">{level}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex justify-between mt-4 text-xs">
        <p>Students: <strong>{students.length}</strong></p>
        <p>Average score: <strong>{average != null ? average : '—'}</strong></p>
      </div>

      <div className="mt-10 text-xs flex justify-between">
        <p>Teacher: ______________________</p>
        <p>Senior Master: ______________________</p>
      </div>
    </div>
  );
}