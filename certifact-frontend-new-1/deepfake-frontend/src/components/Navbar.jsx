import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { MdVerifiedUser } from 'react-icons/md';
// Note: We removed ThemeSwitcher because the luxury theme is always dark.

const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // For mobile menu toggle

  // Check for tokens (Preserved Logic)
  const isAuthenticated = !!localStorage.getItem('token') || !!localStorage.getItem('adminToken') || !!localStorage.getItem('authToken');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  // Scroll Effect Logic
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper for Link Styles
  const linkClasses = ({ isActive }) =>
    `text-xs font-body font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
      isActive ? 'text-brand-blue' : 'text-white/70 hover:text-white hover:scale-105'
    }`;

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-700 ${
      scrolled || isOpen ? 'bg-brand-black/90 backdrop-blur-md py-4 border-b border-white/5' : 'bg-transparent py-6'
    }`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        
        {/* 1. LUXURY LOGO */}
        <Link to="/" className="group flex items-center gap-3 text-decoration-none">
          <div className="relative">
            <MdVerifiedUser size={30} className="text-brand-blue" />
            <div className="absolute inset-0 bg-brand-blue blur-lg opacity-40"></div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-display font-bold text-white tracking-[0.2em] uppercase leading-none group-hover:text-brand-blue transition-colors duration-300">
              CERTI<span className="text-brand-blue">FACT</span>
            </span>
            
          </div>
        </Link>

        {/* 2. MOBILE MENU TOGGLE */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="md:hidden text-white focus:outline-none"
        >
          <div className="space-y-2">
            <div className={`w-8 h-0.5 bg-white transition-all ${isOpen ? 'rotate-45 translate-y-2.5' : ''}`}></div>
            <div className={`w-8 h-0.5 bg-white transition-all ${isOpen ? 'opacity-0' : ''}`}></div>
            <div className={`w-8 h-0.5 bg-white transition-all ${isOpen ? '-rotate-45 -translate-y-2.5' : ''}`}></div>
          </div>
        </button>

        {/* 3. DESKTOP MENU */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLink to="/" className={linkClasses} end>Home</NavLink>
          
          {isAuthenticated && (
            <>
              <NavLink to="/dashboard" className={linkClasses}>Dashboard</NavLink>
              <NavLink to="/analyze" className={linkClasses}>Analyze</NavLink>
              <NavLink to="/history" className={linkClasses}>History</NavLink>
              <NavLink to="/settings" className={linkClasses}>Settings</NavLink>
            </>
          )}

          <NavLink to="/about" className={linkClasses}>About</NavLink>
          <NavLink to="/help" className={linkClasses}>Help</NavLink>

          {isAuthenticated ? (
            <button 
              onClick={handleLogout} 
              // ADDED: rounded-lg
              className="ml-4 px-6 py-2 border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-red-900/50 hover:border-red-500 transition-all duration-300 rounded-lg"
            >
              Terminate Session
            </button>
          ) : (
            <div className="flex gap-4 ml-4">
              <NavLink to="/login" className="px-5 py-2 text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:text-brand-blue transition-colors">
                Login
              </NavLink>
              <NavLink 
                to="/register" 
                // ADDED: rounded-lg
                className="px-5 py-2 border border-brand-blue text-brand-blue text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-blue hover:text-black transition-all duration-300 rounded-lg"
              >
                Register
              </NavLink>
            </div>
          )}
        </div>
      </div>

      {/* 4. MOBILE MENU DROPDOWN (Glass Effect) */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-brand-black/95 backdrop-blur-xl border-b border-white/10 py-8 px-6 flex flex-col gap-6 animate-in slide-in-from-top-5">
          <NavLink to="/" className={linkClasses} onClick={() => setIsOpen(false)}>Home</NavLink>
          
          {isAuthenticated && (
            <>
              <NavLink to="/dashboard" className={linkClasses} onClick={() => setIsOpen(false)}>Dashboard</NavLink>
              <NavLink to="/analyze" className={linkClasses} onClick={() => setIsOpen(false)}>Analyze</NavLink>
              <NavLink to="/history" className={linkClasses} onClick={() => setIsOpen(false)}>History</NavLink>
              <NavLink to="/settings" className={linkClasses} onClick={() => setIsOpen(false)}>Settings</NavLink>
            </>
          )}

          <NavLink to="/about" className={linkClasses} onClick={() => setIsOpen(false)}>About</NavLink>
          <NavLink to="/help" className={linkClasses} onClick={() => setIsOpen(false)}>Help</NavLink>

          {isAuthenticated ? (
            <button onClick={() => { handleLogout(); setIsOpen(false); }} className="text-left text-red-500 font-bold uppercase tracking-[0.2em] text-xs mt-4">
              Logout
            </button>
          ) : (
            <div className="flex flex-col gap-4 mt-4">
              <NavLink to="/login" onClick={() => setIsOpen(false)} className="text-white uppercase tracking-[0.2em] text-xs">Login</NavLink>
              <NavLink to="/register" onClick={() => setIsOpen(false)} className="text-brand-blue uppercase tracking-[0.2em] text-xs">Register</NavLink>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;