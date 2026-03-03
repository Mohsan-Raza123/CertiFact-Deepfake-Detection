import React from 'react';
import { FaCheck } from 'react-icons/fa';

const ProgressIndicator = ({ steps, currentStep }) => {
  // Calculate width of the active progress line
  const progressWidth = (currentStep / (steps.length - 1)) * 100;

  return (
    <div className="relative w-full mb-12 px-4">
      
      {/* 1. PROGRESS BARS (Lines behind the circles) */}
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -z-10 -translate-y-1/2"></div>
      
      <div 
        className="absolute top-1/2 left-0 h-[1px] bg-brand-blue -z-10 -translate-y-1/2 transition-all duration-700 ease-out shadow-[0_0_10px_#00AEEF]"
        style={{ width: `${progressWidth}%` }}
      ></div>

      {/* 2. STEPS ROW */}
      <div className="flex justify-between items-center w-full">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <div key={index} className="flex flex-col items-center relative group">
              
              {/* Step Circle */}
              <div 
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10 bg-brand-black ${
                  isCompleted 
                    ? 'border-brand-blue bg-brand-blue text-black shadow-[0_0_15px_rgba(0,174,239,0.6)]' 
                    : isActive 
                      ? 'border-brand-blue text-brand-blue shadow-[0_0_15px_rgba(0,174,239,0.4)] scale-110' 
                      : 'border-white/10 text-white/20'
                }`}
              >
                {isCompleted ? (
                  <FaCheck size={10} />
                ) : (
                  <span className="text-[10px] font-bold font-mono">{index + 1}</span>
                )}
              </div>

              {/* Step Label */}
              <div 
                className={`absolute top-12 text-center transition-all duration-500 min-w-[100px] ${
                  isActive 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-50 group-hover:opacity-80'
                }`}
              >
                <span className={`text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold ${
                  isActive || isCompleted ? 'text-white' : 'text-gray-600'
                }`}>
                  {step.label}
                </span>
                
                {/* Optional: Icon below label if passed in step object */}
                {step.icon && isActive && (
                    <div className="mt-1 text-brand-blue opacity-50 flex justify-center text-xs">
                        {step.icon}
                    </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;