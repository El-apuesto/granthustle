import { useState } from 'react';
import { DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthProps {
  onSuccess: () => void;
}

export default function Auth({ onSuccess }: AuthProps) {
  const { signUp, signIn } = useAuth();
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        if (!orgName.trim()) {
          setError('Organization name required');
          setLoading(false);
          return;
        }

        const { error: signUpError } = await signUp(email, password, orgName);

        if (signUpError) {
          setError(signUpError.message || 'Signup failed');
          setLoading(false);
          return;
        }

        onSuccess();
      } else {
        const { error: signInError } = await signIn(email, password);

        if (signInError) {
          setError(signInError.message || 'Invalid credentials');
          setLoading(false);
          return;
        }

        onSuccess();
      }
    } catch (err) {
      setError('Something broke. Try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <DollarSign className="w-10 h-10 text-emerald-500" />
            <span className="text-3xl font-bold text-white">GrantHustle</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isSignUp ? 'Get your money' : 'Welcome back'}
          </h2>
          <p className="text-slate-400">
            {isSignUp ? 'Create account to find grants' : 'Sign in to continue'}
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-slate-300 mb-2 text-sm font-medium">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Your org or project name"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-slate-300 mb-2 text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2 text-sm font-medium">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Working...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-emerald-500 hover:text-emerald-400 text-sm font-medium"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
