import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useToast from '../hooks/useToast';
import GoogleLoginButton from '../components/GoogleLoginButton';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { showSuccessToast, showErrorToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/login', {
          email,
          password
      });

      if (res.data.role === 'admin') {
          localStorage.setItem('adminToken', res.data.access_token);
          localStorage.setItem('adminName', res.data.username);
          showSuccessToast('Identity Verified', 'Welcome, Administrator.');
          navigate('/admin/dashboard');
      } else {
          localStorage.setItem('authToken', res.data.access_token);
          localStorage.setItem('username', res.data.username);
          showSuccessToast('Access Granted', `Welcome back, ${res.data.username}.`);
          navigate('/dashboard'); 
      }

    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.message || "Authentication Failed. Credentials Invalid.";
      showErrorToast('Access Denied', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-brand-black pt-20">
      
      {/* 1. ANIMATED BACKGROUND */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full opacity-20 animate-[spin_60s_linear_infinite]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-brand-blue/10 rounded-full opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050505_100%)] pointer-events-none" />

      {/* 2. THE GLASS CARD */}
      <div className="relative z-10 w-full max-w-md p-1 mx-4">
        {/* Glowing Border Wrap */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent clip-path-polygon rounded-lg" />
        
        <div className="bg-brand-dark/80 backdrop-blur-xl border border-white/10 p-8 md:p-12 relative overflow-hidden rounded-lg shadow-2xl">
          
          {/* Header */}
          <div className="mb-10 text-center">
            <h2 className="text-[10px] font-body tracking-[0.4em] text-brand-blue uppercase mb-3 animate-pulse">
              Restricted Area
            </h2>
            <h1 className="text-3xl font-display font-bold uppercase tracking-widest text-white">
              Identify
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Input */}
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest text-brand-gray mb-2 group-focus-within:text-brand-blue transition-colors">
                Authorized ID (Email)
              </label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className="w-full bg-black/50 border-b border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-blue focus:bg-brand-blue/5 transition-all duration-300 font-mono tracking-wider placeholder-white/20"
                  placeholder="USR-ID-XXXX"
                />
                <div className="absolute right-3 top-3 text-brand-gray/30">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z"/></svg>
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest text-brand-gray mb-2 group-focus-within:text-brand-blue transition-colors">
                Security Key (Password)
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-black/50 border-b border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-blue focus:bg-brand-blue/5 transition-all duration-300 font-mono tracking-wider placeholder-white/20"
                  placeholder="••••••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-brand-gray/50 hover:text-white transition-colors focus:outline-none"
                >
                  {showPassword ? 'HID' : 'VIS'}
                </button>
              </div>
            </div>
            
            {/* Submit Button (The "Scanner") */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full relative group overflow-hidden bg-white text-black py-4 mt-8 font-bold uppercase tracking-[0.2em] text-xs hover:bg-brand-blue transition-colors duration-300 border-none rounded-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                <>
                  <span className="relative z-10">Initiate Session</span>
                  <div className="absolute inset-0 bg-brand-blue translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8 opacity-30">
            <div className="h-[1px] bg-white flex-grow"></div>
            <span className="text-[10px] uppercase tracking-widest text-white">Alternatives</span>
            <div className="h-[1px] bg-white flex-grow"></div>
          </div>

          {/* Google Button Container */}
          <div className="w-full">
             <GoogleLoginButton />
          </div>

          {/* Footer Links */}
          <div className="mt-8 flex justify-center text-[10px] uppercase tracking-widest text-brand-gray">
             <span className="mr-2">No Credentials?</span>
            <Link to="/register" className="text-white hover:text-brand-blue transition-colors border-b border-white/20 hover:border-brand-blue pb-0.5">
              Request Access
            </Link>
          </div>

          {/* Decorative Corner Status Light */}
          <div className="absolute top-4 right-4 flex gap-1">
             <div className="w-1 h-1 bg-red-500 rounded-full animate-ping" />
             <div className="w-1 h-1 bg-red-500 rounded-full" />
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;