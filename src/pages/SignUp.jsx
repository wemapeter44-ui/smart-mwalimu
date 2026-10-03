import { useState } from 'react';
import { supabase } from '../lib/supabase';

const SUBJECTS = [
  'Mathematics', 'English', 'Kiswahili', 'Biology', 'Chemistry', 'Physics',
  'History', 'Geography', 'CRE', 'IRE', 'Business', 'Agriculture',
  'Computer Studies', 'Music', 'Art', 'PE',
];

const FORMS = ['Form 1', 'Form 2', 'Form 3', 'Form 4'];
const STREAMS = ['East', 'West', 'North', 'South'];

export default function SignUp({ onSwitchToLogin }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    phone: '',
    subject: '',
    isClassTeacher: false,
    classForm: '',
    classStream: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) return setError('Full name is required.');
    if (!form.email.trim()) return setError('Email is required.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (form.isClassTeacher && (!form.classForm || !form.classStream)) {
      return setError('Select the form and stream you are class teacher of.');
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

    const { error: teacherError } = await supabase.from('teachers').insert({
      user_id: userId,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      subject: form.subject || null,
      is_class_teacher: form.isClassTeacher,
      class_form: form.isClassTeacher ? form.classForm : null,
      class_stream: form.isClassTeacher ? form.classStream : null,
    });

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
      <div className="relative z-10 w-full max-w-md">
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

            <Field label="Main subject">
              <select
                value={form.subject}
                onChange={e => update('subject', e.target.value)}
                className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select subject</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>

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
                <Field label="Form">
                  <select
                    value={form.classForm}
                    onChange={e => update('classForm', e.target.value)}
                    className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select form</option>
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