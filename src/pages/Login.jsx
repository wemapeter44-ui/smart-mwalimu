import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Login({ onSwitchToSignUp }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Invalid login credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/ribeboys-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.15,
        }}
      />
      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <img src="/ribeboys-logo.webp" alt="Ribe Boys" className="w-16 h-16 object-contain mb-3" />
          <h1 className="text-xl font-bold text-white tracking-wide">SMART MWALIMU</h1>
          <p className="text-xs text-blue-400 mt-1">Ribe Boys High School</p>
        </div>

        <div className="bg-[#0d1e35] border border-blue-900/40 rounded-xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-blue-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="you@school.ac.ke"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-blue-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#0a1628] border border-blue-900/60 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-400 hover:text-blue-200"
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

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
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-xs text-blue-400 text-center mt-5">
            New teacher?{' '}
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="text-blue-300 hover:text-white font-semibold"
            >
              Create account
            </button>
          </p>
        </div>

        <p className="text-[10px] text-blue-500 text-center mt-4">© 2026 PDT SOFTWARES</p>
      </div>
    </div>
  );
}