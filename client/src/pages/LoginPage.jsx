import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, TrendingUp, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/dashboard/overview');
    } catch (error) {
      // Error is handled in context and we can optionally show another toast
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 clean-card p-10">
        <div className="text-center">
          <div className="w-12 h-12 rounded bg-[var(--color-brand-primary)] flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-[var(--text-main)]">Welcome back</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Log in to manage your portfolio
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type="email"
                  required
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type="password"
                  required
                  className="input-field pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2 py-3">
              Sign in <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
        
        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-[var(--color-brand-primary)] hover:text-[var(--color-brand-hover)]">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
}
