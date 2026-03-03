import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import About from './pages/About';
import Help from './pages/Help';
import Analyze from './pages/Analyze';
import Results from './pages/Results';
import History from './pages/History';
import ErrorPage from './pages/ErrorPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings'; 

// --- ADMIN IMPORTS ---
import AdminLayout from './admin/AdminLayout';
import AdminProtectedRoute from './admin/AdminProtectedRoute';
import AdminDashboard from './admin/AdminDashboard';
import AdminUsers from './admin/AdminUsers';
import AdminUploads from './admin/AdminUploads';
import AdminLogs from './admin/AdminLogs';
import AdminSettings from './admin/AdminSettings'; // Ensure this file exists!

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Routes>
          {/* =================================================
              USER ROUTES
             ================================================= */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} /> 
            <Route path="register" element={<Register />} />           
            <Route path="about" element={<About />} />
            <Route path="help" element={<Help />} />

            {/* Protected Routes for Users */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="analyze"
              element={
                <ProtectedRoute>
                  <Analyze />
                </ProtectedRoute>
              }
            />
            <Route
              path="results/:id"
              element={
                <ProtectedRoute>
                  <Results />
                </ProtectedRoute>
              }
            />
            <Route
              path="history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<ErrorPage />} />
          </Route>

          {/* =================================================
              ADMIN ROUTES
             ================================================= */}
          <Route path="/admin" element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }>
            {/* Default to Dashboard */}
            <Route index element={<AdminDashboard />} />
            
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="uploads" element={<AdminUploads />} />
            <Route path="logs" element={<AdminLogs />} />
            
            {/* --- THIS IS THE MISSING LINK --- */}
            <Route path="settings" element={<AdminSettings />} />
          </Route>

        </Routes>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;