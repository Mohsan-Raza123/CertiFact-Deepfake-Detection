import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEye, FaEyeSlash, FaLock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { MdSecurity } from 'react-icons/md';

const Settings = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Toggle visibility state
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleVisibility = (field) => {
    setShowPassword({ ...showPassword, [field]: !showPassword[field] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // 1. Validation
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Encryption mismatch: Passwords do not match.' });
      return;
    }

    if (formData.newPassword.length < 6) {
        setMessage({ type: 'error', text: 'Security Protocol: Password must be at least 6 characters.' });
        return;
    }

    try {
      setLoading(true);
      
      // 2. Get Token
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken') || localStorage.getItem('authToken');

      if (!token) {
        setMessage({ type: 'error', text: 'Session Expired. Please re-authenticate.' });
        setLoading(false);
        return;
      }

      // 3. Send Request
      await axios.post('http://localhost:5000/api/change-password', 
        {
          current_password: formData.currentPassword,
          new_password: formData.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // 4. Success
      setMessage({ type: 'success', text: 'Credentials Updated Successfully.' });
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });

    } catch (err) {
      console.error("Change Password Error:", err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.error || 'System Error: Unable to update credentials.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-white pt-24 pb-12 px-6 selection:bg-brand-blue selection:text-white">
      
      {/* Background Decor */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="container mx-auto relative z-10 max-w-lg">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 bg-brand-blue/10 border border-brand-blue/30 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-blue">
            <MdSecurity size={30} />
          </div>
          <h2 className="text-brand-blue font-body tracking-[0.4em] text-xs uppercase font-bold mb-2">
            Security Protocols
          </h2>
          <h1 className="text-3xl font-display font-bold uppercase tracking-widest leading-tight">
            Access <span className="text-white">Control</span>
          </h1>
        </motion.div>

        {/* MAIN PANEL */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="border border-white/10 bg-white/[0.02] backdrop-blur-md rounded-lg p-8 md:p-10 relative overflow-hidden"
        >
          {/* Top Decorative Line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-blue to-transparent opacity-50"></div>

          <h3 className="font-display uppercase tracking-widest text-sm mb-8 text-white flex items-center gap-2">
            <FaLock className="text-gray-500" /> Update Credentials
          </h3>

          {/* STATUS MESSAGES */}
          <AnimatePresence mode="wait">
            {message.text && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-6 p-4 border rounded text-xs uppercase tracking-widest flex items-center gap-3 ${
                  message.type === 'success' 
                    ? 'border-green-500/30 bg-green-900/10 text-green-400' 
                    : 'border-red-500/30 bg-red-900/10 text-red-400'
                }`}
              >
                {message.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Current Password */}
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest text-brand-gray mb-2 group-focus-within:text-brand-blue transition-colors">
                Current Security Key
              </label>
              <div className="relative">
                <input 
                  type={showPassword.current ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/50 border-b border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-blue focus:bg-brand-blue/5 transition-all duration-300 font-mono tracking-wider placeholder-white/10"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => toggleVisibility('current')}
                  className="absolute right-3 top-3 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest text-brand-gray mb-2 group-focus-within:text-brand-blue transition-colors">
                New Security Key
              </label>
              <div className="relative">
                <input 
                  type={showPassword.new ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/50 border-b border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-blue focus:bg-brand-blue/5 transition-all duration-300 font-mono tracking-wider placeholder-white/10"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => toggleVisibility('new')}
                  className="absolute right-3 top-3 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest text-brand-gray mb-2 group-focus-within:text-brand-blue transition-colors">
                Confirm New Key
              </label>
              <div className="relative">
                <input 
                  type={showPassword.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/50 border-b border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-blue focus:bg-brand-blue/5 transition-all duration-300 font-mono tracking-wider placeholder-white/10"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => toggleVisibility('confirm')}
                  className="absolute right-3 top-3 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-8 py-4 bg-white text-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-brand-blue transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
            >
              {loading ? 'Encrypting...' : 'Update Credentials'}
            </button>

          </form>
        </motion.div>

        {/* Footer Note */}
        <div className="text-center mt-8 opacity-40">
          <p className="text-[10px] uppercase tracking-widest">Secure Transmission // TLS 1.3</p>
        </div>

      </div>
    </div>
  );
};

export default Settings;