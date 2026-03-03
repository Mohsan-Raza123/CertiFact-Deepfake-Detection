import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdMail, IoIosHelpCircleOutline } from 'react-icons/io';
import { MdExpandMore, MdChevronRight } from 'react-icons/md';

// Reusable FAQ Item Component
const FAQItem = ({ title, children, isOpen, onClick }) => {
  return (
    <div className="border border-white/10 bg-white/[0.02] rounded-lg overflow-hidden mb-4 transition-all duration-300 hover:border-brand-blue/30">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-6 text-left focus:outline-none group"
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-brand-blue text-black' : 'bg-white/5 text-brand-blue'}`}>
            <IoIosHelpCircleOutline size={24} />
          </div>
          <span className="font-display uppercase tracking-widest text-sm md:text-base text-white group-hover:text-brand-blue transition-colors">
            {title}
          </span>
        </div>
        <MdExpandMore 
          size={24} 
          className={`text-white/50 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-blue' : ''}`} 
        />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 border-t border-white/5">
              <div className="pt-4 text-brand-gray text-sm font-body leading-loose tracking-wide">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Help = () => {
  const [openIndex, setOpenIndex] = useState(0); // Default first item open

  return (
    <div className="min-h-screen bg-brand-black text-white pt-24 pb-12 selection:bg-brand-blue selection:text-white">
      
      {/* Background Ambience */}
      <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">

        {/* --- 1. HERO SECTION --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h6 className="text-brand-blue font-body tracking-[0.4em] text-xs uppercase font-bold mb-4">
            Support Center
          </h6>
          <h1 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-widest leading-tight mb-6">
            OPERATIONAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">ASSISTANCE</span>
          </h1>
          <p className="text-gray-400 font-body text-xs md:text-sm tracking-[0.1em] uppercase max-w-2xl mx-auto leading-relaxed">
            Find answers to protocol questions and understand the neural architecture behind our detection engine.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          
          {/* --- 2. FAQ ACCORDION (How To Use) --- */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <FAQItem 
              title="Protocol: How to Use the Deepfake Detector" 
              isOpen={openIndex === 0} 
              onClick={() => setOpenIndex(openIndex === 0 ? -1 : 0)}
            >
              <ol className="space-y-4">
                <li className="flex gap-4 items-start group">
                  <span className="text-brand-blue font-mono text-xs mt-1">01.</span>
                  <span>Navigate to the <Link to="/analyze" className="text-brand-blue hover:underline decoration-1 underline-offset-4 font-bold">ANALYZE</Link> page using the main navigation terminal.</span>
                </li>
                <li className="flex gap-4 items-start group">
                  <span className="text-brand-blue font-mono text-xs mt-1">02.</span>
                  <span>Initiate upload by dragging your media file into the drop zone or clicking to browse local storage.</span>
                </li>
                <li className="flex gap-4 items-start group">
                  <span className="text-brand-blue font-mono text-xs mt-1">03.</span>
                  <span>System will auto-queue the file. Monitor the status indicators: <span className="text-white/70">Queued &rarr; Processing &rarr; Complete</span>.</span>
                </li>
                <li className="flex gap-4 items-start group">
                  <span className="text-brand-blue font-mono text-xs mt-1">04.</span>
                  <span>Review the <span className="text-white font-bold">Results Dashboard</span> for the authenticity verdict, confidence score, and forensic heatmaps.</span>
                </li>
                <li className="flex gap-4 items-start group">
                  <span className="text-brand-blue font-mono text-xs mt-1">05.</span>
                  <span>Access archival data anytime via the <span className="text-white font-bold">HISTORY</span> log.</span>
                </li>
              </ol>
            </FAQItem>
          </motion.div>

          {/* --- 3. INFORMATION GRID --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-white/10">
            
            {/* Column 1 */}
            <div className="group">
              <h5 className="font-display text-white uppercase tracking-widest text-sm mb-4 group-hover:text-brand-blue transition-colors">
                Neural Architecture
              </h5>
              <p className="text-gray-500 text-[10px] uppercase tracking-wider leading-loose">
                Our system utilizes advanced convolutional neural networks trained on vast datasets. It detects subtle pixel artifacts and lighting inconsistencies invisible to the naked eye.
              </p>
            </div>

            {/* Column 2 */}
            <div className="group">
              <h5 className="font-display text-white uppercase tracking-widest text-sm mb-4 group-hover:text-brand-blue transition-colors">
                Data Security
              </h5>
              <p className="text-gray-500 text-[10px] uppercase tracking-wider leading-loose">
                Privacy is paramount. Uploaded media is processed in isolated, ephemeral containers and permanently purged from our servers immediately after analysis completion.
              </p>
            </div>

            {/* Column 3 */}
            <div className="group">
              <h5 className="font-display text-white uppercase tracking-widest text-sm mb-4 group-hover:text-brand-blue transition-colors">
                Interpreting Results
              </h5>
              <p className="text-gray-500 text-[10px] uppercase tracking-wider leading-loose">
                Detection is probabilistic. A "Deepfake" verdict indicates high mathematical probability of manipulation. Results should serve as strong indicators within a broader verification workflow.
              </p>
            </div>

          </div>

          {/* --- 4. CONTACT CTA --- */}
          <div className="text-center mt-20">
            <p className="text-white/40 text-[10px] uppercase tracking-widest mb-6">
              Requires further technical assistance?
            </p>
            <button className="group px-8 py-3 border border-white/20 rounded-lg text-white font-bold uppercase tracking-[0.2em] text-xs hover:bg-brand-blue hover:border-brand-blue hover:text-black transition-all duration-300 flex items-center gap-3 mx-auto">
              <IoMdMail className="text-lg group-hover:scale-110 transition-transform" />
              <span>Contact Support</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Help;