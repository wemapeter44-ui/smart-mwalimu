import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const TeacherContext = createContext({});

export function TeacherProvider({ children }) {
  const { user } = useAuth();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeacher() {
      if (!user) {
        setTeacher(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) console.error('Teacher fetch error:', error);
      setTeacher(data || null);
      setLoading(false);
    }

    fetchTeacher();
  }, [user]);

  const isClassTeacher = teacher?.is_class_teacher === true;
  const subjects = teacher?.subjects?.length
    ? teacher.subjects
    : (teacher?.subject ? [teacher.subject] : []);

  return (
    <TeacherContext.Provider value={{ teacher, isClassTeacher, subjects, loading }}>
      {children}
    </TeacherContext.Provider>
  );
}

export function useTeacher() {
  return useContext(TeacherContext);
}