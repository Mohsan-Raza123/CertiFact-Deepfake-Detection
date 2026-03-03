import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSignOutAlt, FaChartLine, FaUsers, FaFileUpload, FaTerminal, FaCog, FaShieldAlt } from 'react-icons/fa';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        // Clear all potential tokens for a clean logout
        localStorage.removeItem('adminToken');
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminName');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    // Navigation Links Config
    const navLinks = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <FaChartLine /> },
        { path: '/admin/users', label: 'User Management', icon: <FaUsers /> },
        { path: '/admin/uploads', label: 'Upload History', icon: <FaFileUpload /> },
        { path: '/admin/logs', label: 'System Logs', icon: <FaTerminal /> },
        { path: '/admin/settings', label: 'Settings', icon: <FaCog /> },
    ];

    return (
        <div className="flex min-h-screen bg-brand-black text-white font-sans selection:bg-brand-blue selection:text-white">
            
            {/* --- SIDEBAR --- */}
            <aside className="w-64 border-r border-white/10 bg-black fixed h-full z-20 hidden md:flex flex-col">
                
                {/* Brand Header */}
                <div className="h-20 flex items-center px-6 border-b border-white/10">
                    <Link to="/admin/dashboard" className="flex items-center gap-2 text-brand-blue hover:opacity-80 transition-opacity">
                        <FaShieldAlt size={24} />
                        <span className="font-display font-bold text-xl tracking-widest uppercase">
                            Certi<span className="text-white">Fact</span>
                        </span>
                    </Link>
                    <span className="ml-auto text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-400 uppercase tracking-wide border border-white/5">
                        Admin
                    </span>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-grow py-6 px-4 space-y-2">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.path} 
                            to={link.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-300 relative group overflow-hidden ${
                                isActive(link.path) 
                                    ? 'bg-brand-blue text-black shadow-[0_0_20px_rgba(59,130,246,0.5)]' 
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <span className="text-lg relative z-10">{link.icon}</span>
                            <span className="relative z-10">{link.label}</span>
                            
                            {/* Hover Effect Line */}
                            {!isActive(link.path) && (
                                <div className="absolute left-0 top-0 h-full w-1 bg-brand-blue scale-y-0 group-hover:scale-y-100 transition-transform origin-center" />
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Footer / Logout */}
                <div className="p-4 border-t border-white/10">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 text-xs font-bold uppercase tracking-widest"
                    >
                        <FaSignOutAlt /> Terminate Session
                    </button>
                    <p className="text-center text-[10px] text-gray-600 mt-4 font-mono">
                        v2.0.4 | SECURE CONNECTION
                    </p>
                </div>
            </aside>

            {/* --- MOBILE HEADER (Visible only on small screens) --- */}
            <header className="md:hidden fixed w-full h-16 bg-black border-b border-white/10 z-30 flex items-center justify-between px-6">
                <div className="font-display font-bold text-lg tracking-widest uppercase text-brand-blue">
                    Certi<span className="text-white">Fact</span>
                </div>
                <button onClick={handleLogout} className="text-red-400">
                    <FaSignOutAlt size={20} />
                </button>
            </header>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-grow md:ml-64 p-6 pt-24 md:pt-6 relative">
                 {/* Background Grid Pattern (Subtle) */}
                 <div className="absolute inset-0 z-0 opacity-5 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
                 </div>

                {/* Page Transitions */}
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative z-10"
                >
                    <Outlet />
                </motion.div>
            </main>
        </div>
    );
};

export default AdminLayout;