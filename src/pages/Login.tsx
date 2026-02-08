
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Get JWT Token
      const response = await ApiService.login({
        email,
        password
      });      const data = (response as any).data || response;
      const accessToken = data.access || data.token || data.key;
      
      if (accessToken) {
        localStorage.setItem('luxe_token', accessToken);
        localStorage.setItem('access_token', accessToken);
        if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
      }

      // 2. Fetch User Profile to determine role
      const profileResponse = await ApiService.getMe();
      const profile = (profileResponse as any).data || profileResponse;
      
      // Fix: Use 'is_staff' property from UserProfile interface as defined in services/api.ts
      const role = profile.is_staff ? 'admin' : 'customer';
      localStorage.setItem('luxe_user_role', role);
      localStorage.setItem('luxe_user_email', profile.email);
      localStorage.setItem('luxe_is_auth', 'true');

      // 3. Smart Redirect
      const intendedPath = sessionStorage.getItem('admin_intended_path');
      if (intendedPath && profile.is_staff) {
        sessionStorage.removeItem('admin_intended_path');
        // Ensure path starts with / for hash router
        const redirectPath = intendedPath.startsWith('/') ? intendedPath : `/${intendedPath}`;
        navigate(redirectPath);
      } else if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/account');
      }
    } catch (err: any) {
      setError("Authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center pt-20 overflow-hidden">
      <div className="absolute inset-0 bg-black">
        <img 
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1920" 
          alt="Luxury Interior" 
          className="w-full h-full object-cover opacity-40 blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-md mx-auto">
          <div className="glass p-10 md:p-12 rounded-sm shadow-2xl animate-fadeIn">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold serif mb-2 text-white">
                The Art of <span className="gold-text italic">Entry</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">
                Secure access to the LuxeDrive ecosystem
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase tracking-widest font-bold text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/60 font-bold ml-1">Identity (email)</label>
                <input 
                  type="text" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email"
                  className="w-full bg-white/5 border border-white/10 p-4 text-sm text-white focus:outline-none focus:border-gold transition-all"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] uppercase tracking-widest text-white/60 font-bold">Credentials</label>
                  <Link to="#" className="text-[9px] gold-text uppercase font-bold hover:underline tracking-widest">Forgot?</Link>
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 p-4 text-sm text-white focus:outline-none focus:border-gold transition-all"
                />
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full gold-bg text-black py-4 font-bold uppercase tracking-[0.2em] text-xs hover:brightness-110 transition-all mt-4 disabled:opacity-50"
              >
                {isLoading ? 'Verifying Identity...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-center text-[10px] uppercase tracking-widest text-white/40 font-bold mb-6">Secure Biometric Portal</p>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center space-x-2 py-3 border border-white/10 hover:bg-white/5 transition-all text-white">
                  <span className="text-[10px] uppercase tracking-widest font-bold">Apple ID</span>
                </button>
                <button className="flex items-center justify-center space-x-2 py-3 border border-white/10 hover:bg-white/5 transition-all text-white">
                  <span className="text-[10px] uppercase tracking-widest font-bold">SecureKey</span>
                </button>
              </div>
            </div>

            <p className="text-center mt-10 text-[10px] uppercase tracking-widest text-white/40 font-bold">
              New to LuxeDrive? <Link to="/signup" className="gold-text hover:underline ml-1">Apply for Membership</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
