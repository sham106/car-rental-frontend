
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await ApiService.register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password
      });
      
      // Auto-login or redirect to login
      localStorage.setItem('luxe_user_email', formData.email);
      navigate('/login');
    } catch (err: any) {
      setError("Registration failed. This identity may already be registered.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center pt-28 pb-12 overflow-hidden">
      <div className="absolute inset-0 bg-black">
        <img 
          src="https://images.unsplash.com/photo-1603584173870-7f1ef9199321?auto=format&fit=crop&q=80&w=1920"
          alt="Luxury Background" 
          className="w-full h-full object-cover opacity-40 blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-xl mx-auto">
          <div className="glass p-10 md:p-12 rounded-sm shadow-2xl animate-fadeIn border-white/10">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold serif mb-2 text-white">
                Join the <span className="gold-text italic">Elite</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">
                Begin your journey with LuxeDrive membership
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase tracking-widest font-bold text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/60 font-bold ml-1">First Name</label>
                  <input 
                    name="first_name"
                    type="text" 
                    required
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="Julian"
                    className="w-full bg-white/5 border border-white/10 p-4 text-sm text-white focus:outline-none focus:border-gold transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/60 font-bold ml-1">Last Name</label>
                  <input 
                    name="last_name"
                    type="text" 
                    required
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Sterling"
                    className="w-full bg-white/5 border border-white/10 p-4 text-sm text-white focus:outline-none focus:border-gold transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/60 font-bold ml-1">Email Address</label>
                <input 
                  name="email"
                  type="email" 
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="sterling@executive.com"
                  className="w-full bg-white/5 border border-white/10 p-4 text-sm text-white focus:outline-none focus:border-gold transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/60 font-bold ml-1">Password</label>
                <input 
                  name="password"
                  type="password" 
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-white/5 border border-white/10 p-4 text-sm text-white focus:outline-none focus:border-gold transition-all"
                />
              </div>

              <div className="p-6 bg-gold/5 border border-gold/10 rounded-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-widest gold-text font-bold">Initial Tier: Silver</span>
                  <span className="text-[9px] text-white/40 font-bold uppercase">Membership Benefits</span>
                </div>
                <ul className="text-[10px] text-white/50 space-y-2 uppercase tracking-widest">
                  <li className="flex items-center"><span className="w-1 h-1 gold-bg rounded-full mr-2"></span> No security deposit for Silver rentals</li>
                  <li className="flex items-center"><span className="w-1 h-1 gold-bg rounded-full mr-2"></span> Priority airport pickup</li>
                </ul>
              </div>

              <div className="flex items-start space-x-3 ml-1">
                <input type="checkbox" id="terms" required className="mt-1 w-4 h-4 accent-gold" />
                <label htmlFor="terms" className="text-[9px] uppercase tracking-widest text-white/40 font-bold cursor-pointer leading-relaxed">
                  I agree to the <Link to="#" className="gold-text">Membership Agreement</Link> and <Link to="#" className="gold-text">Privacy Policy</Link>.
                </label>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full gold-bg text-black py-4 font-bold uppercase tracking-[0.2em] text-xs hover:brightness-110 transition-all mt-4 disabled:opacity-50"
              >
                {isLoading ? 'Processing Application...' : 'Complete Application'}
              </button>
            </form>

            <div className="flex flex-col space-y-4 items-center mt-10">
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                Already a member? <Link to="/login" className="gold-text hover:underline ml-1">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
