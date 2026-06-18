import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import NotificationsPanel from './NotificationsPanel';
import logoImg from '../../assets/logo.png';
import { 
  Eye, 
  BarChart3, 
  Sun, 
  Moon, 
  Menu, 
  X,
  TrendingUp,
  Briefcase,
  History,
  User,
  Globe,
  BookOpen,
  Target,
  Bell
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard/overview', icon: BarChart3 },
  { name: 'Market', path: '/dashboard/market', icon: Globe },
  { name: 'Portfolio', path: '/dashboard/portfolio', icon: Briefcase },
  { name: 'Watchlist', path: '/dashboard/watchlist', icon: Eye },
  { name: 'Transactions', path: '/dashboard/transactions', icon: History },
  { name: 'Journal', path: '/dashboard/journal', icon: BookOpen },
  { name: 'Goals', path: '/dashboard/goals', icon: Target },
  { name: 'Profile', path: '/dashboard/profile', icon: User },
];

export default function DashboardLayout() {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <div className="h-screen flex bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed lg:relative z-40 h-full w-64 flex flex-col bg-[var(--bg-secondary)] border-r border-[var(--border-color)] transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 px-6 border-b border-[var(--border-color)]">
          <img src={logoImg} alt="TradeMint Logo" className="w-8 h-8 rounded-lg object-cover shadow-sm" />
          <span className="text-xl font-bold font-sans">
            Trade<span className="text-[var(--color-brand-primary)]">Mint</span>
          </span>
          
          <button className="lg:hidden ml-auto p-1 text-[var(--text-muted)]" onClick={() => setMobileOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[var(--color-brand-primary)] text-white'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)]'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-[var(--border-color)] bg-[var(--bg-main)] flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 text-[var(--text-muted)] rounded-lg hover:bg-[var(--bg-secondary)]">
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="ml-auto flex items-center gap-4 relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>
            <NotificationsPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] transition-colors"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="w-9 h-9 rounded-full bg-[var(--color-brand-primary)] flex items-center justify-center text-white font-bold text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        {/* Main View */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[var(--bg-main)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
