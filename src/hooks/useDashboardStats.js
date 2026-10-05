import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTeacher } from '../contexts/TeacherContext';
import { usePolling } from './usePolling';
import { todayDayNumber, nowMinutes, toMinutes } from '../lib/dates';

export function useDashboardStats() {
  const { teacher, isClassTeacher } = useTeacher();
  const [stats, setStats] = useState({
    todaysClasses: [],
    nextClass: null,
    studentsCount: 0,
    attendanceMarked: null,
    classAverage: null,
  });
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!teacher) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const today = todayDayNumber();
    const todayISO = new Date().toISOString().slice(0, 10);

    let list = [];
    try {
      const { data, error } = await supabase
        .from('timetable')
        .select('*')
        .eq('teacher_id', teacher.id)
        .eq('day', today)
        .order('start_time', { ascending: true });
      if (!error) list = data || [];
    } catch (e) { /* ignore */ }

    const now = nowMinutes();
    const next = list.find(c => toMinutes(c.start_time) > now) || null;

    let studentsCount = 0;
    let attendanceMarked = null;
    let classAverage = null;

    if (isClassTeacher && teacher.class_form) {
      try {
        let q = supabase
          .from('students')
          .select('id', { count: 'exact', head: true })
          .eq('form', teacher.class_form);
        if (teacher.class_stream) q = q.eq('stream', teacher.class_stream);
        const { count } = await q;
        studentsCount = count || 0;
      } catch (e) { /* ignore */ }

      try {
        let sq = supabase
          .from('students')
          .select('id')
          .eq('form', teacher.class_form);
        if (teacher.class_stream) sq = sq.eq('stream', teacher.class_stream);
        const { data: myStudents } = await sq;
        const ids = (myStudents || []).map(s => s.id);
        if (ids.length) {
          const { count: attCount } = await supabase
            .from('attendance')
            .select('id', { count: 'exact', head: true })
            .eq('date', todayISO)
            .in('student_id', ids);
          attendanceMarked = (attCount || 0) > 0;
        } else {
          attendanceMarked = false;
        }
      } catch (e) { /* ignore */ }

      try {
        const { data: myStudents } = await supabase
          .from('students')
          .select('id')
          .eq('form', teacher.class_form)
          .eq('stream', teacher.class_stream || '');
        const ids = (myStudents || []).map(s => s.id);
        if (ids.length) {
          const { data: markRows } = await supabase
            .from('marks')
            .select('score')
            .in('student_id', ids);
          const scores = (markRows || []).map(m => m.score).filter(n => typeof n === 'number');
          if (scores.length) {
            classAverage = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
          }
        }
      } catch (e) { /* ignore */ }
    }

    setStats({
      todaysClasses: list,
      nextClass: next,
      studentsCount,
      attendanceMarked,
      classAverage,
    });

    try {
      const { data: anns } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      setAnnouncements(anns || []);
    } catch (e) {
      setAnnouncements([]);
    }

    setLoading(false);
  }, [teacher, isClassTeacher]);

  useEffect(() => { load(); }, [load]);

  // Silent poll every 20s
  usePolling(() => { load(); }, 20000, !!teacher);

  useEffect(() => {
    function handleSaved() { load(); }
    window.addEventListener('register-saved', handleSaved);
    return () => window.removeEventListener('register-saved', handleSaved);
  }, [load]);

  return { stats, announcements, loading, refresh: load };
}