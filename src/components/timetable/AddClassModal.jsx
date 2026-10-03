import { useState } from 'react';
import { SUBJECTS, FORMS, STREAMS, DAYS } from '../../lib/constants';

export default function AddClassModal({ initial, onSubmit, onClose }) {
  const editing = !!initial?.id;
  const [form, setForm] = useState({
    day: initial?.day ?? 1,
    start_time: initial?.start_time?.slice(0, 5) ?? '08:00',
    end_time: initial?.end_time?.slice(0, 5) ?? '08:40',
    subject: initial?.subject ?? '',
    form: initial?.form ?? '',
    stream: initial?.stream ?? '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.subject) return setError('Select a subject.');
    if (!form.form) return setError('Select a form.');
    if (!form.start_time || !form.end_time) return setError('Enter start and end times.');
    if (form.start_time >= form.end_time) return setError('End time must be after start time.');

    setSaving(true);
    try {
      await onSubmit({
        day: Number(form.day),
        start_time: form.start_time,
        end_time: form.end_time,
        subject: form.subject,
        form: form.form,
        stream: form.stream || null,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#0d1e35] border border-blue-900/40 rounded-xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">
            {editing ? 'Edit class' : 'Add class'}
          </h3>
          <button onClick={onClose} className="text-blue-400 hover:text-white text-lg leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-blue-300 mb-1.5">Day</label>
            <select
              value={form.day}
              onChange={e => update('day', Number(e.target.value))}
              className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {DAYS.map(d => <option key={d.value} value={d.value}>{d.long}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-blue-300 mb-1.5">Start</label>
              <input
                type="time"
                value={form.start_time}
                onChange={e => update('start_time', e.target.value)}
                className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-blue-300 mb-1.5">End</label>
              <input
                type="time"
                value={form.end_time}
                onChange={e => update('end_time', e.target.value)}
                className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-blue-300 mb-1.5">Subject</label>
            <select
              value={form.subject}
              onChange={e => update('subject', e.target.value)}
              className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Select subject</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-blue-300 mb-1.5">Form</label>
              <select
                value={form.form}
                onChange={e => update('form', e.target.value)}
                className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select form</option>
                {FORMS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-blue-300 mb-1.5">Stream</label>
              <select
                value={form.stream}
                onChange={e => update('stream', e.target.value)}
                className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Any</option>
                {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-sm text-blue-300 border border-blue-900/60 hover:bg-blue-900/40 rounded-md py-2 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-md py-2 transition"
            >
              {saving ? 'Saving...' : editing ? 'Save changes' : 'Add class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}