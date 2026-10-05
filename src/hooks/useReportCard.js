import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useReportCard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReportCard = useCallback(async ({ studentId, term }) => {
    if (!studentId) return null;
    setLoading(true);
    setError(null);

    const idNum = Number(studentId);

    // 1. Student
    const { data: student, error: sErr } = await supabase
      .from('students')
      .select('*')
      .eq('id', idNum)
      .single();

    if (sErr) {
      setError(sErr.message);
      setLoading(false);
      return null;
    }

    // 2. Marks — fetch ALL for this student, filter term in JS to avoid case mismatch
    const { data: marks, error: mErr } = await supabase
      .from('marks')
      .select('id, student_id, subject, score, competency_level, exam_name, term, assessment_type, strand, sub_strand, teacher_comment, date')
      .eq('student_id', idNum)
      .order('subject', { ascending: true })
      .order('date', { ascending: true });

    if (mErr) {
      setError(mErr.message);
      setLoading(false);
      return null;
    }

    const filtered = (marks || []).filter(m => {
      if (!term) return true;
      return String(m.term || '').trim().toLowerCase() === String(term).trim().toLowerCase();
    });

    // 3. Group by subject
    const bySubject = {};
    filtered.forEach(m => {
      const key = m.subject || 'Unspecified';
      if (!bySubject[key]) {
        bySubject[key] = {
          subject: key,
          assessments: [],
          scores: [],
          levels: [],
          comments: [],
        };
      }
      const entry = bySubject[key];
      entry.assessments.push({
        exam_name: m.exam_name,
        assessment_type: m.assessment_type,
        score: m.score,
        competency_level: m.competency_level,
        strand: m.strand,
        sub_strand: m.sub_strand,
        term: m.term,
        date: m.date,
      });
      if (typeof m.score === 'number') entry.scores.push(m.score);
      if (m.competency_level) entry.levels.push(m.competency_level);
      if (m.teacher_comment) entry.comments.push(m.teacher_comment);
    });

    const subjects = Object.values(bySubject).map(s => {
      const avg = s.scores.length
        ? Math.round(s.scores.reduce((a, b) => a + b, 0) / s.scores.length)
        : null;
      const level = pickOverallLevel(s.levels);
      return {
        subject: s.subject,
        assessments: s.assessments,
        average: avg,
        overallLevel: level,
        comment: s.comments[s.comments.length - 1] || null,
      };
    });

    // 4. Overall breakdown
    const levelCounts = { EE: 0, ME: 0, AE: 0, BE: 0 };
    filtered.forEach(m => {
      if (m.competency_level && levelCounts[m.competency_level] != null) {
        levelCounts[m.competency_level]++;
      }
    });

    const allScores = filtered
      .map(m => m.score)
      .filter(n => typeof n === 'number' && !isNaN(n));
    const overallAverage = allScores.length
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : null;

    const overallLevel = pickOverallLevel(
      Object.entries(levelCounts).flatMap(([k, v]) => Array(v).fill(k))
    );

    setLoading(false);
    return {
      student,
      term: term || null,
      subjects,
      levelCounts,
      overallAverage,
      overallLevel,
      assessmentsCount: filtered.length,
    };
  }, []);

  return { fetchReportCard, loading, error };
}

function pickOverallLevel(levels) {
  if (!levels || !levels.length) return null;
  const counts = { EE: 0, ME: 0, AE: 0, BE: 0 };
  levels.forEach(l => { if (counts[l] != null) counts[l]++; });
  const order = ['EE', 'ME', 'AE', 'BE'];
  let best = null;
  let bestCount = -1;
  order.forEach(l => {
    if (counts[l] > bestCount) {
      best = l;
      bestCount = counts[l];
    }
  });
  return bestCount > 0 ? best : null;
}