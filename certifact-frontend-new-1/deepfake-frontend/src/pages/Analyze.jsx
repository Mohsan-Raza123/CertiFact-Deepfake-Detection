import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import useToast from '../hooks/useToast';
import api from '../api/client';
import { FaFileUpload, FaTasks, FaCheckCircle, FaExclamationCircle, FaFileAlt, FaVideo, FaImage, FaCloudUploadAlt, FaSpinner, FaExclamationTriangle, FaRedo } from 'react-icons/fa';

const STEPS = [
  { label: 'Initialize', icon: <FaFileUpload /> },
  { label: 'Queueing', icon: <FaTasks /> },
  { label: 'Processing', icon: <FaTasks /> },
  { label: 'Complete', icon: <FaCheckCircle /> },
];

const Analyze = () => {
  const [activeTab, setActiveTab] = useState('media');
  const navigate = useNavigate();
  const { setCurrentJob } = useAppContext();
  const { showSuccessToast, showErrorToast } = useToast();
  
  // Media State
  const [mediaFile, setMediaFile] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [jobId, setJobId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('System Ready. Awaiting Input.');
  const [isUploading, setIsUploading] = useState(false);
  const [analysisError, setAnalysisError] = useState(false);
  const pollIntervalRef = useRef(null);

  // Text State
  const [docFile, setDocFile] = useState(null);
  const [textLoading, setTextLoading] = useState(false);
  const [textError, setTextError] = useState(null);
  const [docProgress, setDocProgress] = useState(0);

  useEffect(() => {
    return () => { 
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // --- RESTART / RETRY LOGIC ---
  const handleRetry = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    
    setMediaFile(null);
    setJobId(null);
    setAnalysisError(false);
    setStatusMessage('System Ready. Awaiting Input.');
    setCurrentStep(0);
    setIsUploading(false);
  };

  // --- MEDIA LOGIC ---
  const onMediaDrop = useCallback((acceptedFiles) => {
      if (acceptedFiles?.length > 0) {
          const file = acceptedFiles[0];
          setMediaFile(file);
          setStatusMessage(`Input Detected: ${file.name}`);
          setAnalysisError(false);
          handleMediaUpload(file);
      }
  }, []);

  const { getRootProps: getMediaRootProps, getInputProps: getMediaInputProps, isDragActive: isMediaDragActive } = useDropzone({
      onDrop: onMediaDrop,
      accept: { 'image/*': ['.jpeg', '.png', '.gif'], 'video/*': ['.mp4'] },
      multiple: false,
      disabled: isUploading || (jobId && !analysisError)
  });

  const handleMediaUpload = async (fileToUpload) => {
    setIsUploading(true);
    setStatusMessage('Uploading to Secure Core...');
    setAnalysisError(false);
    setCurrentStep(0);

    try {
      const response = await api.upload(fileToUpload);
      setJobId(response.jobId);
      setCurrentJob({ jobId: response.jobId, file: fileToUpload, createdAt: new Date().toISOString() });
      setStatusMessage('Upload Complete. Job Queued.');
      setCurrentStep(1);
      showSuccessToast('Upload Successful');
      startPollingStatus(response.jobId);
    } catch (error) {
      setStatusMessage(error.message || 'Upload protocol failed.');
      showErrorToast('Upload Failed', error.message);
      setAnalysisError(true);
      setIsUploading(false);
    }
  };

  // --- UPDATED POLLING LOGIC ---
  const startPollingStatus = (currentJobId) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const statusResponse = await api.getStatus(currentJobId);
        // Extract error_message from backend response
        const { status, resultId, error_message } = statusResponse;

        if (status === 'queued') {
          setStatusMessage('Job in Queue...');
          setCurrentStep(1);
        } else if (status === 'processing') {
          setStatusMessage('Neural Engine Processing...');
          setCurrentStep(2);
        } else if (status === 'done') {
          clearInterval(pollIntervalRef.current);
          setStatusMessage('Analysis Protocol Complete.');
          setCurrentStep(3);
          showSuccessToast('Analysis Complete');
          if (resultId) navigate(`/results/${resultId}`);
        } else if (status === 'error') {
          // --- UPDATED HERE ---
          // Use the dynamic message from the backend (which handles 0 faces or >1 faces).
          // Fallback only if backend sends nothing.
          const msg = error_message || 'Analysis failed. Please check your file and try again.';
          throw new Error(msg);
        }
      } catch (error) {
        clearInterval(pollIntervalRef.current);
        setStatusMessage(error.message); // This updates the red box text with "No face detected"
        showErrorToast('Analysis Failed', error.message);
        setAnalysisError(true);
      }
    }, 3000);
  };

  // --- DOCUMENT LOGIC ---
  const onDocDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
        setDocFile(acceptedFiles[0]);
        setTextError(null);
    }
  }, []);

  const { getRootProps: getDocRootProps, getInputProps: getDocInputProps, isDragActive: isDocDragActive } = useDropzone({
    onDrop: onDocDrop,
    accept: { 
        'application/pdf': ['.pdf'], 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 
        'text/plain': ['.txt'] 
    },
    multiple: false
  });

  const handleDocAnalyze = async () => {
    setTextLoading(true);
    setTextError(null);
    setDocProgress(0);

    const progressInterval = setInterval(() => {
        setDocProgress((prev) => {
            if (prev >= 90) return prev; 
            return prev + 10;
        });
    }, 500);

    try {
        if (!docFile) throw new Error("No file selected.");

        const url = 'http://localhost:5000/api/analyze-document';
        const formData = new FormData();
        formData.append('docFile', docFile);

        const token = localStorage.getItem('authToken'); 
        const headers = { 
            'Content-Type': 'multipart/form-data',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const res = await axios.post(url, formData, { headers });
        
        clearInterval(progressInterval);
        setDocProgress(100);

        if (res.data.resultId) {
            showSuccessToast("Analysis Complete");
            setTimeout(() => {
                navigate(`/results/${res.data.resultId}`);
            }, 500);
        } else {
            throw new Error("Analysis finished but no ID returned.");
        }

    } catch (err) {
        clearInterval(progressInterval);
        const msg = err.response?.data?.error || err.message || "Analysis failed";
        setTextError(msg);
        showErrorToast("Analysis Error", msg);
        setTextLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-white pt-24 pb-12 selection:bg-brand-blue selection:text-white">
      
      {/* Background Decor */}
      <div className="fixed top-20 left-0 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="container mx-auto px-6 relative z-10 max-w-5xl">
        
        {/* HEADER */}
        <div className="text-center mb-12">
            <h2 className="text-brand-blue font-body tracking-[0.4em] text-xs uppercase font-bold mb-4">
              Diagnostic Terminal
            </h2>
            <h1 className="text-3xl md:text-5xl font-display font-bold uppercase tracking-widest leading-tight">
              System <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Analysis</span>
            </h1>
        </div>

        {/* MAIN GLASS PANEL */}
        <div className="border border-white/10 bg-white/[0.02] backdrop-blur-md rounded-lg overflow-hidden">
            
            {/* TABS HEADER */}
            <div className="flex border-b border-white/10">
                <button 
                    onClick={() => setActiveTab('media')}
                    className={`flex-1 py-6 text-center text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 ${
                        activeTab === 'media' ? 'bg-brand-blue/10 text-brand-blue border-b-2 border-brand-blue' : 'text-gray-500 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <FaVideo size={16} /> Image & Video
                </button>
                <button 
                    onClick={() => setActiveTab('text')}
                    className={`flex-1 py-6 text-center text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 ${
                        activeTab === 'text' ? 'bg-brand-blue/10 text-brand-blue border-b-2 border-brand-blue' : 'text-gray-500 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <FaFileAlt size={16} /> Document AI
                </button>
            </div>

            {/* TAB CONTENT AREA */}
            <div className="p-8 md:p-12 min-h-[500px] flex flex-col justify-center">
                
                <AnimatePresence mode="wait">
                    {activeTab === 'media' ? (
                        <motion.div 
                            key="media"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className="w-full"
                        >
                            {/* PROGRESS STEPS */}
                            {jobId && !analysisError && (
                                <div className="mb-12">
                                    <div className="flex justify-between relative max-w-3xl mx-auto">
                                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -z-10 -translate-y-1/2"></div>
                                        {STEPS.map((step, index) => {
                                            const isActive = index <= currentStep;
                                            return (
                                                <div key={index} className="flex flex-col items-center bg-brand-black px-2">
                                                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                                                        isActive ? 'border-brand-blue text-brand-blue bg-brand-blue/10 scale-110 shadow-[0_0_15px_rgba(0,174,239,0.3)]' : 'border-white/20 text-white/20'
                                                    }`}>
                                                        {step.icon}
                                                    </div>
                                                    <span className={`text-[8px] uppercase tracking-widest mt-3 transition-colors duration-500 ${isActive ? 'text-brand-blue font-bold' : 'text-gray-600'}`}>
                                                        {step.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* STATUS MESSAGE / ERROR BOX */}
                            <div className="flex justify-center mb-8">
                                {analysisError ? (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-red-500/10 border border-red-500/50 p-4 rounded-lg flex flex-col md:flex-row items-center gap-4 max-w-xl w-full"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FaExclamationTriangle className="text-red-500 text-xl shrink-0" />
                                            <div className="text-left">
                                                <h4 className="text-red-500 font-bold uppercase tracking-widest text-xs mb-1">Analysis Halted</h4>
                                                {/* This will now display: "Validation Failed: No face detected..." */}
                                                <p className="text-red-200 text-sm">{statusMessage}</p>
                                            </div>
                                        </div>
                                        
                                        <button 
                                            onClick={handleRetry}
                                            className="ml-auto px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-100 text-xs font-bold uppercase tracking-wider border border-red-500/30 rounded transition-all flex items-center gap-2 whitespace-nowrap"
                                        >
                                            <FaRedo /> Try Again
                                        </button>
                                    </motion.div>
                                ) : (
                                    <p className="text-sm uppercase tracking-widest font-mono text-brand-blue">
                                        {statusMessage}
                                    </p>
                                )}
                            </div>

                            {/* MEDIA DROPZONE */}
                            <div 
                                {...getMediaRootProps()} 
                                className={`relative border border-white/10 bg-black/40 h-64 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 group overflow-hidden ${
                                    isMediaDragActive ? 'border-brand-blue bg-brand-blue/5' : 'hover:border-white/30'
                                }`}
                            >
                                <input {...getMediaInputProps()} />
                                {!mediaFile && <div className="absolute top-0 left-0 w-full h-[1px] bg-brand-blue shadow-[0_0_15px_#00AEEF] animate-scan-fast opacity-0 group-hover:opacity-100 transition-opacity"></div>}

                                {mediaFile ? (
                                    <div className="text-center z-10">
                                        <div className="w-16 h-16 bg-brand-blue/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-blue text-brand-blue">
                                            {mediaFile.type.startsWith('image/') ? <FaImage size={24} /> : <FaVideo size={24} />}
                                        </div>
                                        <h4 className="text-white font-bold uppercase tracking-widest">{mediaFile.name}</h4>
                                        <p className="text-gray-500 text-xs mt-2 font-mono">{(mediaFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                ) : (
                                    <div className="text-center z-10 p-6">
                                        <FaCloudUploadAlt className="mx-auto text-4xl text-gray-500 mb-4 group-hover:text-brand-blue transition-colors duration-300" />
                                        <h4 className="text-white font-display uppercase tracking-widest mb-2">Initiate Upload</h4>
                                        <p className="text-gray-500 text-xs uppercase tracking-wider">Drag & Drop or Click to Browse</p>
                                        <p className="text-gray-600 text-[10px] mt-4 font-mono">SUPPORTS: MP4, JPEG, PNG, GIF</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="text"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="w-full"
                        >
                            {/* Error Alert */}
                            {textError && (
                                <div className="mb-6 p-4 border border-red-500/30 bg-red-900/10 text-red-400 text-xs uppercase tracking-widest flex items-center gap-3">
                                    <FaExclamationCircle /> {textError}
                                </div>
                            )}

                            {/* DOC PROCESSING OVERLAY */}
                            {textLoading ? (
                                <div className="border border-brand-blue/30 bg-black/40 h-64 flex flex-col items-center justify-center relative overflow-hidden">
                                    {/* Animated Progress Bar */}
                                    <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mb-6">
                                        <motion.div 
                                            className="h-full bg-brand-blue shadow-[0_0_10px_#00AEEF]"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${docProgress}%` }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                    <div className="text-center z-10">
                                        <FaSpinner className="animate-spin text-brand-blue text-2xl mx-auto mb-4" />
                                        <h4 className="text-white font-display uppercase tracking-widest mb-2 animate-pulse">Analyzing Semantics</h4>
                                        <p className="text-gray-500 text-[10px] font-mono uppercase">Please Wait...</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* DOCUMENT DROPZONE */}
                                    <div 
                                        {...getDocRootProps()} 
                                        className={`relative border border-dashed border-white/20 bg-black/20 h-64 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                                            isDocDragActive ? 'border-brand-blue bg-brand-blue/5' : 'hover:border-white/40'
                                        }`}
                                    >
                                        <input {...getDocInputProps()} />
                                        <FaFileAlt className={`mx-auto text-4xl mb-4 transition-colors ${isDocDragActive ? 'text-brand-blue' : 'text-gray-500'}`} />
                                        <h4 className="text-white font-display uppercase tracking-widest mb-2">Document Analysis</h4>
                                        <p className="text-gray-500 text-xs uppercase tracking-wider">Drag & Drop PDF, DOCX, TXT</p>
                                    </div>

                                    {/* SELECTED FILE INFO & ACTION */}
                                    {docFile && (
                                        <div className="mt-6 flex flex-col md:flex-row items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                                            <div className="flex items-center gap-4 mb-4 md:mb-0">
                                                <div className="p-3 bg-brand-blue/10 text-brand-blue rounded">
                                                    <FaFileAlt />
                                                </div>
                                                <div>
                                                    <h5 className="text-white text-sm font-bold uppercase tracking-wider">{docFile.name}</h5>
                                                    <p className="text-gray-500 text-[10px] font-mono">Ready for Inspection</p>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={handleDocAnalyze}
                                                disabled={textLoading}
                                                className="px-8 py-3 bg-brand-blue text-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                                            >
                                                Run Analysis
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Analyze;