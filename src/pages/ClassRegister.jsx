import { useState } from 'react';
import { useTeacher } from '../contexts/TeacherContext';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { useClassRegister } from '../hooks/useClassRegister';
import { prettyDate } from '../lib/dates';
import RegisterRow from '../components/register/RegisterRow';
import RegisterSummary from '../components/register/RegisterSummary';
import RegisterPrintView from '../components/register/RegisterPrintView';

export default function ClassRegister() {
  const { teacher, isClassTeacher } = useTeacher();
  const toast = useToast();
  const { confirm } = useConfirm();

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const {
    students, statuses, loading, saving, error, savedAt,
    setStatus, bulkSet, save,
    markedCount, presentCount, absentCount, allMarked,
  } = useClassRegister(date);

  if (!isClassTeacher || !teacher?.class_form) {
    return (
      <div className="p-6">
        <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-8 text-center">
          <h2 className="text-sm font-semibold text-white">Not a class teacher</h2>
          <p className="text-xs text-blue-400 mt-2">
            Class register is only available to form teachers.
          </p>
        </div>
      </div>
    );
  }

  const classLabel = `${teacher.class_form}${teacher.class_stream ? ' ' + teacher.class_stream : ''}`;

  async function handleSave() {
    const ok = await confirm({
      title: 'Save class register?',
      message: `Record attendance for ${students.length} students on ${prettyDate(new Date(date))}. You can edit again later.`,
      confirmText: 'Save register',
      danger: false,
    });
    if (!ok) return;
    try {
      await save();
      toast.success(`Register saved for ${classLabel}.`, 'Attendance recorded');
    } catch (err) {
      toast.error(err.message || 'Failed to save register.');
    }
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-white">Class Register — {classLabel}</h1>
          <p className="text-xs text-blue-400 mt-1">{prettyDate(new Date(date))}</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="bg-[#0a1628] border border-blue-900/60 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={() => window.print()}
            className="text-xs text-blue-300 hover:text-white px-3 py-2 rounded-md border border-blue-900/60 hover:bg-blue-900/40 transition"
          >
            Print
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {!loading && students.length > 0 && (
        <RegisterSummary
          total={students.length}
          present={presentCount}
          absent={absentCount}
          marked={markedCount}
          savedAt={savedAt}
        />
      )}

      {!loading && students.length > 0 && (
        <div className="flex items-center justify-end gap-2 mb-3 print:hidden">
          <button
            onClick={() => bulkSet('present')}
            className="text-[11px] text-green-400 border border-green-500/40 hover:bg-green-500/10 rounded-md px-3 py-1.5 transition"
          >
            Mark all present
          </button>
          <button
            onClick={() => bulkSet('absent')}
            className="text-[11px] text-red-400 border border-red-500/40 hover:bg-red-500/10 rounded-md px-3 py-1.5 transition"
          >
            Mark all absent
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-6 text-center">
          <p className="text-xs text-blue-400">Loading students...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-10 text-center">
          <p className="text-sm text-blue-300">No students in your class yet.</p>
          <p className="text-xs text-blue-500 mt-1">Add students from the Students page.</p>
        </div>
      ) : (
        <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg overflow-hidden print:hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-blue-900/40">
                <th className="text-left text-[10px] uppercase tracking-wider text-blue-500 font-semibold px-3 py-2.5 w-10">#</th>
                <th className="text-left text-[10px] uppercase tracking-wider text-blue-500 font-semibold px-3 py-2.5">Name</th>
                <th className="text-left text-[10px] uppercase tracking-wider text-blue-500 font-semibold px-3 py-2.5 hidden sm:table-cell">Admission</th>
                <th className="text-right text-[10px] uppercase tracking-wider text-blue-500 font-semibold px-3 py-2.5 w-52">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <RegisterRow
                  key={s.id}
                  index={i}
                  student={s}
                  status={statuses[s.id]}
                  onSet={setStatus}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && students.length > 0 && (
        <div className="mt-5 flex justify-end print:hidden">
          <button
            onClick={handleSave}
            disabled={!allMarked || saving}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-md transition"
          >
            {saving ? 'Saving...' : allMarked ? 'Save register' : `Mark all (${markedCount}/${students.length})`}
          </button>
        </div>
      )}

      <RegisterPrintView
        students={students}
        statuses={statuses}
        teacher={teacher}
        classLabel={classLabel}
        date={date}
      />
    </div>
  );
}