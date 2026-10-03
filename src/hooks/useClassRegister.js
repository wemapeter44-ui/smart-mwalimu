import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTeacher } from '../contexts/TeacherContext';
import { useRealtimeTable } from './useRealtimeTable';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function useClassRegister(date = todayISO()) {
  const { teacher, isClassTeacher } = useTeacher();
  const [students, setStudents] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedAt, setSavedAt] = useState(null);

  const load = useCallback(async () => {
    if (!teacher || !isClassTeacher || !teacher.class_form) {
      setStudents([]);
      setStatuses({});
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    let q = supabase
      .from('students')
      .select('id, name, admission_no, form, stream')
      .eq('form', teacher.class_form)
      .order('name', { ascending: true });
    if (teacher.class_stream) q = q.eq('stream', teacher.class_stream);

    const { data: studs, error: sErr } = await q;
    if (sErr) {
      setError(sErr.message);
      setStudents([]);
      setLoading(false);
      return;
    }

    const list = studs || [];
    setStudents(list);

    if (list.length) {
      const ids = list.map(s => s.id);
      const { data: att, error: aErr } = await supabase
        .from('attendance')
        .select('student_id, status')
        .eq('date', date)
        .in('student_id', ids);

      if (!aErr && att) {
        const map = {};
        att.forEach(a => { map[a.student_id] = a.status; });
        setStatuses(map);
        if (att.length) setSavedAt('existing');
      } else {
        setStatuses({});
      }
    }

    setLoading(false);
  }, [teacher, isClassTeacher, date]);

  useEffect(() => { load(); }, [load]);

  useRealtimeTable('students', () => load(), { enabled: !!teacher && isClassTeacher });
  useRealtimeTable('attendance', () => load(), { enabled: !!teacher && isClassTeacher });

  function setStatus(studentId, status) {
    setStatuses(prev => ({ ...prev, [studentId]: status }));
  }

  function bulkSet(status) {
    const next = {};
    students.forEach(s => { next[s.id] = status; });
    setStatuses(next);
  }

  const markedCount = Object.keys(statuses).length;
  const presentCount = Object.values(statuses).filter(s => s === 'present').length;
  const absentCount = Object.values(statuses).filter(s => s === 'absent').length;
  const allMarked = students.length > 0 && markedCount === students.length;

  async function save() {
    if (!teacher || !students.length) return;
    if (markedCount !== students.length) {
      throw new Error('Mark every student before saving.');
    }
    setSaving(true);
    try {
      const rows = students.map(s => ({
        student_id: s.id,
        date,
        status: statuses[s.id],
      }));

      const { error } = await supabase
        .from('attendance')
        .upsert(rows, { onConflict: 'student_id,date' });

      if (error) throw error;
      setSavedAt(new Date().toISOString());

      window.dispatchEvent(new CustomEvent('register-saved', {
        detail: { date, teacherId: teacher.id },
      }));

      return true;
    } finally {
      setSaving(false);
    }
  }

  return {
    students, statuses, loading, saving, error, savedAt,
    setStatus, bulkSet, save, refresh: load,
    markedCount, presentCount, absentCount, allMarked,
  };
}