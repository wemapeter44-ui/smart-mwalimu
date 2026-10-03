import { useState } from 'react';
import { useTeacher } from '../../contexts/TeacherContext';

export default function AnnouncementModal({ initial, onSubmit, onClose }) {
  const { teacher } = useTeacher();
  const editing = !!initial?.id;
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    message: initial?.message ?? '',
    audience: initial?.audience ?? 'all',
    audience_subject: initial?.audience_subject ?? teacher?.subject ?? '',
    pinned: initial?.pinned ?? false,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) return setError('Title is required.');
    if (!form.message.trim()) return setError('Message is required.');
    if (form.audience === 'department' && !form.audience_subject) {
      return setError('Select the department.');
    }

    setSaving(true);
    try {
      await onSubmit({
        title: form.title,
        message: form.message,
        audience: form.audience,
        audience_subject: form.audience_subject,
        pinned: form.pinned,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4 py-6 overflow-y-auto">
      <div className="w-full max-w-lg bg-[#0d1e35] border border-blue-900/40 rounded-xl p-5 shadow-2xl my-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">
            {editing ? 'Edit announcement' : 'New announcement'}
          </h3>
          <button onClick={onClose} className="text-blue-400 hover:text-white text-lg leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-blue-300 mb-1.5">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => update('title', e.target.value)}
              className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. Staff meeting Friday 4pm"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs text-blue-300 mb-1.5">Message</label>
            <textarea
              value={form.message}
              onChange={e => update('message', e.target.value)}
              rows={5}
              className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Write the announcement..."
            />
          </div>

          <div>
            <label className="block text-xs text-blue-300 mb-1.5">Audience</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => update('audience', 'all')}
                className={`flex-1 text-xs font-semibold py-2 rounded-md border transition ${
                  form.audience === 'all'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-blue-900/60 text-blue-300 hover:bg-blue-900/40'
                }`}
              >
                All staff
              </button>
              <button
                type="button"
                onClick={() => update('audience', 'department')}
                className={`flex-1 text-xs font-semibold py-2 rounded-md border transition ${
                  form.audience === 'department'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-blue-900/60 text-blue-300 hover:bg-blue-900/40'
                }`}
              >
                My department
              </button>
            </div>
          </div>

          {form.audience === 'department' && (
            <div>
              <label className="block text-xs text-blue-300 mb-1.5">Department (subject)</label>
              <input
                type="text"
                value={form.audience_subject}
                onChange={e => update('audience_subject', e.target.value)}
                className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. Computer Studies"
              />
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.pinned}
              onChange={e => update('pinned', e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-xs text-blue-200">Pin to top</span>
          </label>

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
              {saving ? 'Saving...' : editing ? 'Save changes' : 'Post announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}