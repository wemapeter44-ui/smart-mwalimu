/**
 * Auto-generate teacher comment from competency level + strand + score.
 * Template-based — no AI.
 */

const BASE_COMMENTS = {
  EE: [
    'Demonstrates excellent mastery. Keep it up.',
    'Outstanding performance. Well done.',
    'Exceeds expectations consistently.',
  ],
  ME: [
    'Meets expectations. Continue working hard.',
    'Good performance. Stay consistent.',
    'Achieved the expected standard.',
  ],
  AE: [
    'Approaching expectations. Needs extra practice.',
    'Requires more effort to reach expectations.',
    'Room for improvement. Practice more.',
  ],
  BE: [
    'Needs close support.',
    'Below expectations. Additional help required.',
    'Requires regular guidance and consistent practice.',
  ],
};

const STRAND_PREFIX = {
  EE: 'Excellent command in',
  ME: 'Doing well in',
  AE: 'Needs practice in',
  BE: 'Needs significant support in',
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateComment({ level, strand, subStrand, score }) {
  if (!level) return '';
  const base = pickRandom(BASE_COMMENTS[level] || BASE_COMMENTS.ME);

  const topic = subStrand || strand;
  if (topic) {
    const prefix = STRAND_PREFIX[level] || '';
    return `${prefix} ${topic}. ${base}`;
  }
  return base;
}

export function shortComment({ level }) {
  if (!level) return '';
  const map = {
    EE: 'Excellent',
    ME: 'Good',
    AE: 'Fair',
    BE: 'Needs support',
  };
  return map[level] || '';
}