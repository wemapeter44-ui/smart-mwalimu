import { useState, useMemo } from 'react';
import { useTeacher } from '../contexts/TeacherContext';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { useMarks } from '../hooks/useMarks';
import { FORMS, STREAMS, EXAMS, TERMS } from '../lib/constants';
import MarksSummary from '../components/marks/MarksSummary';
import MarksEntryTable from '../components/marks/MarksEntryTable';
import MarksPrintView from '../components/marks/MarksPrintView';

export default function Marks() {
  const { teacher } = useTeacher();
  const toast = useToast();
  const { confirm } = useConfirm();
  const { loadMarks, saveMarks, buildSummary, loading } = useMarks();

  const mySubjects = teacher?.subjects?.length
    ? teacher.subjects
    : (teacher?.subject ? [teacher.subject] : []);

  const [subject, setSubject] = useState('');
  const [form, setForm] = useState('');
  const [stream, setStream] = useState('');
  const [exam, setExam] = useState('');
  const [term, setTerm] = useState('Term 1');
  const [students, setStudents] = useState([]);
  const [values, setValues] = useState({});
  const [loadedKey, setLoadedKey] = useState(null);
  const [saving, setSaving] = useState(false);

  const ready = form && exam && term && subject;

  const key = useMemo(
    () => `${form}|${stream}|${exam}|${term}|${subject}`,
    [form, stream, exam, term, subject]
  );

  async function handleLoad() {
    if (!ready) return;
    const { students: studs, marks } = await loadMarks({ form, stream, exam, term, subject });
    setStudents(studs);
    const init = {};
    studs.forEach(s => {
      init[s.id] = marks[s.id]?.score ?? '';
    });
    setValues(init);
    setLoadedKey(key);
  }

  function updateValue(studentId, value) {
    setValues(prev => ({ ...prev, [studentId]: value }));
  }

  const summary = useMemo(
    () => buildSummary(students, Object.fromEntries(
      Object.entries(values).map(([id, v]) => [id, { score: v === '' ? null : Number(v) }])
    )),
    [students, values, buildSummary]
  );

  async function handleSave() {
    if (!students.length) return;
    const filled = students.filter(s => values[s.id] !== '' && values[s.id] != null);
    if (filled.length === 0) {
      toast.error('Enter at least one score before saving.');
      return;
    }
    const invalid = filled.find(s => {
      const n = Number(values[s.id]);
      return isNaN(n) || n < 0 || n > 100;
    });
    if (invalid) {
      toast.error(`Invalid score for ${invalid.name}. Scores must be 0–100.`);
      return;
    }

    const ok = await confirm({
      title: 'Save marks?',
      message: `Save ${subject} — ${exam} (${term}) for ${filled.length} students. Existing entries for this exam will be replaced.`,
      confirmText: 'Save marks',
      danger: false,
    });
    if (!ok) return;

    try {
      setSaving(true);
      const rows = filled.map(s => ({
        student_id: s.id,
        score: Number(values[s.id]),
      }));
      await saveMarks({ form, stream, exam, term, subject, rows });
      toast.success(`Marks saved for ${form}${stream ? ' ' + stream : ''}.`, 'Saved');
    } catch (err) {
      toast.error(err.message || 'Failed to save marks.');
    } finally {
      setSaving(false);
    }
  }

  if (mySubjects.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-8 text-center">
          <h2 className="text-sm font-semibold text-white">No subjects on your profile</h2>
          <p className="text-xs text-blue-400 mt-2">
            Contact admin to set your subjects before entering marks.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-5">
        <h1 className="text-lg font-bold text-white">Marks</h1>
        <p className="text-xs text-blue-400 mt-1">
          Enter scores per exam and print for the senior master.
        </p>
      </div>

      <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-4 mb-5 print:hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Field label="Subject">
            <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500">
              <option value="">—</option>
              {mySubjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Form">
            <select value={form} onChange={e => setForm(e.target.value)} className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500">
              <option value="">—</option>
              {FORMS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </Field>
          <Field label="Stream">
            <select value={stream} onChange={e => setStream(e.target.value)} className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500">
              <option value="">Any</option>
              {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Exam">
            <select value={exam} onChange={e => setExam(e.target.value)} className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500">
              <option value="">—</option>
              {EXAMS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </Field>
          <Field label="Term">
            <select value={term} onChange={e => setTerm(e.target.value)} className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500">
              {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <div className="flex items-end">
            <button
              onClick={handleLoad}
              disabled={!ready || loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-md px-3 py-2 transition"
            >
              {loading ? 'Loading...' : 'Load students'}
            </button>
          </div>
        </div>
      </div>

      {loadedKey === key && students.length > 0 && (
        <>
          <MarksSummary summary={summary} subject={subject} exam={exam} term={term} />

          <MarksEntryTable
            students={students}
            values={values}
            onChange={updateValue}
          />

          <div className="mt-4 flex items-center justify-between print:hidden">
            <button
              onClick={() => window.print()}
              className="text-xs text-blue-300 hover:text-white px-4 py-2 rounded-md border border-blue-900/60 hover:bg-blue-900/40 transition"
            >
              Print mark sheet
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-md transition"
            >
              {saving ? 'Saving...' : 'Save marks'}
            </button>
          </div>
        </>
      )}

      {loadedKey === key && students.length === 0 && (
        <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-10 text-center">
          <p className="text-sm text-blue-300">No students found for {form}{stream ? ' ' + stream : ''}.</p>
        </div>
      )}

      <MarksPrintView
        students={students}
        values={values}
        subject={subject}
        exam={exam}
        term={term}
        form={form}
        stream={stream}
        teacher={teacher}
      />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider text-blue-400 mb-1">{label}</label>
      {children}
    </div>
  );
}