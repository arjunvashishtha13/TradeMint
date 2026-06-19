import { ArrowRight, BarChart3, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, TrendingUp } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function LandingPage() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200">
      {/* Navigation */}
      <nav className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <img src={logoImg} alt="TradeMint Logo" className="w-8 h-8 rounded object-cover" />
              <span className="text-xl font-bold font-sans">
                Trade<span className="text-[var(--color-brand-primary)]">Mint</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={toggleTheme} className="p-2 text-[var(--text-muted)] hover:text-[var(--color-brand-primary)]">
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link to="/login" className="font-semibold text-[var(--text-main)] hover:text-[var(--color-brand-primary)]">Log in</Link>
              <Link to="/register" className="btn-primary">Sign up</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6">
          Master the Market,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-hover)]">
            Zero Risk Involved.
          </span>
        </h1>
        <p className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-10">
          The most realistic stock market simulator designed for students and aspiring traders to build their portfolio management skills in real-time.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/register" className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
            Start Trading Now <ArrowRight className="w-5 h-5" />
          </Link>

        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[var(--bg-secondary)] border-y border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Why Choose TradeMint?</h2>
            <p className="text-[var(--text-muted)] mt-4">Practical tools designed for realistic trading simulation.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="clean-card p-8">
              <div className="w-12 h-12 bg-pink-500/10 text-[var(--color-brand-primary)] rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Realistic Portfolios</h3>
              <p className="text-[var(--text-muted)]">Experience true market conditions with simulated buys, sells, and accurate P&L tracking based on your transaction history.</p>
            </div>

            <div className="clean-card p-8">
              <div className="w-12 h-12 bg-pink-500/10 text-[var(--color-brand-primary)] rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Fast Execution</h3>
              <p className="text-[var(--text-muted)]">Built on a modern React and Express stack, ensuring lightning-fast load times and seamless dashboard interactions.</p>
            </div>

            <div className="clean-card p-8">
              <div className="w-12 h-12 bg-pink-500/10 text-[var(--color-brand-primary)] rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure Platform</h3>
              <p className="text-[var(--text-muted)]">Industrial-grade security using JSON Web Tokens (JWT) and bcrypt password hashing to protect your simulation data.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-[var(--text-muted)] border-t border-[var(--border-color)]">
        <p>© 2026 TradeMint. Built for portfolio demonstration purposes.</p>
      </footer>
    </div>
  );
}
