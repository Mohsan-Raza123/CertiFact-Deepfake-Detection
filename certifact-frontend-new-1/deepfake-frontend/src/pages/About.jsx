import React from 'react';
import { motion } from 'framer-motion';
import { MdOutlineSecurity, MdScience, MdGroup, MdVerifiedUser, MdInsights } from 'react-icons/md';

const About = () => {
  // Animation variants for staggered reveal
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-brand-black text-white pt-24 pb-12 selection:bg-brand-blue selection:text-white">
      
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_#00AEEF10,_transparent_40%)] pointer-events-none z-0" />

      <div className="container mx-auto px-6 relative z-10">
        
        {/* 1. HERO HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-brand-blue font-body tracking-[0.4em] text-xs uppercase font-bold mb-4">
            Project Overview
          </h2>
          <h1 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-widest leading-tight">
            MISSION <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">CRITICAL</span>
          </h1>
          <div className="w-24 h-1 bg-brand-blue mx-auto mt-8"></div>
          <p className="mt-8 text-gray-400 font-body text-sm tracking-[0.2em] uppercase max-w-2xl mx-auto leading-relaxed">
            Building the next generation of digital authenticity verification.
          </p>
        </motion.div>

        {/* 2. THREE PILLARS (Cards) */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24"
        >
          {/* Card 1: Our Goal */}
          {/* Added rounded-lg */}
          <motion.div variants={itemVariants} className="group p-8 border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-brand-blue/30 transition-all duration-500 relative overflow-hidden rounded-lg">
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
              <MdOutlineSecurity size={120} />
            </div>
            <MdOutlineSecurity size={40} className="text-brand-blue mb-6" />
            <h5 className="text-xl font-display uppercase tracking-widest mb-4">Our Objective</h5>
            <p className="text-gray-400 text-xs tracking-wider leading-loose font-body uppercase">
              In an era of sophisticated digital manipulation, we provide robust military-grade tools to identify synthetic media and restore trust in the digital ecosystem.
            </p>
          </motion.div>

          {/* Card 2: Tech Stack */}
          {/* Added rounded-lg */}
          <motion.div variants={itemVariants} className="group p-8 border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-brand-blue/30 transition-all duration-500 relative overflow-hidden rounded-lg">
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
              <MdScience size={120} />
            </div>
            <MdScience size={40} className="text-brand-blue mb-6" />
            <h5 className="text-xl font-display uppercase tracking-widest mb-4">Architecture</h5>
            <p className="text-gray-400 text-xs tracking-wider leading-loose font-body uppercase">
              Built on <strong>React & Vite</strong> for high-performance rendering. Styled with <strong>Tailwind CSS</strong> for precision. Powered by a <strong>Flask</strong> backend running advanced Neural Networks.
            </p>
          </motion.div>

          {/* Card 3: Team */}
          {/* Added rounded-lg */}
          <motion.div variants={itemVariants} className="group p-8 border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-brand-blue/30 transition-all duration-500 relative overflow-hidden rounded-lg">
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
              <MdGroup size={120} />
            </div>
            <MdGroup size={40} className="text-brand-blue mb-6" />
            <h5 className="text-xl font-display uppercase tracking-widest mb-4">The Team</h5>
            <p className="text-gray-400 text-xs tracking-wider leading-loose font-body uppercase">
              A dedicated unit of final-year engineering students passionate about combating misinformation through innovative Artificial Intelligence solutions.
            </p>
          </motion.div>
        </motion.div>

        {/* 3. CORE FEATURES LIST */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          // Added rounded-lg to the main container
          className="max-w-4xl mx-auto border border-white/10 bg-brand-black/50 backdrop-blur-sm p-8 md:p-12 relative rounded-lg"
        >
          {/* Decorative Corner Lines (Adjusted slightly for rounded corners) */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-brand-blue rounded-tl-lg"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-brand-blue rounded-br-lg"></div>

          <h3 className="text-2xl font-display uppercase tracking-widest text-center mb-12">
            System <span className="text-brand-blue">Capabilities</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
            
            {/* Feature 1 */}
            <div className="flex gap-6 items-start group">
              {/* Changed rounded-none to rounded-lg */}
              <div className="p-3 bg-white/5 rounded-lg border border-white/10 group-hover:border-brand-blue transition-colors">
                <MdVerifiedUser className="text-brand-blue" size={24} />
              </div>
              <div>
                <h4 className="font-display uppercase tracking-widest text-sm mb-2 text-white">Detection Engine</h4>
                <p className="text-gray-500 text-[10px] uppercase tracking-wider leading-relaxed">
                  Deepfake analysis for images and video streams using frame-by-frame inspection.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-6 items-start group">
              {/* Changed rounded-none to rounded-lg */}
              <div className="p-3 bg-white/5 rounded-lg border border-white/10 group-hover:border-brand-blue transition-colors">
                <MdInsights className="text-brand-blue" size={24} />
              </div>
              <div>
                <h4 className="font-display uppercase tracking-widest text-sm mb-2 text-white">Confidence Scoring</h4>
                <p className="text-gray-500 text-[10px] uppercase tracking-wider leading-relaxed">
                  Precise percentage-based probability scores for every analyzed asset.
                </p>
              </div>
            </div>

            {/* Feature 3 (User Console) - CENTERED */}
            <div className="flex gap-6 items-start group md:col-span-2 md:justify-self-center md:max-w-md">
              {/* Changed rounded-none to rounded-lg */}
              <div className="p-3 bg-white/5 rounded-lg border border-white/10 group-hover:border-brand-blue transition-colors">
                <MdGroup className="text-brand-blue" size={24} />
              </div>
              <div>
                <h4 className="font-display uppercase tracking-widest text-sm mb-2 text-white">User Console</h4>
                <p className="text-gray-500 text-[10px] uppercase tracking-wider leading-relaxed">
                  High-fidelity dashboard with full job tracking, history logs, and exportable reports.
                </p>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default About;