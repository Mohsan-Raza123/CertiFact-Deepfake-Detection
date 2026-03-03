import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdSecurity, MdSpeed, MdAutoFixHigh, MdWarning } from 'react-icons/md';
import api from '../api/client';

// Video Import
import videoBackground from '../assets/second_video.mp4';

const Home = () => {
  const [isBackendOnline, setIsBackendOnline] = React.useState(true);

  // --- PRESERVED BACKEND CHECK LOGIC ---
  React.useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await api.getHealth();
        if (response && response.status === 'ok') {
          setIsBackendOnline(true);
        } else {
          setIsBackendOnline(false);
        }
      } catch (error) {
        console.error("Backend health check failed:", error);
        setIsBackendOnline(false);
      }
    };
    checkBackendStatus();
  }, []);
  // -------------------------------------

  return (
    <div className="bg-brand-black min-h-screen text-white overflow-x-hidden selection:bg-brand-blue selection:text-white">
      
      {/* =========================================
          1. HERO SECTION (Cinematic Video)
         ========================================= */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        
        {/* A. Background Video Layer */}
        <div className="absolute inset-0 z-0">
          <video 
            className="w-full h-full object-cover opacity-60"
            src={videoBackground} 
            autoPlay 
            loop 
            muted 
            playsInline
          />
          {/* Gradient Overlays for Readability & Mood */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-black/40" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050505_120%)]" />
        </div>

        {/* B. Hero Content Layer */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Top Tagline */}
            <div className="flex items-center justify-center gap-4 mb-6 opacity-80">
               <div className="h-[1px] w-8 md:w-12 bg-brand-blue"></div>
               <span className="text-brand-blue font-body tracking-[0.4em] text-[10px] md:text-xs uppercase font-bold">
                 System V2.0 // Neural Engine
               </span>
               <div className="h-[1px] w-8 md:w-12 bg-brand-blue"></div>
            </div>

            {/* Main Title - FIXED SPACING */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold uppercase leading-tight mb-8 drop-shadow-2xl">
              <span className="block tracking-widest text-white">
                DETECT
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-white to-brand-blue tracking-widest opacity-90">
                CONFIDENCE
              </span>
            </h1>

            {/* Description Paragraph */}
            <p className="text-gray-400 font-body text-xs md:text-sm tracking-[0.2em] uppercase leading-loose max-w-2xl mx-auto mb-12 border-l-2 border-brand-blue/50 pl-6 md:border-none md:pl-0">
              Our advanced AI-powered platform helps you identify manipulated media with military-grade precision.
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-col md:flex-row justify-center items-center gap-6">
              <Link to="/analyze">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  // ADDED: rounded-lg
                  className="px-10 py-4 bg-white text-brand-black font-bold uppercase tracking-[0.25em] text-xs hover:bg-brand-blue transition-colors duration-500 min-w-[200px] rounded-lg"
                >
                  Start Analysis
                </motion.button>
              </Link>

              <Link to="/about">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  // ADDED: rounded-lg
                  className="px-10 py-4 border border-white/20 text-white font-bold uppercase tracking-[0.25em] text-xs hover:bg-white/10 hover:border-white transition-all duration-500 min-w-[200px] rounded-lg"
                >
                  Learn More
                </motion.button>
              </Link>
            </div>

            {/* Backend Status Warning (Only shows if offline) */}
            {!isBackendOnline && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-12 inline-flex items-center gap-3 px-6 py-3 bg-red-900/20 border border-red-500/30 rounded-full backdrop-blur-md"
              >
                <MdWarning className="text-red-500 animate-pulse" />
                <span className="text-red-400 text-[10px] uppercase tracking-widest font-bold">
                  System Offline: Mock Mode Active
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-40 hidden md:block">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[8px] uppercase tracking-widest text-white/50">Scroll</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent"></div>
          </div>
        </div>
      </section>

      {/* =========================================
          2. FEATURES SECTION (Glass Panels)
         ========================================= */}
      <section className="py-24 bg-brand-black relative z-10">
        <div className="container mx-auto px-6">
          
          <div className="text-center mb-20">
            <h2 className="text-3xl font-display font-bold uppercase tracking-[0.2em] mb-4 text-white">
              Core <span className="text-brand-blue">Specifications</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-brand-blue to-transparent mx-auto opacity-50"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1: Accuracy */}
            <div className="group p-8 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 hover:border-brand-blue/30 relative overflow-hidden rounded-lg">
              <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500">
                <MdSecurity size={150} />
              </div>
              <MdSecurity size={40} className="text-brand-blue mb-6" />
              <h5 className="text-lg font-display text-white uppercase tracking-widest mb-4 group-hover:text-brand-blue transition-colors">
                High Accuracy
              </h5>
              <p className="text-brand-gray text-xs tracking-wider leading-relaxed font-body uppercase">
                Utilizing state-of-the-art neural networks for precise artifact detection in complex media.
              </p>
            </div>

            {/* Feature 2: Speed */}
            <div className="group p-8 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 hover:border-brand-blue/30 relative overflow-hidden rounded-lg">
              <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500">
                <MdSpeed size={150} />
              </div>
              <MdSpeed size={40} className="text-brand-blue mb-6" />
              <h5 className="text-lg font-display text-white uppercase tracking-widest mb-4 group-hover:text-brand-blue transition-colors">
                Ultra Fast
              </h5>
              <p className="text-brand-gray text-xs tracking-wider leading-relaxed font-body uppercase">
                Real-time processing engine delivers instant analysis without latency bottlenecks.
              </p>
            </div>

            {/* Feature 3: AI Logic */}
            <div className="group p-8 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 hover:border-brand-blue/30 relative overflow-hidden rounded-lg">
              <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500">
                 <MdAutoFixHigh size={150} />
              </div>
              <MdAutoFixHigh size={40} className="text-brand-blue mb-6" />
              <h5 className="text-lg font-display text-white uppercase tracking-widest mb-4 group-hover:text-brand-blue transition-colors">
                Explainable AI
              </h5>
              <p className="text-brand-gray text-xs tracking-wider leading-relaxed font-body uppercase">
                Detailed visual heatmaps explain exactly why a frame was flagged as manipulated.
              </p>
            </div>

          </div>
        </div>
      </section>
      
    </div>
  );
};

export default Home;