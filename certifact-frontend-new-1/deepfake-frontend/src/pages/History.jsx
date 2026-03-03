import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdHistory, MdAccessTime } from 'react-icons/md';
import { FaFileAlt, FaVideo, FaImage, FaArrowRight, FaSearch } from 'react-icons/fa';
import api from '../api/client';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');

  // --- 1. HELPERS ---
  const formatDateTime = (isoString) => {
    if (!isoString) return 'DATE UNKNOWN';
    return new Date(isoString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // --- 2. DATA FETCHING ---
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.getHistory();
        // Sort by newest first
        const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setHistory(sortedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // --- 3. LOADING STATE ---
  if (loading) return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
        <p className="text-brand-blue text-xs uppercase tracking-widest animate-pulse">Retrieving Archives...</p>
      </div>
    </div>
  );

  // --- 4. ERROR STATE ---
  if (error) return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center text-red-500">
      <p className="text-sm uppercase tracking-widest border border-red-500/30 bg-red-900/10 px-6 py-4 rounded">
        Error: {error}
      </p>
    </div>
  );

  // Filter Logic
  const filteredHistory = history.filter(item => 
    item.filename.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-brand-black text-white pt-24 pb-12 px-6 selection:bg-brand-blue selection:text-white">
      
      {/* Background Decor */}
      <div className="fixed top-40 left-0 w-[400px] h-[400px] bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="container mx-auto relative z-10 max-w-7xl">

        {/* --- HEADER & FILTER --- */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/10 pb-6">
          <div>
            <h2 className="text-brand-blue font-body tracking-[0.4em] text-xs uppercase font-bold mb-2">
              System Logs
            </h2>
            <h1 className="text-3xl md:text-5xl font-display font-bold uppercase tracking-widest leading-none">
              Archived <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Analysis</span>
            </h1>
          </div>

          {/* Search Bar */}
          <div className="mt-6 md:mt-0 relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="SEARCH LOGS..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-black/50 border border-white/20 px-4 py-2 pl-10 text-xs font-mono text-white focus:outline-none focus:border-brand-blue transition-colors uppercase placeholder-gray-600"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
          </div>
        </div>

        {/* --- CONTENT GRID --- */}
        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/10 bg-white/[0.01] rounded-lg">
            <MdHistory className="text-white/20 mb-4" size={60} />
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-6">No Records Found</p>
            <Link to="/analyze" className="px-8 py-3 bg-white text-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-brand-blue transition-colors">
              Initialize New Scan
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHistory.map((item, index) => {
              const label = item.label || "Unknown";
              const isAI = ['AI-generated', 'Deepfake', 'AI', 'MANIPULATED'].includes(label);
              const accentColor = isAI ? 'text-red-500' : 'text-brand-blue';
              const borderColor = isAI ? 'group-hover:border-red-500/50' : 'group-hover:border-brand-blue/50';

              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/results/${item._id}`} className="block group h-full">
                    <div className={`h-full border border-white/10 bg-white/[0.02] rounded-lg overflow-hidden transition-all duration-500 ${borderColor} hover:bg-white/[0.04]`}>
                      
                      {/* 1. THUMBNAIL AREA */}
                      <div className="relative aspect-video bg-black overflow-hidden border-b border-white/5">
                        {/* Status Badge */}
                        <div className="absolute top-3 left-3 z-10">
                          <span className={`px-2 py-1 text-[8px] font-bold uppercase tracking-widest rounded backdrop-blur-md ${isAI ? 'bg-red-500/80 text-white' : 'bg-brand-blue/80 text-black'}`}>
                            {isAI ? 'FAKE' : 'REAL'}
                          </span>
                        </div>

                        {/* Date Badge */}
                        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[8px] text-gray-300 font-mono">
                          <MdAccessTime /> {formatDateTime(item.timestamp)}
                        </div>

                        {/* --- CONTENT PREVIEW LOGIC --- */}
                        {item.type === 'document' ? (
                          <div className="w-full h-full bg-white/5 relative group-hover:bg-white/10 transition-colors">
                            {item.text_snippet ? (
                              // CASE A: We have a text snippet (Show Text)
                              <div className="p-4 h-full overflow-hidden relative">
                                <p className="font-mono text-[9px] leading-relaxed text-gray-400 break-words opacity-80 text-left">
                                  "{item.text_snippet}"
                                </p>
                                {/* Fade out gradient at bottom for text overflow look */}
                                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                              </div>
                            ) : (
                              // CASE B: No text snippet (Show Icon)
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 group-hover:text-brand-blue transition-colors duration-500">
                                <FaFileAlt size={40} className="mb-2" />
                                <span className="text-[10px] uppercase tracking-widest">Document Scan</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          // CASE C: Image or Video (Show Thumbnail)
                          <img
                            src={`http://localhost:5000${item.thumbnail_url}`}
                            alt="Preview"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300/000000/FFFFFF?text=NO+PREVIEW'; }}
                          />
                        )}
                        
                        {/* Overlay Gradient (Only for images/videos, not text) */}
                        {item.type !== 'document' && (
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                        )}
                      </div>

                      {/* 2. DETAILS AREA */}
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-sm font-bold uppercase tracking-wide text-white truncate max-w-[200px]" title={item.filename}>
                            {item.filename}
                          </h3>
                          <div className="text-gray-500">
                            {item.type === 'video' ? <FaVideo /> : item.type === 'image' ? <FaImage /> : <FaFileAlt />}
                          </div>
                        </div>

                        <div className="flex justify-between items-end mt-4">
                          <div>
                            <p className="text-[8px] text-gray-500 uppercase tracking-widest mb-1">Confidence</p>
                            <p className={`text-xl font-display font-bold ${accentColor}`}>
                              {item.confidence_percent || (item.confidence * 100).toFixed(2)}%
                            </p>
                          </div>

                          {/* View Arrow Only */}
                          <div className="p-2 bg-white text-black rounded group-hover:bg-brand-blue transition-colors">
                            <FaArrowRight size={12} />
                          </div>
                        </div>
                      </div>

                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;