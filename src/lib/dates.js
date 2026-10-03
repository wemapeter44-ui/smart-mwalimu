export function todayDayNumber() {
  return new Date().getDay();
}

export function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function nowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

export function classStatus(start, end) {
  const now = nowMinutes();
  const s = toMinutes(start);
  const e = toMinutes(end);
  if (now < s) return 'upcoming';
  if (now >= s && now < e) return 'in-progress';
  return 'ended';
}

export function formatTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const ampm = h < 12 ? 'AM' : 'PM';
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function prettyDate(d = new Date()) {
  return d.toLocaleDateString('en-KE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}