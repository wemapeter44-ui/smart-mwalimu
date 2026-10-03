import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTeacher } from '../contexts/TeacherContext';

export function useClassStudents() {
  const { teacher, isClassTeacher } = useTeacher();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!teacher || !isClassTeacher || !teacher.class_form) {
      setStudents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    let q = supabase
      .from('students')
      .select('*')
      .eq('form', teacher.class_form)
      .order('name', { ascending: true });
    if (teacher.class_stream) q = q.eq('stream', teacher.class_stream);

    const { data, error } = await q;
    if (error) {
      setError(error.message);
      setStudents([]);
    } else {
      setStudents(data || []);
    }
    setLoading(false);
  }, [teacher, isClassTeacher]);

  useEffect(() => { load(); }, [load]);

  async function addStudent({ name, admission_no }) {
    if (!teacher?.class_form) throw new Error('No class assigned to you.');
    const { error } = await supabase.from('students').insert({
      name: name.trim(),
      admission_no: admission_no.trim(),
      form: teacher.class_form,
      stream: teacher.class_stream || null,
    });
    if (error) throw error;
    await load();
  }

  async function removeStudent(id) {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) throw error;
    await load();
  }

  return { students, loading, error, refresh: load, addStudent, removeStudent };
}

/* ---------- Stats engine ---------- */

export async function fetchStudentStats(studentId) {
  const [attendanceRes, marksRes] = await Promise.all([
    supabase
      .from('attendance')
      .select('status, date')
      .eq('student_id', studentId)
      .order('date', { ascending: false }),
    supabase
      .from('marks')
      .select('subject, score, exam_name, term, date')
      .eq('student_id', studentId)
      .order('date', { ascending: true }),
  ]);

  const attendance = attendanceRes.data || [];
  const marks = marksRes.data || [];

  /* Attendance */
  const present = attendance.filter(a => a.status === 'present').length;
  const absent = attendance.filter(a => a.status === 'absent').length;
  const late = attendance.filter(a => a.status === 'late').length;
  const totalAtt = attendance.length;
  const attPercent = totalAtt ? Math.round((present / totalAtt) * 100) : null;

  /* Overall average */
  const validMarks = marks.filter(m => typeof m.score === 'number' && !isNaN(m.score));
  const average = validMarks.length
    ? Math.round(validMarks.reduce((a, m) => a + m.score, 0) / validMarks.length)
    : null;

  /* Trend: compare last two chronological scores (by date) */
  let trend = null; // 'up' | 'down' | 'flat' | null
  let trendDelta = 0;
  if (validMarks.length >= 2) {
    const last = validMarks[validMarks.length - 1].score;
    const prev = validMarks[validMarks.length - 2].score;
    trendDelta = last - prev;
    if (trendDelta > 2) trend = 'up';
    else if (trendDelta < -2) trend = 'down';
    else trend = 'flat';
  }

  /* Per-subject breakdown */
  const bySubject = {};
  validMarks.forEach(m => {
    const key = m.subject || 'Unspecified';
    if (!bySubject[key]) bySubject[key] = { total: 0, count: 0, scores: [] };
    bySubject[key].total += m.score;
    bySubject[key].count += 1;
    bySubject[key].scores.push(m.score);
  });
  const subjectBreakdown = Object.entries(bySubject)
    .map(([subject, v]) => ({
      subject,
      average: Math.round(v.total / v.count),
      count: v.count,
      best: Math.max(...v.scores),
      worst: Math.min(...v.scores),
    }))
    .sort((a, b) => b.average - a.average);

  /* Recent marks: last 5 (descending) */
  const recentMarks = [...marks].reverse().slice(0, 5);

  /* Chronological scores for the trend chart (max 12) */
  const trendPoints = validMarks.slice(-12).map(m => ({
    score: m.score,
    label: m.exam_name || '',
    subject: m.subject || '',
  }));

  return {
    attendance: { present, absent, late, total: totalAtt, percent: attPercent },
    average,
    marksCount: validMarks.length,
    trend,
    trendDelta,
    subjectBreakdown,
    recentMarks,
    trendPoints,
  };
}