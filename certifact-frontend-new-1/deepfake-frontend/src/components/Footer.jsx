import React from 'react';
import { Link } from 'react-router-dom';
import { MdVerifiedUser } from 'react-icons/md';

const Footer = () => {
  return (
    <footer className="bg-brand-black border-t border-white/10 pt-16 pb-8 mt-auto relative z-10">
      <div className="container mx-auto px-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start mb-12">
          {/* 1. BRAND SECTION */}
          <div className="mb-10 md:mb-0 max-w-sm">
            <Link to="/" className="flex items-center gap-2 mb-4 group text-decoration-none">
              <MdVerifiedUser size={24} className="text-brand-blue" />
              <span className="text-xl font-display font-bold text-white tracking-[0.2em] uppercase leading-none group-hover:text-brand-blue transition-colors duration-300">
                CERTI<span className="text-brand-blue">FACT</span>
              </span>
            </Link>
            <p className="text-gray-500 font-body text-[10px] uppercase tracking-widest leading-loose">
              The standard for digital authenticity verification. <br />
              Powered by advanced neural networks.
            </p>
          </div>

          {/* 2. NAVIGATION LINKS */}
          <div className="flex gap-12 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
            <div className="flex flex-col gap-4">
              <h4 className="text-white mb-2 opacity-100">System</h4>
              <Link to="/about" className="hover:text-brand-blue hover:translate-x-1 transition-all duration-300 block">About</Link>
              <Link to="/help" className="hover:text-brand-blue hover:translate-x-1 transition-all duration-300 block">Help Center</Link>
              <Link to="/analyze" className="hover:text-brand-blue hover:translate-x-1 transition-all duration-300 block">Analysis</Link>
            </div>
            
            <div className="flex flex-col gap-4">
              <h4 className="text-white mb-2 opacity-100">Legal</h4>
              <Link to="#" className="hover:text-brand-blue hover:translate-x-1 transition-all duration-300 block">Privacy Policy</Link>
              <Link to="#" className="hover:text-brand-blue hover:translate-x-1 transition-all duration-300 block">Terms of Use</Link>
            </div>
          </div>
        </div>

        {/* 3. COPYRIGHT BAR */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-white/5 pt-8">
          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Certifact Systems. All rights reserved.
          </p>
          
          {/* Social Placeholders (Circles) */}
          <div className="flex gap-4">
            {['Tw', 'Li', 'Gh'].map((social, idx) => (
              <a 
                key={idx} 
                href="#" 
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[8px] text-white/50 hover:bg-brand-blue hover:text-black hover:border-brand-blue transition-all duration-300"
              >
                {social}
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;