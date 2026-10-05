/* ============================
   SMART MWALIMU — CBE Constants
   Senior School (Grade 10-12)
   ============================ */

export const PATHWAYS = [
  'STEM',
  'Social Sciences',
  'Arts & Sports Science',
];

export const CORE_SUBJECTS = [
  'English',
  'Kiswahili',
  'Kenyan Sign Language',
  'Core Mathematics',
  'Essential Mathematics',
  'Community Service Learning',
];

export const STEM_ELECTIVES = [
  'Biology',
  'Chemistry',
  'Physics',
  'General Science',
  'Mathematics',
  'Agriculture',
  'Computer Science',
  'Home Science',
];

export const SOCIAL_SCIENCES_ELECTIVES = [
  'History and Citizenship',
  'Geography',
  'Christian Religious Education',
  'Islamic Religious Education',
  'Hindu Religious Education',
  'Business Studies',
  'Economics',
];

export const ARTS_SPORTS_ELECTIVES = [
  'Fine Art',
  'Music',
  'Theatre and Film',
  'Physical Education',
  'Sports Science',
  'Literature in English',
  'Fasihi ya Kiswahili',
  'Foreign Languages',
];

export const ALL_SUBJECTS = [
  ...CORE_SUBJECTS,
  ...STEM_ELECTIVES,
  ...SOCIAL_SCIENCES_ELECTIVES,
  ...ARTS_SPORTS_ELECTIVES,
];

/* Legacy compatibility — pages zinazotumia SUBJECTS/SUBJECTS_FORMS */
export const SUBJECTS = ALL_SUBJECTS;
export const FORMS = ['Grade 10', 'Grade 11', 'Grade 12'];
export const STREAMS = ['East', 'West', 'North', 'South'];

/* CBE Assessment */
export const ASSESSMENT_TYPES = [
  'SBA',
  'KCBE',
];

export const COMPETENCY_LEVELS = [
  { value: 'EE', label: 'Exceeding Expectation', short: 'EE', min: 80 },
  { value: 'ME', label: 'Meeting Expectation', short: 'ME', min: 65 },
  { value: 'AE', label: 'Approaching Expectation', short: 'AE', min: 50 },
  { value: 'BE', label: 'Below Expectation', short: 'BE', min: 0 },
];

export const EXAMS = [
  'Opener',
  'CAT 1',
  'CAT 2',
  'Midterm',
  'End Term',
];

export const TERMS = ['Term 1', 'Term 2', 'Term 3'];

/* Days of week */
export const DAYS = [
  { value: 0, short: 'Sun', long: 'Sunday' },
  { value: 1, short: 'Mon', long: 'Monday' },
  { value: 2, short: 'Tue', long: 'Tuesday' },
  { value: 3, short: 'Wed', long: 'Wednesday' },
  { value: 4, short: 'Thu', long: 'Thursday' },
  { value: 5, short: 'Fri', long: 'Friday' },
  { value: 6, short: 'Sat', long: 'Saturday' },
];

export function dayLong(n) {
  return DAYS.find(d => d.value === Number(n))?.long || '';
}

export function dayShort(n) {
  return DAYS.find(d => d.value === Number(n))?.short || '';
}

/* Score → Competency level helper */
export function scoreToLevel(score) {
  const n = Number(score);
  if (isNaN(n)) return null;
  if (n >= 80) return 'EE';
  if (n >= 65) return 'ME';
  if (n >= 50) return 'AE';
  return 'BE';
}