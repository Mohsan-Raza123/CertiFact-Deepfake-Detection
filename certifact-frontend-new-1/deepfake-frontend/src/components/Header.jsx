import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';
import { MdVerifiedUser, MdLogout, MdLogin } from 'react-icons/md';

const Header = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Mobile menu state

  // --- 1. SCROLL EFFECT ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- 2. LOGOUT LOGIC (Preserved) ---
  const handleLogout = async () => {
    await signOut(auth); // Sign out from Firebase
    localStorage.removeItem('accessToken'); // Clear Flask token
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login'); // Redirect to login page
  };

  // Helper for active link styling
  const isActive = (path) => location.pathname === path;
  const linkClasses = (path) => 
    `text-xs font-body font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
      isActive(path) ? 'text-brand-blue' : 'text-white/70 hover:text-white hover:scale-105'
    }`;

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-700 ${
      scrolled || isOpen ? 'bg-brand-black/90 backdrop-blur-md py-4 border-b border-white/5' : 'bg-transparent py-6'
    }`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        
        {/* --- LOGO --- */}
        <Link to="/" className="group flex items-center gap-3 text-decoration-none">
          <div className="relative">
            <MdVerifiedUser size={30} className="text-brand-blue" />
            <div className="absolute inset-0 bg-brand-blue blur-lg opacity-40"></div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-display font-bold text-white tracking-[0.2em] uppercase leading-none group-hover:text-brand-blue transition-colors duration-300">
              DEEPFAKE<span className="text-brand-blue">DETECTOR</span>
            </span>
            <span className="text-[8px] text-gray-400 tracking-[0.4em] uppercase text-right hidden md:block">
              System V2.0
            </span>
          </div>
        </Link>

        {/* --- MOBILE MENU TOGGLE --- */}
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

        {/* --- DESKTOP MENU --- */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className={linkClasses('/')}>Home</Link>
          
          {user && (
            <>
              <Link to="/analyze" className={linkClasses('/analyze')}>Analyze</Link>
              <Link to="/history" className={linkClasses('/history')}>History</Link>
            </>
          )}

          <div className="h-4 w-[1px] bg-white/20 mx-4"></div>

          {user ? (
            <div className="flex items-center gap-6">
              <span className="text-[10px] text-brand-blue uppercase tracking-widest font-bold">
                Hi, {user.displayName ? user.displayName.split(' ')[0] : 'User'}
              </span>
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 px-5 py-2 border border-white/20 rounded-lg text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-red-900/50 hover:border-red-500 transition-all duration-300"
              >
                <MdLogout /> Logout
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-blue hover:text-white transition-all duration-300"
            >
              <MdLogin /> Login
            </Link>
          )}
        </div>
      </div>

      {/* --- MOBILE DROPDOWN --- */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-brand-black/95 backdrop-blur-xl border-b border-white/10 py-8 px-6 flex flex-col gap-6 animate-in slide-in-from-top-5">
          <Link to="/" className={linkClasses('/')} onClick={() => setIsOpen(false)}>Home</Link>
          
          {user && (
            <>
              <Link to="/analyze" className={linkClasses('/analyze')} onClick={() => setIsOpen(false)}>Analyze</Link>
              <Link to="/history" className={linkClasses('/history')} onClick={() => setIsOpen(false)}>History</Link>
            </>
          )}

          <div className="h-[1px] w-full bg-white/10 my-2"></div>

          {user ? (
            <div className="flex flex-col gap-4">
              <span className="text-xs text-brand-blue uppercase tracking-widest text-center">
                Logged in as {user.displayName ? user.displayName.split(' ')[0] : 'User'}
              </span>
              <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full text-center py-3 border border-red-500/50 text-red-400 font-bold uppercase tracking-[0.2em] text-xs rounded">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" onClick={() => setIsOpen(false)} className="w-full text-center py-3 bg-white text-black font-bold uppercase tracking-[0.2em] text-xs rounded">
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Header;