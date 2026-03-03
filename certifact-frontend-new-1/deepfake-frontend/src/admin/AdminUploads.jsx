import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaFileUpload, FaSearch, FaImage, FaVideo, FaFileAlt, FaDownload, FaExternalLinkAlt } from 'react-icons/fa';

const AdminUploads = () => {
    const [uploads, setUploads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUploads = async () => {
            try {
                // Ensure we get the correct token regardless of login method
                const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
                
                // Use full URL to avoid port 5173/5000 confusion
                const res = await axios.get('http://localhost:5000/admin/uploads', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUploads(res.data);
            } catch (err) {
                console.error("Error fetching uploads:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUploads();
    }, []);

    // Helper to determine the correct image source from backend data
    const getMediaSrc = (item) => {
        // Prioritize thumbnail, fallback to original file
        const path = item.thumbnail_url || item.file_url;
        if (!path) return null;
        return `http://localhost:5000${path}`;
    };

    // Filter Logic
    const filteredUploads = uploads.filter(up => 
        (up.filename && up.filename.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (up.label && up.label.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return (
        <div className="min-h-screen bg-brand-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
                <p className="text-brand-blue text-xs uppercase tracking-widest animate-pulse">Retrieving Evidence...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-brand-black text-white pt-24 pb-12 px-6 selection:bg-brand-blue selection:text-white font-sans">
            
            {/* Background Decor */}
            <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none z-0" />

            <div className="container mx-auto max-w-7xl relative z-10">
                
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/10 pb-6">
                    <div>
                        <h2 className="text-brand-blue font-body tracking-[0.4em] text-xs uppercase font-bold mb-2 flex items-center gap-2">
                            <FaFileUpload /> System Database
                        </h2>
                        <h1 className="text-3xl md:text-5xl font-display font-bold uppercase tracking-widest leading-none">
                            Upload <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">History</span>
                        </h1>
                    </div>

                    {/* Search Bar */}
                    <div className="mt-6 md:mt-0 relative w-full md:w-64">
                        <input 
                            type="text" 
                            placeholder="SEARCH FILES..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/50 border border-white/20 px-4 py-2 pl-10 text-xs font-mono text-white focus:outline-none focus:border-brand-blue transition-colors uppercase placeholder-gray-600 rounded"
                        />
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
                    </div>
                </div>

                {/* --- DATA TABLE --- */}
                <div className="border border-white/10 bg-[#0c0c0c] rounded-lg overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                                    <th className="p-4 w-20 text-center">Preview</th>
                                    <th className="p-4">File Metadata</th>
                                    <th className="p-4 text-center">Type</th>
                                    <th className="p-4 text-center">Prediction</th>
                                    <th className="p-4 text-center">Confidence</th>
                                    <th className="p-4 text-right">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {filteredUploads.length > 0 ? (
                                    filteredUploads.map((up, index) => (
                                        <motion.tr 
                                            key={up._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-white/[0.02] transition-colors group"
                                        >
                                            {/* Preview Column */}
                                            <td className="p-4">
                                                <div className="w-12 h-12 rounded bg-black border border-white/10 overflow-hidden flex items-center justify-center relative">
                                                    {getMediaSrc(up) ? (
                                                        <img 
                                                            src={getMediaSrc(up)} 
                                                            alt="Thumb" 
                                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                        />
                                                    ) : (
                                                        <FaFileAlt className="text-gray-600" />
                                                    )}
                                                    
                                                    {/* Hover Overlay Icon */}
                                                    <a 
                                                        href={`http://localhost:5000${up.file_url}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                                    >
                                                        <FaExternalLinkAlt size={10} />
                                                    </a>
                                                </div>
                                            </td>

                                            {/* Filename Column */}
                                            <td className="p-4">
                                                <div className="font-mono text-xs text-gray-300 break-all max-w-[200px] md:max-w-xs">
                                                    {up.filename}
                                                </div>
                                                <div className="text-[10px] text-gray-600 mt-1 uppercase tracking-wide">
                                                    ID: {up._id.slice(-6)}
                                                </div>
                                            </td>

                                            {/* Type Column */}
                                            <td className="p-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                    up.type === 'video' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                                    up.type === 'image' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                    'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                                }`}>
                                                    {up.type === 'video' ? <FaVideo /> : up.type === 'image' ? <FaImage /> : <FaFileAlt />}
                                                    {up.type || 'UNK'}
                                                </span>
                                            </td>

                                            {/* Prediction Column */}
                                            <td className="p-4 text-center">
                                                {up.label ? (
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                                                        up.label === 'Real' 
                                                            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                    }`}>
                                                        {up.label}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-600 italic text-xs">Pending</span>
                                                )}
                                            </td>

                                            {/* Confidence Column */}
                                            <td className="p-4">
                                                {up.confidence_percent ? (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-xs font-mono font-bold text-gray-300">{up.confidence_percent}%</span>
                                                        <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full rounded-full ${up.label === 'Real' ? 'bg-green-500' : 'bg-red-500'}`} 
                                                                style={{ width: `${up.confidence_percent}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center text-gray-600">-</div>
                                                )}
                                            </td>

                                            {/* Timestamp Column */}
                                            <td className="p-4 text-right">
                                                <div className="text-xs text-gray-400 font-mono">
                                                    {new Date(up.timestamp).toLocaleDateString()}
                                                </div>
                                                <div className="text-[10px] text-gray-600">
                                                    {new Date(up.timestamp).toLocaleTimeString()}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="p-12 text-center text-gray-500 uppercase tracking-widest text-xs">
                                            No records found in database.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Footer Stats */}
                    <div className="bg-white/5 border-t border-white/10 p-3 flex justify-between items-center px-6">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Total Records: {uploads.length}</span>
                        <div className="flex gap-2">
                             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                             <span className="text-[10px] text-green-500 uppercase tracking-widest">Database Active</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminUploads;