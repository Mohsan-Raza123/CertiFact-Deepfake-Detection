import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaDownload, 
  FaSpinner, 
  FaFileAlt, 
  FaVideo, 
  FaImage, 
  FaArrowLeft, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaEye,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import api from '../api/client';
import { useAppContext } from '../context/AppContext';

const Results = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  
  // CHANGED: Initial state is now FALSE (Hidden by default)
  const [showAnalytics, setShowAnalytics] = useState(false); 

  const [error, setError] = useState(null);
  const { addHistoryEntry } = useAppContext();

  // --- 1. DATA FETCHING ---
  useEffect(() => {
    const fetchResultData = async () => {
      if (!id) {
        setError("No result ID was provided.");
        setIsLoading(false);
        return;
      }
      try {
        const data = await api.getResult(id);
        setResult(data);
        if (addHistoryEntry) addHistoryEntry(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Error fetching results.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchResultData();
  }, [id, addHistoryEntry]);

  // --- 2. CRITICAL: URL HELPER FOR VIDEO PLAYBACK ---
  const getMediaUrl = (path) => {
    if (!path) return "";
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    const parts = cleanPath.split('/');
    const filename = parts.pop();
    const encodedFilename = encodeURIComponent(filename);
    const finalPath = [...parts, encodedFilename].join('/');
    return `http://localhost:5000/${finalPath}`;
  };

  // --- 3. DOWNLOAD HANDLER ---
  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error("Please log in.");

      const response = await fetch(`http://localhost:5000/api/results/${id}/report`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Report generation failed.');

      const disposition = response.headers.get('Content-Disposition');
      let filename = `Report_${id}.pdf`;
      if (disposition && disposition.includes('filename=')) {
        filename = disposition.split('filename=')[1].replace(/['"]/g, '');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      alert(`Download error: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center text-red-500">
      <div className="text-center">
        <FaExclamationTriangle size={40} className="mb-4 mx-auto" />
        <p>{error}</p>
      </div>
    </div>
  );

  if (!result) return null;

  // --- LOGIC ---
  const label = result.label || "Unknown";
  const isAI = ['AI-generated', 'Deepfake', 'AI', 'MANIPULATED'].includes(label);
  const accentColor = isAI ? 'text-red-500' : 'text-brand-blue';
  const borderColor = isAI ? 'border-red-500' : 'border-brand-blue';
  const bgColor = isAI ? 'bg-red-500' : 'bg-brand-blue';

  const hasHeatmap = result.heatmap_url && result.heatmap_url.length > 0;
  const showHeatmapOption = hasHeatmap && isAI && result.type !== 'document';

  const confidenceVal = result.confidence_percent || (result.confidence ? result.confidence * 100 : 0);
  const confidenceStr = typeof confidenceVal === 'number' ? confidenceVal.toFixed(2) : "0.00";

  return (
    <div className="min-h-screen bg-brand-black text-white pt-24 pb-12 px-6 selection:bg-brand-blue selection:text-white">
      
      {/* Background Decor */}
      <div className={`fixed top-0 left-0 w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none opacity-20 ${isAI ? 'bg-red-600' : 'bg-brand-blue'}`} />

      <div className="container mx-auto max-w-6xl relative z-10">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <Link to="/history" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 mb-4 md:mb-0">
            <FaArrowLeft /> <span className="text-xs uppercase tracking-widest">Return to Log</span>
          </Link>
          
          <button 
            onClick={handleDownload} 
            disabled={isDownloading}
            className="px-6 py-2 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors flex items-center gap-2 rounded-lg"
          >
            {isDownloading ? <FaSpinner className="animate-spin" /> : <FaDownload />}
            Download Report
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* --- LEFT: MEDIA VIEWER / TEXT CONTENT --- */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="border border-white/10 bg-white/[0.02] backdrop-blur-md rounded-lg overflow-hidden flex flex-col h-[500px]" 
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
              <h3 className="font-display uppercase tracking-widest text-sm flex items-center gap-2">
                {result.type === 'video' ? <FaVideo className="text-brand-blue" /> : 
                 result.type === 'document' ? <FaFileAlt className="text-brand-blue" /> : 
                 <FaImage className="text-brand-blue" />}
                Source Evidence
              </h3>
              
              {/* Custom Toggle Switch for Heatmap (Video/Image only) */}
              {showHeatmapOption && (
                <label className="flex items-center cursor-pointer gap-3">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400">Forensic Overlay</span>
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={showHeatmap} onChange={(e) => setShowHeatmap(e.target.checked)} />
                    <div className={`w-10 h-5 rounded-full shadow-inner transition-colors ${showHeatmap ? 'bg-brand-blue' : 'bg-gray-700'}`}></div>
                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow transition-transform ${showHeatmap ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </div>
                </label>
              )}
            </div>

            <div className="flex-grow bg-black/50 flex flex-col relative overflow-hidden">
              {/* --- DOCUMENT TEXT LOGIC --- */}
              {result.type === 'document' ? (
                result.text_content ? (
                  <div className="w-full h-full p-6 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center gap-2 mb-4 text-xs text-gray-400 uppercase tracking-widest border-b border-white/10 pb-2">
                       <FaFileAlt /> Extracted Text Content
                    </div>
                    <p className="font-mono text-xs md:text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {result.text_content}
                    </p>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4">
                    <FaFileAlt size={60} className="text-gray-600 mb-4" />
                    <p className="text-white font-mono text-sm">{result.filename}</p>
                    <p className="text-gray-500 text-xs mt-2">No preview text available.</p>
                  </div>
                )
              ) : (
                // --- IMAGE / VIDEO LOGIC ---
                <div className="w-full h-full flex items-center justify-center bg-black">
                  {result.type === 'video' ? (
                    <video 
                      controls 
                      className="w-full h-full object-contain" 
                      src={getMediaUrl(result.file_url)}
                      poster={getMediaUrl(result.thumbnail_url)}
                      key={result.file_url} 
                    >
                      <source src={getMediaUrl(result.file_url)} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img
                      src={showHeatmap ? getMediaUrl(result.heatmap_url) : getMediaUrl(result.thumbnail_url || result.file_url)}
                      alt="Analysis Evidence"
                      className="w-full h-full object-contain"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=Preview+Error'; }}
                    />
                  )}
                  {showHeatmap && (
                    <div className="absolute bottom-4 left-4 bg-black/80 px-3 py-1 rounded border border-brand-blue text-brand-blue text-[10px] uppercase tracking-widest flex items-center gap-2">
                      <FaEye /> Grad-CAM Layer Active
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* --- RIGHT: DIAGNOSTICS --- */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6"
          >
            {/* 1. Main Verdict Card */}
            <div className={`p-8 border ${borderColor} bg-${isAI ? 'red-900/10' : 'blue-900/10'} rounded-lg relative overflow-hidden`}>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                {isAI ? <FaExclamationTriangle size={100} /> : <FaCheckCircle size={100} />}
              </div>
              
              <h4 className="text-gray-400 text-xs uppercase tracking-[0.2em] mb-2">Final Diagnostic</h4>
              <h1 className={`text-5xl md:text-6xl font-display font-bold uppercase tracking-widest ${accentColor} mb-4`}>
                {isAI ? 'FAKE' : 'REAL'}
              </h1>
              
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded bg-white/10 text-white border border-white/10`}>
                  {label}
                </span>
                <span className="text-gray-500 text-xs uppercase tracking-widest">
                  Confidence: <span className="text-white">{confidenceStr}%</span>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-black/30 h-1 mt-6 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${bgColor}`} 
                  style={{ width: `${confidenceStr}%` }}
                ></div>
              </div>
            </div>

            {/* 2. Detailed Metrics (Document Analysis Only) */}
            {result.analytics && result.type === 'document' && (
              <div className="border border-white/10 bg-white/[0.02] rounded-lg p-6">
                
                {/* --- TOGGLE HEADER --- */}
                <div 
                  className="flex justify-between items-center border-b border-white/10 pb-2 mb-4 cursor-pointer group"
                  onClick={() => setShowAnalytics(!showAnalytics)}
                >
                  <h4 className="font-display uppercase tracking-widest text-sm text-white">
                    Semantic Breakdown
                  </h4>
                  <div className="text-gray-400 group-hover:text-white transition-colors">
                    {showAnalytics ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                  </div>
                </div>
                
                {/* --- COLLAPSIBLE CONTENT --- */}
                <AnimatePresence>
                  {showAnalytics && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="text-gray-400 text-xs italic mb-6">
                        "{result.analytics.reasoning || "Standard analysis complete."}"
                      </p>

                      {/* Neural Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-[10px] uppercase tracking-widest mb-1">
                          <span className="text-brand-blue">Neural Pattern Match</span>
                          <span className="text-white">{(result.analytics.model_prob * 100).toFixed(1)}% Match</span>
                        </div>
                        <div className="w-full bg-white/5 h-1 rounded-full">
                          <div className="bg-brand-blue h-full rounded-full" style={{ width: `${result.analytics.model_prob * 100}%` }}></div>
                        </div>
                      </div>

                      {/* Statistical Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-[10px] uppercase tracking-widest mb-1">
                          <span className="text-yellow-500">Statistical Variance</span>
                          <span className="text-white">{((result.analytics.math_prob || 0) * 100).toFixed(1)}% Anomalies</span>
                        </div>
                        <div className="w-full bg-white/5 h-1 rounded-full">
                          <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${(result.analytics.math_prob || 0) * 100}%` }}></div>
                        </div>
                      </div>

                      {/* Divergence Alert */}
                      {Math.abs((result.analytics.model_prob || 0) - (result.analytics.math_prob || 0)) > 0.3 && (
                        <div className="mt-4 p-3 border border-yellow-500/30 bg-yellow-500/10 rounded flex items-start gap-3">
                          <FaExclamationTriangle className="text-yellow-500 mt-0.5 shrink-0" />
                          <p className="text-[10px] text-yellow-200 uppercase tracking-wide leading-relaxed">
                            <strong>Divergence Warning:</strong> Neural vs Statistical models disagree. Score adjusted to reduce false positives.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            )}

            {/* 3. Action Buttons */}
            <div className="mt-auto">
              <Link to="/analyze" className="block text-center py-4 border border-white/10 hover:bg-white/5 transition-colors rounded-lg text-[10px] uppercase tracking-widest font-bold w-full text-brand-blue">
                Perform New Analysis
              </Link>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Results;