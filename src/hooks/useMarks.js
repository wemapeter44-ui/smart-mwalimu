import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTeacher } from '../contexts/TeacherContext';

export function useMarks() {
  const { teacher } = useTeacher();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load marks for a specific form + stream + exam + term + subject.
   * Returns: { students: [...], marks: { student_id: { id, score } } }
   */
  const loadMarks = useCallback(async ({ form, stream, exam, term, subject }) => {
    if (!form || !exam || !term || !subject) return { students: [], marks: {} };
    setLoading(true);
    setError(null);

    // 1. Students
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

    // 2. Existing marks for these students + subject + exam + term
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

  /**
   * Upsert marks. rows = [{ student_id, score }] — all for the same
   * subject/exam/term (from teacher + form fields).
   */
  async function saveMarks({ form, stream, exam, term, subject, rows }) {
    if (!teacher) throw new Error('No teacher profile.');
    if (!subject) throw new Error('No subject on your profile.');

    const today = new Date().toISOString().slice(0, 10);

    // Delete existing rows for this combo (safe overwrite) then insert fresh.
    // Only touches rows matching this subject+exam+term for these students.
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

  /**
   * Summary stats from a marks map + students list.
   */
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

  return { loadMarks, saveMarks, buildSummary, loading, error };
}