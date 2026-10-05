import { useState, useCallback } from 'react';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent';

const SYSTEM_PROMPT = `You are a data analyst for a Kenyan high school following the Competency-Based Curriculum (CBE).

You will receive marks data for a class. Analyze it and return:

1. **Class overview** (2-3 sentences): overall average, strongest strand, weakest strand, general observation.

2. **Students needing support** — those with AE (Approaching) or BE (Below) levels. For each, one short sentence on what they need.

3. **Top performers** — those with EE (Exceeding) levels. One short sentence each (positive reinforcement).

4. **Teaching recommendations** (2-4 bullet points): specific, practical actions the teacher can take next week. Reference strands where possible.

Return the response as plain text with clear headings and bullet points. Keep it under 400 words. Use English.`;

export function useAiInsights() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);

  const generateInsights = useCallback(async ({
    subject, grade, stream, term, assessmentType, strand, subStrand,
    students, marksMap,
  }) => {
    if (!GEMINI_API_KEY) {
      setError('Gemini API key missing.');
      return null;
    }
    if (!students.length) {
      setError('No students to analyze.');
      return null;
    }

    setLoading(true);
    setError(null);
    setInsights(null);

    // Build a compact data payload for the AI
    const rows = students.map(s => {
      const m = marksMap[s.id] || {};
      return {
        name: s.name,
        score: m.score ?? null,
        level: m.competency_level || null,
      };
    });

    const entered = rows.filter(r => r.score != null || r.level);
    const scores = rows.map(r => r.score).filter(n => typeof n === 'number');
    const avg = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

    const levelCounts = { EE: 0, ME: 0, AE: 0, BE: 0 };
    rows.forEach(r => { if (r.level && levelCounts[r.level] != null) levelCounts[r.level]++; });

    const context = `
School: The Ribe Boys High School (Kenya, CBE curriculum)
Subject: ${subject}
Grade: ${grade}${stream ? ' ' + stream : ''}
Term: ${term}
Assessment type: ${assessmentType || 'Not specified'}
Strand: ${strand || 'Not specified'}
Sub-strand: ${subStrand || 'Not specified'}

Class size: ${students.length}
Scores entered: ${entered.length}
Class average: ${avg != null ? avg : 'N/A'}
Competency distribution: EE=${levelCounts.EE}, ME=${levelCounts.ME}, AE=${levelCounts.AE}, BE=${levelCounts.BE}

Student data (name, score, level):
${rows.map(r => `- ${r.name}: ${r.score ?? '—'} (${r.level || '—'})`).join('\n')}

Generate the analysis as instructed.`;

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
      setInsights(text);
      return text;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  function clear() {
    setInsights(null);
    setError(null);
  }

  return { generateInsights, insights, loading, error, clear };
}