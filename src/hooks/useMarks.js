import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTeacher } from '../contexts/TeacherContext';

export function useMarks() {
  const { teacher } = useTeacher();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadMarks = useCallback(async ({ form, stream, term, subject, assessmentType, strand, subStrand }) => {
    if (!form || !term || !subject) return { students: [], marks: {} };
    setLoading(true);
    setError(null);

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
    let q = supabase
      .from('marks')
      .select('id, student_id, score, competency_level, strand, sub_strand, teacher_comment, term, subject, assessment_type, date')
      .in('student_id', ids)
      .eq('subject', subject)
      .eq('term', term);
    if (assessmentType) q = q.eq('assessment_type', assessmentType);
    if (strand) q = q.eq('strand', strand);
    if (subStrand) q = q.eq('sub_strand', subStrand);

    const { data: markRows, error: mErr } = await q;
    if (mErr) {
      setError(mErr.message);
      setLoading(false);
      return { students, marks: {} };
    }

    const map = {};
    (markRows || []).forEach(m => {
      map[m.student_id] = {
        id: m.id,
        score: m.score,
        competency_level: m.competency_level,
        strand: m.strand,
        sub_strand: m.sub_strand,
        teacher_comment: m.teacher_comment,
      };
    });

    setLoading(false);
    return { students, marks: map };
  }, []);

  async function saveMarks({ form, stream, term, subject, assessmentType, strand, subStrand, rows }) {
    if (!teacher) throw new Error('No teacher profile.');
    if (!subject) throw new Error('No subject selected.');

    const today = new Date().toISOString().slice(0, 10);
    const ids = rows.map(r => r.student_id);

    let delQ = supabase
      .from('marks')
      .delete()
      .in('student_id', ids)
      .eq('subject', subject)
      .eq('term', term);
    if (assessmentType) delQ = delQ.eq('assessment_type', assessmentType);
    if (strand) delQ = delQ.eq('strand', strand);
    if (subStrand) delQ = delQ.eq('sub_strand', subStrand);
    const { error: delErr } = await delQ;
    if (delErr) throw delErr;

    const insertRows = rows.map(r => ({
      student_id: r.student_id,
      subject,
      term,
      score: r.score != null ? Number(r.score) : null,
      competency_level: r.competency_level || null,
      strand: strand || null,
      sub_strand: subStrand || null,
      assessment_type: assessmentType || null,
      teacher_comment: r.teacher_comment || null,
      date: today,
    }));

    const { error: insErr } = await supabase.from('marks').insert(insertRows);
    if (insErr) throw insErr;

    return true;
  }

  function buildSummary(students, marks) {
    const levels = { EE: 0, ME: 0, AE: 0, BE: 0, none: 0 };
    students.forEach(s => {
      const lvl = marks[s.id]?.competency_level;
      if (lvl && levels[lvl] != null) levels[lvl]++;
      else levels.none++;
    });

    const entered = students.length - levels.none;
    const total = students.length;

    const scores = students
      .map(s => marks[s.id]?.score)
      .filter(n => typeof n === 'number' && !isNaN(n));
    const average = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

    const needAttention = students
      .filter(s => {
        const lvl = marks[s.id]?.competency_level;
        return lvl === 'BE' || lvl === 'AE';
      })
      .map(s => ({
        id: s.id,
        name: s.name,
        level: marks[s.id]?.competency_level,
      }));

    return { total, entered, levels, average, needAttention };
  }

  return { loadMarks, saveMarks, buildSummary, loading, error };
}