import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTeacher } from '../contexts/TeacherContext';
import { useRealtimeTable } from './useRealtimeTable';

export function useTeacherTimetable() {
  const { teacher } = useTeacher();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const skipRealtimeRef = { current: false };

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

  // Realtime — refetch (debounced) but only from external changes
  useRealtimeTable('timetable', () => {
    if (skipRealtimeRef.current) return;
    load();
  }, { enabled: !!teacher });

  function sortClasses(list) {
    return [...list].sort((a, b) =>
      Number(a.day) - Number(b.day) || a.start_time.localeCompare(b.start_time)
    );
  }

  async function addClass(payload) {
    if (!teacher) throw new Error('No teacher profile.');
    skipRealtimeRef.current = true;
    try {
      const { data, error } = await supabase
        .from('timetable')
        .insert({
          teacher_id: teacher.id,
          day: payload.day,
          start_time: payload.start_time,
          end_time: payload.end_time,
          subject: payload.subject,
          form: payload.form,
          stream: payload.stream || null,
        })
        .select()
        .single();
      if (error) throw error;
      setClasses(prev => sortClasses([...prev, data]));
    } finally {
      setTimeout(() => { skipRealtimeRef.current = false; }, 500);
    }
  }

  async function updateClass(id, payload) {
    skipRealtimeRef.current = true;
    try {
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
      setClasses(prev => sortClasses(
        prev.map(c => c.id === id ? { ...c, ...payload, stream: payload.stream || null } : c)
      ));
    } finally {
      setTimeout(() => { skipRealtimeRef.current = false; }, 500);
    }
  }

  async function deleteClass(id) {
    skipRealtimeRef.current = true;
    try {
      const { error } = await supabase.from('timetable').delete().eq('id', id);
      if (error) throw error;
      setClasses(prev => prev.filter(c => c.id !== id));
    } finally {
      setTimeout(() => { skipRealtimeRef.current = false; }, 500);
    }
  }

  return {
    classes, loading, error,
    refresh: load,
    addClass, updateClass, deleteClass,
  };
}