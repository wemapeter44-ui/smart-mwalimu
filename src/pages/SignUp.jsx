import { useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import {
  CORE_SUBJECTS,
  STEM_ELECTIVES,
  SOCIAL_SCIENCES_ELECTIVES,
  ARTS_SPORTS_ELECTIVES,
  PATHWAYS,
  FORMS,
  STREAMS,
} from '../lib/constants';

const PATHWAY_ELECTIVES = {
  'STEM': STEM_ELECTIVES,
  'Social Sciences': SOCIAL_SCIENCES_ELECTIVES,
  'Arts & Sports Science': ARTS_SPORTS_ELECTIVES,
};

export default function SignUp({ onSwitchToLogin }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    phone: '',
    pathway: '',
    subjects: [],
    isClassTeacher: false,
    classForm: '',
    classStream: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const availableSubjects = useMemo(() => {
    if (!form.pathway) return CORE_SUBJECTS;
    return [...CORE_SUBJECTS, ...(PATHWAY_ELECTIVES[form.pathway] || [])];
  }, [form.pathway]);

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function toggleSubject(subject) {
    setForm(prev => {
      const has = prev.subjects.includes(subject);
      return {
        ...prev,
        subjects: has
          ? prev.subjects.filter(s => s !== subject)
          : [...prev.subjects, subject],
      };
    });
  }

  function pickPathway(pathway) {
    setForm(prev => ({
      ...prev,
      pathway,
      subjects: prev.subjects.filter(s => CORE_SUBJECTS.includes(s)),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) return setError('Full name is required.');
    if (!form.email.trim()) return setError('Email is required.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (!form.pathway) return setError('Select your pathway.');
    if (form.subjects.length === 0) return setError('Select at least one subject.');
    if (form.isClassTeacher && (!form.classForm || !form.classStream)) {
      return setError('Select the grade and stream you are class teacher of.');
    }

    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
    });

    if (authError) {
      setLoading(false);
      return setError(authError.message);
    }

    const userId = authData.user?.id;
    if (!userId) {
      setLoading(false);
      return setError('Signup succeeded but no user was returned. Check email confirmation settings.');
    }

    const teacherPayload = {
      user_id: userId,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      pathway: form.pathway || null,
      subject: form.subjects[0] || null,
      subjects: form.subjects.length ? form.subjects : null,
      is_class_teacher: !!form.isClassTeacher,
      class_form: form.isClassTeacher && form.classForm ? form.classForm : null,
      class_stream: form.isClassTeacher && form.classStream ? form.classStream : null,
    };

    const { error: teacherError } = await supabase.from('teachers').insert(teacherPayload);

    setLoading(false);

    if (teacherError) {
      return setError(
        `Account created, but profile failed to save: ${teacherError.message}. Contact admin.`
      );
    }

    await supabase.auth.signOut();
    alert('Account created successfully. Please sign in.');
    onSwitchToLogin();
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4 py-10">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/ribeboys-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.12,
        }}
      />
      <div className="relative z-10 w-full max-w-lg">
        <div className="flex flex-col items-center mb-6">
          <img src="/ribeboys-logo.webp" alt="Ribe Boys" className="w-16 h-16 object-contain mb-3" />
          <h1 className="text-xl font-bold text-white tracking-wide">SMART MWALIMU</h1>
          <p className="text-xs text-blue-400 mt-1">Ribe Boys High School</p>
        </div>

        <div className="bg-[#0d1e35] border border-blue-900/40 rounded-xl p-6 shadow-2xl">
          <h2 className="text-base font-semibold text-white mb-5">Create teacher account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full name">
              <input
                type="text"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. Peter Dekko"
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="you@school.ac.ke"
              />
            </Field>

            <Field label="Phone (optional)">
              <input
                type="text"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="07XX XXX XXX"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Password">
                <input
                  type="password"
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </Field>
              <Field label="Confirm">
                <input
                  type="password"
                  value={form.confirm}
                  onChange={e => update('confirm', e.target.value)}
                  className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </Field>
            </div>

            <div>
              <label className="block text-xs text-blue-300 mb-2">
                Pathway (Senior School)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {PATHWAYS.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => pickPathway(p)}
                    className={`text-xs font-semibold py-2 px-3 rounded-md border transition ${
                      form.pathway === p
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-blue-900/60 text-blue-300 hover:bg-blue-900/40'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-blue-300 mb-2">
                Subjects you teach ({form.subjects.length} selected)
              </label>
              <p className="text-[10px] text-blue-500 mb-2">
                Core subjects are always shown. Pick a pathway to unlock electives.
              </p>
              <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto bg-[#0a1628] border border-blue-900/60 rounded-md p-2">
                {availableSubjects.map(s => {
                  const checked = form.subjects.includes(s);
                  const isCore = CORE_SUBJECTS.includes(s);
                  return (
                    <label
                      key={s}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-xs transition ${
                        checked ? 'bg-blue-600/30 text-white' : 'text-blue-300 hover:bg-blue-900/30'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSubject(s)}
                        className="w-3.5 h-3.5 accent-blue-600"
                      />
                      <span className="truncate">{s}</span>
                      {isCore && <span className="text-[8px] text-blue-500 ml-auto">core</span>}
                    </label>
                  );
                })}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isClassTeacher}
                onChange={e => update('isClassTeacher', e.target.checked)}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-sm text-blue-200">I am a class (form) teacher</span>
            </label>

            {form.isClassTeacher && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Grade">
                  <select
                    value={form.classForm}
                    onChange={e => update('classForm', e.target.value)}
                    className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select grade</option>
                    {FORMS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </Field>
                <Field label="Stream">
                  <select
                    value={form.classStream}
                    onChange={e => update('classStream', e.target.value)}
                    className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select stream</option>
                    {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-md transition"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-xs text-blue-400 text-center mt-5">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-300 hover:text-white font-semibold"
            >
              Sign in
            </button>
          </p>
        </div>

        <p className="text-[10px] text-blue-500 text-center mt-4">© 2026 PDT SOFTWARES</p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-blue-300 mb-1.5">{label}</label>
      {children}
    </div>
  );
}