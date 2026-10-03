export const SUBJECTS = [
  'Mathematics', 'English', 'Kiswahili', 'Biology', 'Chemistry', 'Physics',
  'History', 'Geography', 'CRE', 'IRE', 'Business', 'Agriculture',
  'Computer Studies', 'Music', 'Art', 'PE',
];

export const FORMS = ['Form 1', 'Form 2', 'Form 3', 'Form 4'];

export const STREAMS = ['East', 'West', 'North', 'South'];

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
}export const EXAMS = [
  'Opener',
  'CAT 1',
  'CAT 2',
  'Midterm',
  'End Term',
];

export const TERMS = ['Term 1', 'Term 2', 'Term 3'];