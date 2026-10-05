import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTeacher } from '../contexts/TeacherContext';
import { useToast } from '../contexts/ToastContext';
import { useReportCard } from '../hooks/useReportCard';
import { usePolling } from '../hooks/usePolling';
import { FORMS, STREAMS, TERMS } from '../lib/constants';
import ReportCardView from '../components/report/ReportCardView';
import ReportCardPrint from '../components/report/ReportCardPrint';

export default function ReportCard() {
  const { teacher, isClassTeacher } = useTeacher();
  const toast = useToast();
  const { fetchReportCard, loading } = useReportCard();

  const [form, setForm] = useState('');
  const [stream, setStream] = useState('');
  const [term, setTerm] = useState('Term 1');
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (isClassTeacher && teacher?.class_form) {
      setForm(teacher.class_form);
      setStream(teacher.class_stream || '');
    }
  }, [isClassTeacher, teacher]);

  useEffect(() => {
    let alive = true;
    async function loadStudents() {
      if (!form) { setStudents([]); return; }
      let q = supabase
        .from('students')
        .select('id, name, admission_no, form, stream')
        .eq('form', form)
        .order('name');
      if (stream) q = q.eq('stream', stream);
      const { data } = await q;
      if (alive) setStudents(data || []);
    }
    loadStudents();
    return () => { alive = false; };
  }, [form, stream]);

  // Auto-load report when student or term changes
  useEffect(() => {
    if (!selectedId) { setReport(null); return; }
    let alive = true;
    (async () => {
      const r = await fetchReportCard({ studentId: Number(selectedId), term });
      if (alive) setReport(r);
    })();
    return () => { alive = false; };
  }, [selectedId, term, fetchReportCard]);

  // Silent poll every 20s to pick up new marks
  usePolling(async () => {
    if (!selectedId) return;
    const r = await fetchReportCard({ studentId: Number(selectedId), term });
    if (r) setReport(r);
  }, 20000, !!selectedId);

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-5">
        <h1 className="text-lg font-bold text-white">Report Card</h1>
        <p className="text-xs text-blue-400 mt-1">
          CBE competency-based report per student. Auto-updates.
        </p>
      </div>

      <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-4 mb-5 print:hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
          <Field label="Student">
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500">
              <option value="">Select student</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.admission_no})</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            onClick={() => window.print()}
            disabled={!report}
            className="text-xs text-blue-300 hover:text-white px-4 py-2 rounded-md border border-blue-900/60 hover:bg-blue-900/40 transition disabled:opacity-50"
          >
            Print
          </button>
        </div>
      </div>

      {loading && !report && (
        <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-10 text-center">
          <p className="text-sm text-blue-300">Loading report...</p>
        </div>
      )}

      {report && <ReportCardView report={report} />}

      {!report && !loading && (
        <div className="bg-[#0d1e35] border border-blue-900/40 rounded-lg p-10 text-center">
          <p className="text-sm text-blue-300">Select a student to load report.</p>
        </div>
      )}

      <ReportCardPrint report={report} teacher={teacher} />
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