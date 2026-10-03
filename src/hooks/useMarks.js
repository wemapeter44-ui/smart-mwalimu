import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTeacher } from '../contexts/TeacherContext';
import { useRealtimeTable } from './useRealtimeTable';

export function useMarks() {
  const { teacher } = useTeacher();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastQuery, setLastQuery] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const loadMarks = useCallback(async ({ form, stream, exam, term, subject }) => {
    if (!form || !exam || !term || !subject) return { students: [], marks: {} };
    setLoading(true);
    setError(null);
    setLastQuery({ form, stream, exam, term, subject });

    let sq = supabase
      .from('students')
      .select('id, name, admission_no')
      .eq('form', form)
      .order('name', { ascending: true });
    if (stream) sq = sq.eq('stream', stream);

    const { data: studs, error: sErr } = await sq;
    if (sErr) {
      setError(sErr.message);
      setLoading(false);
      return { students: [], marks: {} };
    }

    const students = studs || [];
    if (!students.length) {
      setLoading(false);
      return { students: [], marks: {} };
    }

    const ids = students.map(s => s.id);
    const { data: markRows, error: mErr } = await supabase
      .from('marks')
      .select('id, student_id, score, exam_name, term, subject, date')
      .in('student_id', ids)
      .eq('subject', subject)
      .eq('exam_name', exam)
      .eq('term', term);

    if (mErr) {
      setError(mErr.message);
      setLoading(false);
      return { students, marks: {} };
    }

    const map = {};
    (markRows || []).forEach(m => { map[m.student_id] = { id: m.id, score: m.score }; });

    setLoading(false);
    return { students, marks: map };
  }, []);

  async function saveMarks({ form, stream, exam, term, subject, rows }) {
    if (!teacher) throw new Error('No teacher profile.');
    if (!subject) throw new Error('No subject selected.');

    const today = new Date().toISOString().slice(0, 10);
    const ids = rows.map(r => r.student_id);

    const { error: delErr } = await supabase
      .from('marks')
      .delete()
      .in('student_id', ids)
      .eq('subject', subject)
      .eq('exam_name', exam)
      .eq('term', term);
    if (delErr) throw delErr;

    const insertRows = rows.map(r => ({
      student_id: r.student_id,
      subject,
      exam_name: exam,
      term,
      score: Number(r.score),
      date: today,
    }));

    const { error: insErr } = await supabase.from('marks').insert(insertRows);
    if (insErr) throw insErr;

    return true;
  }

  function buildSummary(students, marks) {
    const scores = students
      .map(s => marks[s.id]?.score)
      .filter(n => typeof n === 'number' && !isNaN(n));

    const total = students.length;
    const entered = scores.length;
    const average = entered ? Math.round(scores.reduce((a, b) => a + b, 0) / entered) : null;
    const highest = entered ? Math.max(...scores) : null;
    const lowest = entered ? Math.min(...scores) : null;

    const needAttention = students
      .filter(s => {
        const sc = marks[s.id]?.score;
        return typeof sc === 'number' && sc < 50;
      })
      .map(s => ({ id: s.id, name: s.name, score: marks[s.id].score }));

    return { total, entered, average, highest, lowest, needAttention };
  }

  // Realtime: refetch current query
  useRealtimeTable('marks', async () => {
    if (lastQuery) {
      setRefreshTick(t => t + 1);
    }
  });

  return { loadMarks, saveMarks, buildSummary, loading, error, refreshTick };
}