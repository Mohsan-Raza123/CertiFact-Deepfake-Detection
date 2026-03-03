import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import { useAppContext } from '../context/AppContext';

const MainLayout = () => {
  const { toasts, removeToast } = useAppContext();

  return (
    // 1. CONTAINER: Flex column, dark background, full height
    <div className="flex flex-col min-h-screen bg-brand-black text-white relative overflow-x-hidden selection:bg-brand-blue selection:text-white">
      
      {/* 2. NAVBAR: Fixed at the top (handled inside Navbar component) */}
      <Navbar />
      
      {/* 3. MAIN CONTENT: Grows to fill space. 
          'relative z-0' ensures it sits behind the Navbar if needed. 
      */}
      <main className="flex-grow relative z-0">
        <Outlet />
      </main>

      {/* 4. FOOTER: Stays at the bottom */}
      <Footer />

      {/* 5. TOAST CONTAINER: 
          Fixed position so notifications float over the UI 
          without breaking the layout.
      */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4 pointer-events-none">
        {toasts.map((toast) => (
          // Add pointer-events-auto so you can click close buttons inside the toast
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              id={toast.id}
              title={toast.title}
              message={toast.message}
              type={toast.type}
              onClose={removeToast}
            />
          </div>
        ))}
      </div>

    </div>
  );
};

export default MainLayout;