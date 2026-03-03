import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaTerminal, FaClock, FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaSearch } from 'react-icons/fa';

const AdminLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                // Check all token types to ensure we find the valid one
                const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
                
                // Use the full URL to ensure we hit the Flask backend (Port 5000)
                const res = await axios.get('http://localhost:5000/admin/logs', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setLogs(res.data);
            } catch (err) {
                console.error("Error fetching logs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    // Helper to get icon based on action type
    const getActionIcon = (action) => {
        const lower = action?.toLowerCase() || '';
        if (lower.includes('error') || lower.includes('failed')) return <FaExclamationCircle className="text-red-500" />;
        if (lower.includes('success') || lower.includes('login')) return <FaCheckCircle className="text-green-500" />;
        return <FaInfoCircle className="text-brand-blue" />;
    };

    // Filter logs
    const filteredLogs = logs.filter(l => 
        (l.action && l.action.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (l.details && l.details.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return (
        <div className="min-h-screen bg-brand-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
                <p className="text-brand-blue text-xs uppercase tracking-widest animate-pulse">Accessing System Kernels...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-brand-black text-white pt-24 pb-12 px-6 selection:bg-brand-blue selection:text-white font-sans">
            
            {/* Background Decor */}
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none z-0" />

            <div className="container mx-auto max-w-5xl relative z-10">
                
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/10 pb-6">
                    <div>
                        <h2 className="text-brand-blue font-body tracking-[0.4em] text-xs uppercase font-bold mb-2 flex items-center gap-2">
                            <FaTerminal /> Administrator
                        </h2>
                        <h1 className="text-3xl md:text-5xl font-display font-bold uppercase tracking-widest leading-none">
                            System <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Logs</span>
                        </h1>
                    </div>

                    {/* Search Bar */}
                    <div className="mt-6 md:mt-0 relative w-full md:w-64">
                        <input 
                            type="text" 
                            placeholder="FILTER EVENTS..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/50 border border-white/20 px-4 py-2 pl-10 text-xs font-mono text-white focus:outline-none focus:border-brand-blue transition-colors uppercase placeholder-gray-600 rounded"
                        />
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
                    </div>
                </div>

                {/* --- TERMINAL WINDOW --- */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-white/10 bg-[#0c0c0c] rounded-lg overflow-hidden shadow-2xl font-mono"
                >
                    {/* Terminal Header */}
                    <div className="bg-white/5 px-4 py-2 flex items-center gap-2 border-b border-white/10">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                        </div>
                        <span className="text-[10px] text-gray-500 ml-2 uppercase tracking-widest">/var/log/certifact_sys.log</span>
                    </div>

                    {/* Logs List */}
                    <div className="p-4 max-h-[600px] overflow-y-auto custom-scrollbar space-y-1">
                        {filteredLogs.length > 0 ? (
                            filteredLogs.map((l, index) => (
                                <motion.div 
                                    key={l._id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="flex items-start gap-3 p-2 hover:bg-white/[0.03] rounded transition-colors group text-xs md:text-sm"
                                >
                                    {/* Timestamp */}
                                    <div className="text-gray-500 shrink-0 w-32 md:w-40 flex items-center gap-1.5">
                                        <FaClock className="text-[10px]" />
                                        <span className="text-[10px] tracking-wide">
                                            {new Date(l.timestamp).toLocaleString(undefined, {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
                                            })}
                                        </span>
                                    </div>

                                    {/* Action Label */}
                                    <div className="shrink-0 w-24 md:w-32 font-bold uppercase tracking-wider text-brand-blue flex items-center gap-2">
                                        {getActionIcon(l.action)}
                                        {l.action}
                                    </div>

                                    {/* Details */}
                                    <div className="text-gray-300 break-all">
                                        <span className="text-gray-600 mr-2 opacity-0 group-hover:opacity-100 transition-opacity select-none">$</span>
                                        {l.details}
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-600 uppercase tracking-widest text-xs">
                                <span className="block mb-2 text-2xl opacity-20">No Data</span>
                                No matching system events found.
                            </div>
                        )}
                        
                        {/* Cursor Blinking Effect at end of logs */}
                        <div className="mt-4 pl-2 flex items-center gap-2 text-brand-blue animate-pulse">
                            <span>_</span>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default AdminLogs;