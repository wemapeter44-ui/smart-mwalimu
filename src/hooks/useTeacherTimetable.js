import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTeacher } from '../contexts/TeacherContext';

export function useTeacherTimetable() {
  const { teacher } = useTeacher();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!teacher) {
      setClasses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('timetable')
      .select('*')
      .eq('teacher_id', teacher.id)
      .order('day', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      setError(error.message);
      setClasses([]);
    } else {
      setClasses(data || []);
    }
    setLoading(false);
  }, [teacher]);

  useEffect(() => { load(); }, [load]);

  async function addClass(payload) {
    if (!teacher) throw new Error('No teacher profile.');
    const { error } = await supabase.from('timetable').insert({
      teacher_id: teacher.id,
      day: payload.day,
      start_time: payload.start_time,
      end_time: payload.end_time,
      subject: payload.subject,
      form: payload.form,
      stream: payload.stream || null,
    });
    if (error) throw error;
    await load();
  }

  async function updateClass(id, payload) {
    const { error } = await supabase
      .from('timetable')
      .update({
        day: payload.day,
        start_time: payload.start_time,
        end_time: payload.end_time,
        subject: payload.subject,
        form: payload.form,
        stream: payload.stream || null,
      })
      .eq('id', id);
    if (error) throw error;
    await load();
  }

  async function deleteClass(id) {
    const { error } = await supabase.from('timetable').delete().eq('id', id);
    if (error) throw error;
    await load();
  }

  return {
    classes, loading, error,
    refresh: load,
    addClass, updateClass, deleteClass,
  };
}