import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { motion } from 'framer-motion';
import { FaShieldAlt, FaLock, FaEnvelope, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const res = await axios.post('http://localhost:5000/admin/login', { 
                email, 
                password 
            });

            // If successful:
            localStorage.setItem('adminToken', res.data.access_token);
            // Optional: Store admin name if returned, otherwise default
            localStorage.setItem('adminName', res.data.username || 'Admin');
            
            navigate('/admin/dashboard');
        } catch (err) {
            console.error("Login Error Details:", err); 
            
            if (err.response && err.response.status === 401) {
                setError('Invalid Email or Password');
            } else if (err.code === "ERR_NETWORK") {
                setError('Cannot connect to Server (Port 5000)');
            } else {
                setError('Login Failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-black flex items-center justify-center p-6 relative overflow-hidden">
            
            {/* Background Decoration */}
            <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-brand-blue/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Brand Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4 text-brand-blue">
                        <FaShieldAlt size={32} />
                    </div>
                    <h1 className="font-display font-bold text-3xl text-white uppercase tracking-widest">
                        Certi<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-white">Fact</span>
                    </h1>
                    <p className="text-xs text-gray-500 uppercase tracking-[0.2em] mt-2">Administrative Access Portal</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative">
                    
                    {/* Error Message */}
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 text-xs font-bold uppercase tracking-wide"
                        >
                            <FaExclamationTriangle className="shrink-0" />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        
                        {/* Email Input */}
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Administrator Email</label>
                            <div className="relative group">
                                <FaEnvelope className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-brand-blue transition-colors" />
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={e => setEmail(e.target.value)} 
                                    required 
                                    className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all font-mono text-sm"
                                    placeholder="admin@certifact.com"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Secure Key</label>
                            <div className="relative group">
                                <FaLock className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-brand-blue transition-colors" />
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={e => setPassword(e.target.value)} 
                                    required 
                                    className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all font-mono text-sm"
                                    placeholder="••••••••••••"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-brand-blue hover:bg-blue-600 text-black font-bold py-3 rounded-lg uppercase tracking-widest text-xs transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 mt-4"
                        >
                            {isLoading ? (
                                <>
                                    <FaSpinner className="animate-spin" /> Authenticating...
                                </>
                            ) : (
                                'Initialize Session'
                            )}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-6">
                    <p className="text-[10px] text-gray-600 font-mono">
                        RESTRICTED AREA | UNAUTHORIZED ACCESS LOGGED
                    </p>
                </div>

            </motion.div>
        </div>
    );
};

export default AdminLogin;