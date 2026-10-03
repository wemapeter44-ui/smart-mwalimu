import { prettyDate } from '../../lib/dates';

export default function RegisterPrintView({ students, statuses, teacher, classLabel, date }) {
  const present = Object.values(statuses).filter(s => s === 'present').length;
  const absent = Object.values(statuses).filter(s => s === 'absent').length;

  return (
    <div id="register-print" className="hidden print:block bg-white text-black p-6">
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold uppercase">The Ribe Boys High School</h1>
        <p className="text-xs mt-0.5">Pamoja Tutashinda</p>
        <h2 className="text-sm font-semibold mt-2">
          Class Register — {classLabel}
        </h2>
        <p className="text-xs">
          {prettyDate(new Date(date))} • Class Teacher: {teacher?.name || '—'}
        </p>
      </div>

      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="border border-black px-2 py-1 text-left w-10">#</th>
            <th className="border border-black px-2 py-1 text-left">Name</th>
            <th className="border border-black px-2 py-1 text-left w-32">Admission</th>
            <th className="border border-black px-2 py-1 text-center w-20">Present</th>
            <th className="border border-black px-2 py-1 text-center w-20">Absent</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => {
            const st = statuses[s.id];
            return (
              <tr key={s.id}>
                <td className="border border-black px-2 py-1">{i + 1}</td>
                <td className="border border-black px-2 py-1">{s.name}</td>
                <td className="border border-black px-2 py-1">{s.admission_no}</td>
                <td className="border border-black px-2 py-1 text-center">{st === 'present' ? '✓' : ''}</td>
                <td className="border border-black px-2 py-1 text-center">{st === 'absent' ? '✓' : ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex justify-between mt-4 text-xs">
        <p>Present: <strong>{present}</strong></p>
        <p>Absent: <strong>{absent}</strong></p>
        <p>Total: <strong>{students.length}</strong></p>
      </div>

      <div className="mt-10 text-xs flex justify-between">
        <p>Class Teacher: ______________________</p>
        <p>Date: ______________________</p>
      </div>
    </div>
  );
}