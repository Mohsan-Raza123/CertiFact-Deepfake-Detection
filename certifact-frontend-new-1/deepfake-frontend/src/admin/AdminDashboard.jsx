import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { FaUsers, FaFileUpload, FaUserShield, FaServer, FaDatabase, FaRobot, FaCheckCircle, FaExclamationTriangle, FaSync } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';

// Register ChartJS
ChartJS.register(ArcElement, Tooltip, Legend);

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        total_users: 0,
        total_uploads: 0,
        total_admins: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                if (!token) throw new Error("No admin token found.");

                const res = await axios.get('http://localhost:5000/admin/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                setStats(res.data);
                setLoading(false);
            } catch (err) {
                if (err.response && (err.response.status === 401 || err.response.status === 422)) {
                    localStorage.removeItem('adminToken');
                    navigate('/login');
                    return;
                }
                setError("Failed to load dashboard statistics.");
                setLoading(false);
            }
        };
        fetchStats();
    }, [navigate]);

    // --- CHART CONFIGURATION ---
    const chartData = {
        labels: ['Registered Users', 'System Admins'],
        datasets: [
            {
                data: [stats.total_users, stats.total_admins],
                backgroundColor: ['#3b82f6', '#eab308'], // Brand Blue & Warning Yellow
                borderColor: ['#000000', '#000000'], // Black border matches bg for cleaner look
                borderWidth: 2,
                hoverOffset: 4
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false, // <--- FIXED: Hide default legend to fix alignment
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.9)',
                titleFont: { family: 'monospace' },
                bodyFont: { family: 'monospace' },
                padding: 12,
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                displayColors: true,
                usePointStyle: true,
            }
        },
        cutout: '80%', // Thinner doughnut for sleeker look
    };

    // --- LOADING STATE ---
    if (loading) return (
        <div className="min-h-screen bg-brand-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
                <p className="text-brand-blue text-xs uppercase tracking-widest animate-pulse">Loading Dashboard...</p>
            </div>
        </div>
    );

    // --- ERROR STATE ---
    if (error) return (
        <div className="min-h-screen bg-brand-black flex items-center justify-center text-red-500">
             <div className="flex items-center gap-3 border border-red-500/30 bg-red-900/10 px-6 py-4 rounded">
                <FaExclamationTriangle />
                <span className="text-sm uppercase tracking-widest">{error}</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-brand-black text-white pt-24 pb-12 px-6 selection:bg-brand-blue selection:text-white font-sans">
            
            {/* Background Decor */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none z-0" />
            
            <div className="container mx-auto max-w-7xl relative z-10">
                
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/10 pb-6">
                    <div>
                        <h2 className="text-brand-blue font-body tracking-[0.4em] text-xs uppercase font-bold mb-2 flex items-center gap-2">
                            <MdDashboard /> Overview
                        </h2>
                        <h1 className="text-3xl md:text-5xl font-display font-bold uppercase tracking-widest leading-none">
                            Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Dashboard</span>
                        </h1>
                    </div>
                    <div className="mt-4 md:mt-0 text-right">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">System Status</p>
                        <div className="flex items-center justify-end gap-2 text-green-400 text-xs font-mono">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            OPERATIONAL
                        </div>
                    </div>
                </div>

                {/* --- STATS CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Card 1: Users */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="p-6 border border-white/10 bg-white/[0.02] rounded-lg relative overflow-hidden group hover:bg-white/[0.04] transition-colors"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-brand-blue group-hover:scale-110 transition-transform duration-500">
                            <FaUsers size={80} />
                        </div>
                        <div className="relative z-10">
                            <div className="p-3 bg-brand-blue/10 w-fit rounded mb-4 text-brand-blue">
                                <FaUsers size={20} />
                            </div>
                            <h3 className="text-3xl font-display font-bold text-white mb-1">{stats.total_users}</h3>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">Registered Users</p>
                        </div>
                    </motion.div>

                    {/* Card 2: Uploads */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="p-6 border border-white/10 bg-white/[0.02] rounded-lg relative overflow-hidden group hover:bg-white/[0.04] transition-colors"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-green-500 group-hover:scale-110 transition-transform duration-500">
                            <FaFileUpload size={80} />
                        </div>
                        <div className="relative z-10">
                            <div className="p-3 bg-green-500/10 w-fit rounded mb-4 text-green-500">
                                <FaFileUpload size={20} />
                            </div>
                            <h3 className="text-3xl font-display font-bold text-white mb-1">{stats.total_uploads}</h3>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">Total Analyses</p>
                        </div>
                    </motion.div>

                    {/* Card 3: Admins */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="p-6 border border-white/10 bg-white/[0.02] rounded-lg relative overflow-hidden group hover:bg-white/[0.04] transition-colors"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-yellow-500 group-hover:scale-110 transition-transform duration-500">
                            <FaUserShield size={80} />
                        </div>
                        <div className="relative z-10">
                            <div className="p-3 bg-yellow-500/10 w-fit rounded mb-4 text-yellow-500">
                                <FaUserShield size={20} />
                            </div>
                            <h3 className="text-3xl font-display font-bold text-white mb-1">{stats.total_admins}</h3>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">System Admins</p>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* --- USER DISTRIBUTION CHART --- */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                        className="border border-white/10 bg-white/[0.02] rounded-lg p-6 flex flex-col"
                    >
                        <h4 className="font-display uppercase tracking-widest text-sm mb-6 text-white border-b border-white/10 pb-4">
                            User Metrics
                        </h4>
                        
                        <div className="flex-grow flex flex-col items-center justify-center">
                            
                            {/* Chart Container */}
                            <div className="relative w-[220px] h-[220px]">
                                <Doughnut data={chartData} options={chartOptions} />
                                
                                {/* Center Text Overlay - Now Perfectly Aligned */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-5xl font-display font-bold text-white leading-none">
                                        {stats.total_users + stats.total_admins}
                                    </span>
                                    <span className="text-[9px] text-gray-500 uppercase tracking-[0.2em] mt-2">
                                        Total Accounts
                                    </span>
                                </div>
                            </div>

                            {/* Custom Legend - Cleaner Look */}
                            <div className="flex gap-8 mt-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Users</span>
                                        <span className="text-sm font-bold text-white leading-none">{stats.total_users}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Admins</span>
                                        <span className="text-sm font-bold text-white leading-none">{stats.total_admins}</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </motion.div>

                    {/* --- SYSTEM HEALTH --- */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                        className="border border-white/10 bg-white/[0.02] rounded-lg p-6 flex flex-col"
                    >
                        <h4 className="font-display uppercase tracking-widest text-sm mb-6 text-white border-b border-white/10 pb-4 flex justify-between items-center">
                            <span>System Diagnostics</span>
                            <FaSync className="text-gray-600 cursor-pointer hover:text-white transition-colors" size={12} onClick={() => window.location.reload()} />
                        </h4>
                        
                        <div className="flex flex-col gap-4 flex-grow">
                            {/* Health Item 1 */}
                            <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-green-500/10 text-green-500 rounded-full">
                                        <FaServer size={14} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-200">Server Status</p>
                                        <p className="text-[10px] text-gray-500 uppercase">Latency: 24ms</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-2 py-1 bg-green-500/10 text-green-500 rounded text-[10px] font-bold uppercase tracking-wider">
                                    <FaCheckCircle /> Online
                                </div>
                            </div>

                            {/* Health Item 2 */}
                            <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-full">
                                        <FaDatabase size={14} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-200">Database Cluster</p>
                                        <p className="text-[10px] text-gray-500 uppercase">MongoDB Atlas</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-2 py-1 bg-green-500/10 text-green-500 rounded text-[10px] font-bold uppercase tracking-wider">
                                    <FaCheckCircle /> Connected
                                </div>
                            </div>

                            {/* Health Item 3 */}
                            <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-purple-500/10 text-purple-500 rounded-full">
                                        <FaRobot size={14} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-200">AI Inference Engine</p>
                                        <p className="text-[10px] text-gray-500 uppercase">TensorFlow / PyTorch</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-2 py-1 bg-green-500/10 text-green-500 rounded text-[10px] font-bold uppercase tracking-wider">
                                    <FaCheckCircle /> Ready
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/5 text-center">
                             <p className="text-[10px] text-gray-600 font-mono">
                                LAST SYSTEM CHECK: {new Date().toLocaleTimeString()}
                             </p>
                        </div>
                    </motion.div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;