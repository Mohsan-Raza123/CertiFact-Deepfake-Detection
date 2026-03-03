import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLock, FaEye, FaEyeSlash, FaShieldAlt, FaCheckCircle, FaExclamationTriangle, FaSpinner, FaCog } from 'react-icons/fa';

const AdminSettings = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
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

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      return;
    }

    if (formData.newPassword.length < 6) {
        setMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
        return;
    }

    try {
      setLoading(true);
      
      const token = localStorage.getItem('adminToken');

      if (!token) {
        setMessage({ type: 'error', text: 'Admin session expired. Please login again.' });
        setLoading(false);
        return;
      }

      await axios.post('http://localhost:5000/admin/change-password', 
        {
          current_password: formData.currentPassword,
          new_password: formData.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessage({ type: 'success', text: 'Admin password updated successfully!' });
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });

    } catch (err) {
      console.error("Admin Change Password Error:", err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.msg || 'Failed to update password.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-white pt-24 pb-12 px-6 selection:bg-brand-blue selection:text-white font-sans">
      
      {/* Background Decor */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="container mx-auto max-w-2xl relative z-10">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/10 pb-6">
            <div>
                <h2 className="text-brand-blue font-body tracking-[0.4em] text-xs uppercase font-bold mb-2 flex items-center gap-2">
                    <FaCog /> Configuration
                </h2>
                <h1 className="text-3xl md:text-5xl font-display font-bold uppercase tracking-widest leading-none">
                    Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Settings</span>
                </h1>
            </div>
        </div>

        {/* --- SETTINGS CARD --- */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-white/10 bg-[#0c0c0c] rounded-lg overflow-hidden shadow-2xl"
        >
            <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex items-center gap-3">
                <FaShieldAlt className="text-brand-blue" />
                <h3 className="font-bold uppercase tracking-widest text-sm">Security Protocols</h3>
            </div>

            <div className="p-8">
                
                {/* Alert Messages */}
                <AnimatePresence>
                    {message.text && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`mb-6 p-4 rounded border flex items-center gap-3 text-xs font-bold uppercase tracking-wide ${
                                message.type === 'success' 
                                    ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}
                        >
                            {message.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                            {message.text}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Current Password */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Current Password</label>
                        <div className="relative group">
                            <FaLock className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-brand-blue transition-colors" />
                            <input 
                                type={showPassword.current ? "text" : "password"}
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                required
                                className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-12 pr-12 text-white placeholder-gray-700 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all font-mono text-sm"
                                placeholder="••••••••"
                            />
                            <button 
                                type="button"
                                onClick={() => toggleVisibility('current')}
                                className="absolute right-4 top-3.5 text-gray-500 hover:text-white transition-colors"
                            >
                                {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <div className="h-px bg-white/5 my-6" />

                    {/* New Password */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">New Password</label>
                        <div className="relative group">
                            <FaLock className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-brand-blue transition-colors" />
                            <input 
                                type={showPassword.new ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                                className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-12 pr-12 text-white placeholder-gray-700 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all font-mono text-sm"
                                placeholder="Min 6 characters"
                            />
                             <button 
                                type="button"
                                onClick={() => toggleVisibility('new')}
                                className="absolute right-4 top-3.5 text-gray-500 hover:text-white transition-colors"
                            >
                                {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Confirm New Password</label>
                        <div className="relative group">
                            <FaLock className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-brand-blue transition-colors" />
                            <input 
                                type={showPassword.confirm ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-12 pr-12 text-white placeholder-gray-700 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all font-mono text-sm"
                                placeholder="Repeat new password"
                            />
                             <button 
                                type="button"
                                onClick={() => toggleVisibility('confirm')}
                                className="absolute right-4 top-3.5 text-gray-500 hover:text-white transition-colors"
                            >
                                {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-brand-blue hover:bg-blue-600 text-black font-bold py-3 rounded-lg uppercase tracking-widest text-xs transition-all duration-300 transform active:scale-[0.99] flex items-center justify-center gap-2 mt-8"
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin" /> Processing Request...
                            </>
                        ) : (
                            'Update Credentials'
                        )}
                    </button>
                </form>
            </div>
        </motion.div>

        <div className="text-center mt-8">
             <p className="text-[10px] text-gray-600 font-mono">
                ALL CHANGES ARE LOGGED FOR SECURITY AUDITS
             </p>
        </div>

      </div>
    </div>
  );
};

export default AdminSettings;