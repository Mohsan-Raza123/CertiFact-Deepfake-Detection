// frontend/src/context/AppContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { onAuthStateChanged } from 'firebase/auth'; // <-- NEW: Import Firebase auth listener
import { auth } from '../firebase'; // <-- NEW: Import your Firebase config

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // --- NEW: Authentication State ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start loading until Firebase check is done

  // --- All original state is preserved ---
  const [currentJob, setCurrentJob] = useState(null);
  const [toasts, setToasts] = useState([]);
  const location = useLocation();
  const [history, setHistory] = useState(() => {
    try {
      const storedHistory = localStorage.getItem('analysisHistory');
      return storedHistory ? JSON.parse(storedHistory) : [];
    } catch (e) {
      console.error("Failed to parse history from localStorage:", e);
      return [];
    }
  });

  // --- NEW: Firebase Auth Listener ---
  // This effect runs once on mount to check the user's auth status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // If logged in, currentUser is the user object; otherwise, it's null
      setLoading(false); // Set loading to false after the check is complete
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this runs only once

  // --- Original useEffect hooks are preserved ---
  useEffect(() => {
    localStorage.setItem('analysisHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    setToasts([]);
  }, [location]);

  // --- Original callback functions are preserved ---
  const addHistoryEntry = useCallback((resultData) => {
    setHistory((prevHistory) => {
      const isDuplicate = prevHistory.some(item => item._id === resultData._id);
      if (isDuplicate) {
        return prevHistory;
      }
      return [resultData, ...prevHistory];
    });
  }, []);

  const addToast = useCallback((title, message, type = 'info') => {
    const id = uuidv4();
    setToasts((prev) => [...prev, { id, title, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // --- Provide all values (original + new) to the app ---
  const value = {
    // Original values
    currentJob,
    setCurrentJob,
    history,
    addHistoryEntry,
    addToast,
    removeToast,
    toasts,
    // New authentication values
    user,
    loading,
  };

  return (
    <AppContext.Provider value={value}>
      {/* Don't render the app until Firebase has checked auth status */}
      {!loading && children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};