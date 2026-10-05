import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent';

const SYSTEM_PROMPT = `You write concise, professional report card comments for a Kenyan high school following the Competency-Based Curriculum (CBE).

Given a student's term performance across subjects, write ONE overall teacher comment of 2-3 sentences in English.

Rules:
- Start with the student's first name.
- Mention strengths (subjects where level is EE or ME) and areas needing support (AE or BE).
- Reference attendance if provided.
- End with a short, encouraging forward-looking statement.
- Do not use emojis.
- Do not exceed 60 words.
- Return ONLY the comment text, no headings, no quotes, no extra formatting.`;

export function useAiReportComment() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = useCallback(async ({ student, term, subjects, overallAverage, overallLevel, attendance }) => {
    if (!GEMINI_API_KEY) {
      setError('Gemini API key missing.');
      return null;
    }
    if (!student) {
      setError('No student selected.');
      return null;
    }

    setLoading(true);
    setError(null);

    const subjectLines = (subjects || []).map(s =>
      `- ${s.subject}: avg ${s.average ?? '—'}, level ${s.overallLevel || '—'}`
    ).join('\n');

    const context = `
Student: ${student.name}
Grade: ${student.form || '—'}${student.stream ? ' ' + student.stream : ''}
Term: ${term}

Overall average: ${overallAverage != null ? overallAverage : 'N/A'}
Overall competency level: ${overallLevel || 'N/A'}
Attendance (percent present): ${attendance?.percent != null ? attendance.percent + '%' : 'N/A'}

Per-subject performance:
${subjectLines || '(no marks recorded)'}

Write the overall comment.`;

    try {
      const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: context }] }],
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Gemini error ${res.status}: ${errBody.slice(0, 200)}`);
      }

      const json = await res.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      const cleaned = text.replace(/^["']|["']$/g, '').trim();

      // Upsert into DB
      if (cleaned) {
        const { error: upErr } = await supabase
          .from('report_comments')
          .upsert(
            {
              student_id: student.id,
              term,
              comment: cleaned,
              generated_by: user?.id,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'student_id,term' }
          );
        if (upErr) console.warn('Report comment save failed:', upErr.message);
      }

      setLoading(false);
      return cleaned;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  }, [user]);

  const fetchSaved = useCallback(async ({ studentId, term }) => {
    if (!studentId || !term) return null;
    const { data, error } = await supabase
      .from('report_comments')
      .select('comment, updated_at')
      .eq('student_id', studentId)
      .eq('term', term)
      .maybeSingle();
    if (error) return null;
    return data?.comment || null;
  }, []);

  return { generate, fetchSaved, loading, error };
}