import { useState, useMemo } from 'react';
import { useTeacher } from '../contexts/TeacherContext';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { useMarks } from '../hooks/useMarks';
import {
  FORMS,
  STREAMS,
  TERMS,
  ASSESSMENT_TYPES,
  scoreToLevel,
} from '../lib/constants';
import { generateComment } from '../lib/autoComment';
import MarksSummary from '../components/marks/MarksSummary';
import MarksEntryTable from '../components/marks/MarksEntryTable';
import MarksPrintView from '../components/marks/MarksPrintView';

export default function Marks() {
  const { teacher, subjects: mySubjects } = useTeacher();
  const toast = useToast();
  const { confirm } = useConfirm();
  const { loadMarks, saveMarks, buildSummary, loading } = useMarks();

  const [subject, setSubject] = useState('');
  const [form, setForm] = useState('');
  const [stream, setStream] = useState('');
  const [term, setTerm] = useState('Term 1');
  const [assessmentType, setAssessmentType] = useState('SBA');
  const [strand, setStrand] = useState('');
  const [subStrand, setSubStrand] = useState('');

  const [students, setStudents] = useState([]);
  const [values, setValues] = useState({});
  const [loadedKey, setLoadedKey] = useState(null);
  const [saving, setSaving] = useState(false);

  const ready = form && term && subject;

  const key = useMemo(
    () => `${form}|${stream}|${term}|${subject}|${assessmentType}|${strand}|${subStrand}`,
    [form, stream, term, subject, assessmentType, strand, subStrand]
  );

  async function handleLoad() {
    if (!ready) return;
    const { students: studs, marks } = await loadMarks({
      form, stream, term, subject, assessmentType, strand, subStrand,
    });
    setStudents(studs);
    const init = {};
    studs.forEach(s => {
      const m = marks[s.id];
      init[s.id] = {
        score: m?.score ?? '',
        competency_level: m?.competency_level || '',
        teacher_comment: m?.teacher_comment || '',
      };
    });
    setValues(init);
    setLoadedKey(key);
  }

  function updateValue(studentId, patch) {
    setValues(prev => {
      const current = prev[studentId] || {};
      const next = { ...current, ...patch };

      // Auto-set level from score, and auto-generate comment
      const scoreChanged = patch.score !== undefined;
      const levelChanged = patch.competency_level !== undefined;

      if (scoreChanged && !levelChanged) {
        const n = Number(patch.score);
        if (!isNaN(n) && patch.score !== '') {
          next.competency_level = scoreToLevel(n);
        } else {
          next.competency_level = '';
        }
      }

      // Auto-generate comment whenever level changes (from either path)
      if (scoreChanged || levelChanged) {
        const newLevel = next.competency_level;
        const commentTouched = patch.teacher_comment !== undefined;
        if (!commentTouched && newLevel) {
          next.teacher_comment = generateComment({
            level: newLevel,
            strand,
            subStrand,
            score: Number(next.score),
          });
        } else if (!newLevel && !commentTouched) {
          next.teacher_comment = '';
        }
      }

      return { ...prev, [studentId]: next };
    });
  }

  const summary = useMemo(() => {
    const marksMap = {};
    Object.entries(values).forEach(([id, v]) => {
      marksMap[id] = {
        score: v.score === '' ? null : Number(v.score),
        competency_level: v.competency_level || null,
      };
    });
    return buildSummary(students, marksMap);
  }, [students, values, buildSummary]);

  async function handleSave() {
    if (!students.length) return;
    const filled = students.filter(s => {
      const v = values[s.id];
      return v && (v.score !== '' || v.competency_level || v.teacher_comment);
    });
    if (filled.length === 0) {
      toast.error('Enter at least one score or competency level before saving.');
      return;
    }
    const invalid = filled.find(s => {
      const v = values[s.id];
      if (v.score === '' || v.score == null) return false;
      const n = Number(v.score);
      return isNaN(n) || n < 0 || n > 100;
    });
    if (invalid) {
      toast.error(`Invalid score for ${invalid.name}. Scores must be 0–100.`);
      return;
    }

    const ok = await confirm({
      title: 'Save marks?',
      message: `Save ${subject} (${term}${assessmentType ? ' · ' + assessmentType : ''}${strand ? ' · ' + strand : ''}) for ${filled.length} students. Existing entries will be replaced.`,
      confirmText: 'Save marks',
      danger: false,
    });
    if (!ok) return;

    try {
      setSaving(true);
      const rows = filled.map(s => ({
        student_id: s.id,
        score: values[s.id].score === '' ? null : Number(values[s.id].score),
        competency_level: values[s.id].competency_level || null,
        teacher_comment: values[s.id].teacher_comment || null,
      }));
      await saveMarks({
        form, stream, term, subject, assessmentType,
        strand, subStrand,
        rows,
      });
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
    <div className="p-6 max-w-5xl">
      <div className="mb-5">
        <h1 className="text-lg font-bold text-white">Marks — CBE Assessment</h1>
        <p className="text-xs text-blue-400 mt-1">
          Enter score, competency level, strand. Comments auto-generated (editable).
        </p>
      </div>

      <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-4 mb-5 print:hidden space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Field label="Subject">
            <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500">
              <option value="">—</option>
              {mySubjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Grade">
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
          <Field label="Term">
            <select value={term} onChange={e => setTerm(e.target.value)} className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500">
              {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Assessment">
            <select value={assessmentType} onChange={e => setAssessmentType(e.target.value)} className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500">
              <option value="">—</option>
              {ASSESSMENT_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Strand (optional)">
            <input
              type="text"
              value={strand}
              onChange={e => setStrand(e.target.value)}
              placeholder="e.g. Algebra"
              className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </Field>
          <Field label="Sub-strand (optional)">
            <input
              type="text"
              value={subStrand}
              onChange={e => setSubStrand(e.target.value)}
              placeholder="e.g. Quadratic Equations"
              className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
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
          <MarksSummary
            summary={summary}
            subject={subject}
            term={term}
            assessmentType={assessmentType}
            strand={strand}
            subStrand={subStrand}
          />

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
        term={term}
        form={form}
        stream={stream}
        teacher={teacher}
        strand={strand}
        subStrand={subStrand}
        assessmentType={assessmentType}
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