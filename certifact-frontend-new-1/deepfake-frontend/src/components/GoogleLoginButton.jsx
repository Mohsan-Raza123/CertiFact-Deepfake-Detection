import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import axios from 'axios';
import { auth, googleProvider } from '../firebase';
import useToast from '../hooks/useToast';

// Get the API base URL from your .env file (with fallback)
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const { showSuccessToast, showErrorToast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      // 1. Trigger Firebase Google Sign-In popup
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      // 2. Send the Firebase token to your Flask backend
      const response = await axios.post(`${API_URL}/api/auth/google-signin`, {
        token: idToken,
      });
      
      const authToken = response.data.access_token;
      if (!authToken) {
        throw new Error("Login failed, no token received from server.");
      }

      // 3. Store the token and navigate
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('username', user.displayName); // Optional: Store name for dashboard greeting
      
      showSuccessToast('Identity Verified', `Welcome, ${user.displayName}`);
      navigate('/dashboard'); // Changed to /dashboard to match the flow of the main login

    } catch (error) {
      console.error('Google Sign-In Error:', error);
      const msg = error.response?.data?.error || "Authentication handshake failed.";
      showErrorToast('Google Login Failed', msg);
    }
  };

  return (
    <button 
      type="button" // Critical: prevents submitting the parent form if placed inside one
      onClick={handleGoogleSignIn}
      className="w-full group relative flex items-center justify-center gap-3 py-4 bg-transparent border border-white/20 hover:bg-white hover:text-black transition-all duration-300 rounded-lg overflow-hidden"
    >
      {/* Google SVG Icon */}
      <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.223 0-9.657-3.657-11.303-8l-6.571 4.819C9.656 39.663 16.318 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.49 44 30.651 44 24c0-1.341-.138-2.65-.389-3.917z" />
      </svg>
      
      <span className="font-bold uppercase tracking-[0.2em] text-xs">
        Access via Google
      </span>
    </button>
  );
};

export default GoogleLoginButton;