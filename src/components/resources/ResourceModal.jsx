import { useState } from 'react';
import { SUBJECTS } from '../../lib/constants';

export default function ResourceModal({ initial, onSubmit, onClose }) {
  const editing = !!initial?.id;
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    link: initial?.link ?? '',
    subject: initial?.subject ?? '',
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
    if (!form.link.trim()) return setError('Link is required.');
    try { new URL(form.link); } catch { return setError('Link must be a valid URL (start with https://).'); }

    setSaving(true);
    try {
      await onSubmit({
        title: form.title,
        description: form.description,
        link: form.link,
        subject: form.subject,
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
            {editing ? 'Edit resource' : 'Add resource'}
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
              placeholder="e.g. KCSE 2023 Past Paper"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs text-blue-300 mb-1.5">Link</label>
            <input
              type="url"
              value={form.link}
              onChange={e => update('link', e.target.value)}
              className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-xs text-blue-300 mb-1.5">Subject</label>
            <select
              value={form.subject}
              onChange={e => update('subject', e.target.value)}
              className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Any / General</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs text-blue-300 mb-1.5">Description (optional)</label>
            <textarea
              value={form.description}
              onChange={e => update('description', e.target.value)}
              rows={3}
              className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Short note about this resource..."
            />
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
              {saving ? 'Saving...' : editing ? 'Save changes' : 'Add resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}