import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api';

const Layout: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Function to verify authentication status from API
  const verifyAuth = async () => {
    const token = localStorage.getItem('luxe_token') || localStorage.getItem('access_token');
    if (!token) {
      setIsAuthenticated(false);
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    try {
      const profile = await ApiService.getMe();
      const role = profile.is_staff ? 'admin' : 'customer';
      localStorage.setItem('luxe_user_role', role);
      localStorage.setItem('luxe_user_email', profile.email);
      localStorage.setItem('luxe_is_auth', 'true');
      setIsAdmin(profile.is_staff);
      setIsAuthenticated(true);
    } catch (error) {
      // Token is invalid
      localStorage.removeItem('luxe_token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('luxe_user_role');
      localStorage.removeItem('luxe_user_email');
      localStorage.removeItem('luxe_is_auth');
      setIsAuthenticated(false);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    // Initial auth verification
    verifyAuth();

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'luxe_token' || e.key === 'access_token' || e.key === 'luxe_is_auth' || e.key === 'luxe_user_role') {
        verifyAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowUserMenu(false);
  }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setIsAdmin(false);
    setShowUserMenu(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const scrollToServices = () => {
    if (location.pathname === '/') {
      document.getElementById('bespoke-services')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || location.pathname !== '/' 
          ? 'bg-[#0a0a0a] py-3 md:py-4 shadow-lg border-b border-white/10' 
          : 'bg-transparent py-4 md:py-6'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 z-50">
            <div className="w-8 h-8 md:w-10 md:h-10 border-2 border-[#d4af37] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-base md:text-lg">L</span>
            </div>
            <span className="text-lg md:text-xl tracking-widest font-bold uppercase gold-text serif">LuxeDrive</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/fleet" className="text-white/80 hover:text-[#d4af37] transition-colors text-sm uppercase tracking-widest font-semibold">Fleet</Link>
            <button 
              onClick={scrollToServices}
              className="text-white/80 hover:text-[#d4af37] transition-colors text-sm uppercase tracking-widest font-semibold cursor-pointer"
            >
              Services
            </button>
            <Link to="/contact-us" className="text-white/80 hover:text-[#d4af37] transition-colors text-sm uppercase tracking-widest font-semibold">About</Link>
            {isAdmin && (
              <Link to="/admin" className="gold-bg text-black px-4 py-2 rounded-lg text-sm uppercase tracking-widest font-bold hover:brightness-110 transition-all">
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white group-hover:text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-white text-sm uppercase tracking-widest font-semibold">
                    {isAdmin ? 'Admin' : 'Account'}
                  </span>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl py-2">
                    {isAdmin && (
                      <Link 
                        to="/admin" 
                        className="block px-4 py-2 text-sm text-[#d4af37] hover:bg-white/5 uppercase tracking-widest font-bold"
                        onClick={() => setShowUserMenu(false)}
                      >
                        ← Back to Admin
                      </Link>
                    )}
                    <Link 
                      to="/account" 
                      className="block px-4 py-2 text-sm text-white hover:bg-white/5 uppercase tracking-widest font-semibold"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Account
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 uppercase tracking-widest font-semibold"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="gold-bg text-black px-6 py-2 rounded-lg text-sm uppercase tracking-widest font-bold hover:brightness-110 transition-all">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center z-50 focus:outline-none"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 relative flex flex-col justify-center">
              <span 
                className={`absolute w-full h-0.5 bg-[#d4af37] transform transition-all duration-300 ease-in-out ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'
                }`}
              />
              <span 
                className={`absolute w-full h-0.5 bg-[#d4af37] transform transition-all duration-300 ease-in-out ${
                  isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span 
                className={`absolute w-full h-0.5 bg-[#d4af37] transform transition-all duration-300 ease-in-out ${
                  isMobileMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'
                }`}
              />
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu */}
      <div 
        className={`fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-[#0a0a0a] border-l border-white/10 z-40 md:hidden transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-20 pb-6 px-6">
          {/* Mobile Navigation Links */}
          <nav className="flex-grow space-y-1">
            <Link 
              to="/fleet" 
              className="block py-4 px-4 text-white/80 hover:text-[#d4af37] hover:bg-white/5 rounded-lg transition-all text-sm uppercase tracking-widest font-semibold"
            >
              Fleet
            </Link>
            <button 
              onClick={scrollToServices}
              className="block w-full text-left py-4 px-4 text-white/80 hover:text-[#d4af37] hover:bg-white/5 rounded-lg transition-all text-sm uppercase tracking-widest font-semibold cursor-pointer"
            >
              Services
            </button>
            <Link 
              to="/contact-us" 
              className="block py-4 px-4 text-white/80 hover:text-[#d4af37] hover:bg-white/5 rounded-lg transition-all text-sm uppercase tracking-widest font-semibold"
            >
              About
            </Link>

            {/* Divider */}
            <div className="border-t border-white/10 my-4" />

            {/* User Menu Items */}
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="block py-4 px-4 text-[#d4af37] hover:bg-white/5 rounded-lg transition-all text-sm uppercase tracking-widest font-bold"
                  >
                    Admin Panel
                  </Link>
                )}
                <Link 
                  to="/account" 
                  className="block py-4 px-4 text-white/80 hover:text-[#d4af37] hover:bg-white/5 rounded-lg transition-all text-sm uppercase tracking-widest font-semibold"
                >
                  My Account
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left py-4 px-4 text-red-400 hover:bg-white/5 rounded-lg transition-all text-sm uppercase tracking-widest font-semibold"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block py-4 px-4 text-white/80 hover:text-[#d4af37] hover:bg-white/5 rounded-lg transition-all text-sm uppercase tracking-widest font-semibold"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="block py-4 px-4 text-white/80 hover:text-[#d4af37] hover:bg-white/5 rounded-lg transition-all text-sm uppercase tracking-widest font-semibold"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Footer */}
          <div className="border-t border-white/10 pt-6 space-y-4">
            <div className="flex items-center space-x-3 px-4">
              <div className="w-10 h-10 border-2 border-[#d4af37] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <div>
                <p className="text-white text-sm font-bold uppercase tracking-widest">LuxeDrive</p>
                <p className="text-white/50 text-xs">Elite Automotive</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] border-t border-white/10 py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div className="space-y-4 md:space-y-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 border-2 border-[#d4af37] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="text-lg tracking-widest font-bold uppercase gold-text serif">LuxeDrive</span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed">
              Curated luxury rentals for those who understand that the journey is the destination. Experience automotive perfection.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 md:mb-6 uppercase tracking-widest text-xs">Navigation</h4>
            <ul className="space-y-3 md:space-y-4 text-sm text-white/50">
              <li><Link to="/fleet" className="hover:text-[#d4af37] transition-colors">Fleet Collection</Link></li>
              <li><Link to="/login" className="hover:text-[#d4af37] transition-colors">Member Sign In</Link></li>
              <li><Link to="/signup" className="hover:text-[#d4af37] transition-colors">Apply for Membership</Link></li>
              <li><Link to="/contact-us" className="hover:text-[#d4af37] transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 md:mb-6 uppercase tracking-widest text-xs">Categories</h4>
            <ul className="space-y-3 md:space-y-4 text-sm text-white/50">
              <li><Link to="/fleet" className="hover:text-[#d4af37] transition-colors">Exotic Supercars</Link></li>
              <li><Link to="/fleet" className="hover:text-[#d4af37] transition-colors">Luxury SUVs</Link></li>
              <li><Link to="/fleet" className="hover:text-[#d4af37] transition-colors">Classic Legends</Link></li>
              <li><Link to="/fleet" className="hover:text-[#d4af37] transition-colors">Sports Coupes</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 md:mb-6 uppercase tracking-widest text-xs">Stay Inspired</h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-white/5 border border-white/10 px-4 py-2 text-sm focus:outline-none focus:border-[#d4af37] flex-grow text-white rounded"
              />
              <button className="gold-bg px-4 py-2 text-black font-bold uppercase tracking-widest text-[10px] rounded whitespace-nowrap">Join</button>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 md:px-6 mt-12 md:mt-16 pt-6 md:pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-white/30 uppercase tracking-widest space-y-4 md:space-y-0">
          <p className="text-center md:text-left">© 2026 LuxeDrive Elite Automotive Concierge. All rights reserved.</p>
          <div className="flex space-x-4 md:space-x-6">
            <Link to="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms</Link>
            <Link to="#" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;