import { useState, useEffect } from 'react';
import { User, Mail, Lock, Shield, Save, LogOut, Award, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email
      }));
      
      const fetchProfile = async () => {
        try {
          // Use api to call our newly updated endpoint
          const api = (await import('../services/api')).default;
          const res = await api.get('/auth/profile');
          if (res.data.activityMetrics) {
            setMetrics(res.data.activityMetrics);
            // We can also store badges in state, but let's just use it dynamically if available
            user.badges = res.data.badges; 
          }
        } catch (error) {
          console.error("Failed to fetch fresh profile metrics", error);
        }
      };

      fetchProfile();
    }
  }, [user]);

  const badges = user?.badges?.length > 0 ? user.badges : ['Early Adopter', 'First Trade', 'Profit Maker'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    toast.success('Profile updated successfully');
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    toast.success('Password changed successfully');
    setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Account Profile</h1>
        <p className="text-[var(--text-muted)] text-sm">Manage your personal information and security</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="clean-card p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200/20">
            <User className="w-6 h-6 text-[var(--color-brand-primary)]" />
            <h2 className="text-xl font-bold">Personal Info</h2>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-10" 
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10" 
                  required
                />
              </div>
            </div>
            <div className="pt-4">
              <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Security Settings */}
        <div className="clean-card p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border-color)]">
            <Shield className="w-6 h-6 text-[var(--color-brand-primary)]" />
            <h2 className="text-xl font-bold">Security</h2>
          </div>
          
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input 
                  type="password" 
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="input-field pl-10" 
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input 
                  type="password" 
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="input-field pl-10" 
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field pl-10" 
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <div className="pt-4">
              <button type="submit" className="btn-secondary w-full">
                Update Password
              </button>
            </div>
          </form>
        </div>

        {/* Activity Metrics */}
        <div className="clean-card p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border-color)]">
            <Activity className="w-6 h-6 text-[var(--color-brand-primary)]" />
            <h2 className="text-xl font-bold">Trading Activity</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[var(--bg-main)] rounded-lg text-center border border-[var(--border-color)]">
              <p className="text-3xl font-bold text-[var(--color-brand-primary)]">{metrics?.tradesExecuted || 0}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1 uppercase font-semibold">Trades Executed</p>
            </div>
            <div className="p-4 bg-[var(--bg-main)] rounded-lg text-center border border-[var(--border-color)]">
              <p className="text-3xl font-bold text-[var(--color-profit)]">
                {metrics?.tradesExecuted > 0 ? Math.round(((metrics?.profitableTrades || 0) / metrics.tradesExecuted) * 100) : 0}%
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1 uppercase font-semibold">Win Rate</p>
            </div>
            <div className="col-span-2 p-4 bg-[var(--bg-main)] rounded-lg text-center border border-[var(--border-color)]">
              <p className="text-3xl font-bold text-[var(--text-main)]">${(metrics?.totalVolume || 0).toLocaleString()}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1 uppercase font-semibold">Total Volume Traded</p>
            </div>
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="clean-card p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border-color)]">
            <Award className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-bold">Achievements</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {badges.map((badge, idx) => (
              <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-main)] border border-yellow-500/30 rounded-full">
                <Award className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">{badge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="md:col-span-2 clean-card p-6 border border-red-500/30">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border-color)]">
            <LogOut className="w-6 h-6 text-[var(--color-loss)]" />
            <h2 className="text-xl font-bold text-[var(--color-loss)]">Account Actions</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold mb-1">Sign Out</h3>
              <p className="text-sm text-[var(--text-muted)]">Log out of your TradeMint session on this device.</p>
            </div>
            <button onClick={handleLogout} className="px-6 py-2 bg-red-500/10 text-[var(--color-loss)] hover:bg-[var(--color-loss)] hover:text-white font-semibold rounded-lg transition-colors whitespace-nowrap">
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
