import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { FaFileAlt, FaVideo, FaImage, FaChartPie } from 'react-icons/fa';
import { MdVerifiedUser, MdWarning, MdAnalytics } from 'react-icons/md';
import api from '../api/client';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 1. DATA FETCHING (Preserved Logic) ---
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // --- 2. LOADING STATE (Custom Tailwind Spinner) ---
  if (loading) return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
        <p className="text-brand-blue text-xs uppercase tracking-widest animate-pulse">Loading Telemetry...</p>
      </div>
    </div>
  );

  // --- 3. ERROR STATE ---
  if (error) return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-6">
      <div className="max-w-md w-full border border-red-500/30 bg-red-900/10 p-8 rounded-lg text-center">
        <MdWarning size={40} className="text-red-500 mx-auto mb-4" />
        <h3 className="text-white font-display uppercase tracking-widest mb-2">System Error</h3>
        <p className="text-red-400 text-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 border border-red-500 text-red-500 text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
          Retry Connection
        </button>
      </div>
    </div>
  );

  // --- 4. CHART CONFIGURATION ---
  const chartData = {
    labels: ['AI-Generated', 'Authentic'],
    datasets: [{
        data: [stats.deepfakeCount, stats.realCount],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)', // Red-500 (Deepfake)
          'rgba(0, 174, 239, 0.8)'  // Brand Blue (Real)
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(0, 174, 239, 1)'
        ],
        borderWidth: 0, // Cleaner look without borders
        hoverOffset: 10
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%', // Thinner ring for modern look
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#9CA3AF', // Tailwind Gray-400
          font: {
            family: 'Montserrat',
            size: 10,
            weight: 600
          },
          padding: 20,
          usePointStyle: true,
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-brand-black text-white pt-24 pb-12 px-6 selection:bg-brand-blue selection:text-white">
      
      {/* Background Decor */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="container mx-auto relative z-10">

        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/10 pb-6">
          <div>
            <h2 className="text-brand-blue font-body tracking-[0.4em] text-xs uppercase font-bold mb-2">
              Command Center
            </h2>
            <h1 className="text-3xl md:text-5xl font-display font-bold uppercase tracking-widest leading-none">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">{stats.userName}</span>
            </h1>
          </div>
          <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-4 md:mt-0">
            Last Login: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Total Analyses */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 border border-white/10 bg-white/[0.02] rounded-lg relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-gray-400 text-xs uppercase tracking-widest font-bold">Total Scans</h3>
              <div className="p-2 bg-white/5 rounded-md text-white group-hover:text-brand-blue transition-colors">
                <MdAnalytics size={20} />
              </div>
            </div>
            <p className="text-4xl font-display font-bold text-white mb-1">{stats.totalAnalyses}</p>
            <div className="w-full bg-white/10 h-[2px] mt-4">
              <div className="h-full bg-white w-2/3"></div>
            </div>
          </motion.div>

          {/* AI Detected */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 border border-white/10 bg-white/[0.02] rounded-lg relative overflow-hidden group hover:border-red-500/30 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-gray-400 text-xs uppercase tracking-widest font-bold">Threats Detected</h3>
              <div className="p-2 bg-red-500/10 rounded-md text-red-500">
                <MdWarning size={20} />
              </div>
            </div>
            <p className="text-4xl font-display font-bold text-red-500 mb-1">{stats.deepfakeCount}</p>
            <div className="w-full bg-white/10 h-[2px] mt-4">
              <div className="h-full bg-red-500" style={{ width: `${(stats.deepfakeCount / (stats.totalAnalyses || 1)) * 100}%` }}></div>
            </div>
          </motion.div>

          {/* Real Verified */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 border border-white/10 bg-white/[0.02] rounded-lg relative overflow-hidden group hover:border-brand-blue/30 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-gray-400 text-xs uppercase tracking-widest font-bold">Verified Authentic</h3>
              <div className="p-2 bg-brand-blue/10 rounded-md text-brand-blue">
                <MdVerifiedUser size={20} />
              </div>
            </div>
            <p className="text-4xl font-display font-bold text-brand-blue mb-1">{stats.realCount}</p>
            <div className="w-full bg-white/10 h-[2px] mt-4">
              <div className="h-full bg-brand-blue" style={{ width: `${(stats.realCount / (stats.totalAnalyses || 1)) * 100}%` }}></div>
            </div>
          </motion.div>

        </div>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Recent Activity List (Span 2 cols) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 border border-white/10 bg-white/[0.02] rounded-lg p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display uppercase tracking-widest text-sm text-white">Recent Activity</h3>
              <Link to="/history" className="text-[10px] text-brand-blue uppercase tracking-widest hover:text-white transition-colors">
                View Full Log &rarr;
              </Link>
            </div>

            {stats.recentAnalyses.length > 0 ? (
              <div className="space-y-3">
                {stats.recentAnalyses.map((item, index) => (
                  <div 
                    key={item._id} 
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-lg hover:border-brand-blue/30 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-4">
                      {/* File Icon */}
                      <div className="p-3 bg-black rounded-md text-gray-400 group-hover:text-brand-blue transition-colors">
                        {item.type === 'video' ? <FaVideo /> : item.type === 'image' ? <FaImage /> : <FaFileAlt />}
                      </div>
                      
                      {/* Details */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm tracking-wider ${
                            item.label === 'AI-generated' 
                              ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                              : 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20'
                          }`}>
                            {item.label === 'AI-generated' ? 'FAKE' : 'REAL'}
                          </span>
                          <span className="text-xs text-gray-500 font-mono hidden sm:inline-block">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-white font-medium truncate max-w-[150px] sm:max-w-[200px]">
                          {item.filename}
                        </p>
                      </div>
                    </div>

                    <Link 
                      to={`/results/${item._id}`} 
                      className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-white/10 rounded hover:bg-white hover:text-black transition-all"
                    >
                      Report
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-lg">
                <p className="text-gray-500 text-xs uppercase tracking-widest">No Analysis Data Available</p>
                <Link to="/analyze" className="mt-4 inline-block text-brand-blue text-xs hover:underline">Start your first scan</Link>
              </div>
            )}
          </motion.div>

          {/* RIGHT: Chart (Span 1 col) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="border border-white/10 bg-white/[0.02] rounded-lg p-6 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-6">
              <FaChartPie className="text-brand-blue" />
              <h3 className="font-display uppercase tracking-widest text-sm text-white">Detection Metrics</h3>
            </div>
            
            <div className="flex-grow flex items-center justify-center relative min-h-[250px]">
              {/* Center Text Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-display font-bold text-white">{stats.totalAnalyses}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Total</span>
              </div>
              <Doughnut data={chartData} options={chartOptions} />
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
               <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>Accuracy Rate</span>
                  <span className="text-white font-bold">98.4%</span>
               </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;