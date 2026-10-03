import { useState } from 'react';

export default function AddStudentModal({ onClose, onSubmit, classLabel }) {
  const [name, setName] = useState('');
  const [admissionNo, setAdmissionNo] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Name is required.');
    if (!admissionNo.trim()) return setError('Admission number is required.');

    setSaving(true);
    try {
      await onSubmit({ name, admission_no: admissionNo });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add student.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#0d1e35] border border-blue-900/40 rounded-xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">Add Student</h3>
          <button onClick={onClose} className="text-blue-400 hover:text-white text-lg leading-none">×</button>
        </div>

        {classLabel && (
          <p className="text-[11px] text-blue-400 mb-3">
            Adding to <span className="text-blue-200 font-semibold">{classLabel}</span>
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-blue-300 mb-1.5">Full name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. John Kamau"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs text-blue-300 mb-1.5">Admission number</label>
            <input
              type="text"
              value={admissionNo}
              onChange={e => setAdmissionNo(e.target.value)}
              className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. RB/1234/2024"
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
              {saving ? 'Adding...' : 'Add student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}