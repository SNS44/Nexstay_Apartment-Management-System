import React, { useEffect, useState } from 'react';
import './styles/main.css';
import Navbar from './components/Navbar.jsx';
import Home from './components/Home.jsx';
import RoomsPage from './components/RoomsPage.jsx';
import RoomDetails from './components/RoomDetails.jsx';
import Services from './components/Services.jsx';
import AuthPage from './components/AuthPage.jsx';
import Profile from './components/Profile.jsx';
import AdminPanel from './components/admin/AdminPanel.jsx';
import { DataProvider } from './context/DataContext.jsx';
import { BackgroundParticles } from './components/BackgroundParticles.jsx';
import { ScrollToTop } from './components/ScrollToTop.jsx';
import Footer from './components/Footer.jsx';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const fetchMe = async () => {
    try {
      const res = await fetch('/api/user_current.php');
      const text = await res.text();
      if (!res.ok) {
        // 401 is expected when not logged in
        if (res.status === 401) {
          setUser(null);
          setLoadingUser(false);
          return;
        }
        console.error('User API error:', res.status, text);
        setUser(null);
        setLoadingUser(false);
        return;
      }
      try {
        const data = JSON.parse(text);
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error('Failed to parse user response:', text);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to load current user', error);
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setUser(null);
      // Optional: Navigation to home could be handled here or by params
    }
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
          <p className="text-violet-600 font-medium">Loading your session...</p>
        </div>
      </div>
    );
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <DataProvider user={user} refreshUser={fetchMe}>
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans flex flex-col">
          <BackgroundParticles />

          <Routes>
            {/* Admin Routes */}
            <Route path="/admin/*" element={
              user?.role?.toLowerCase() === 'admin' ? (
                <AdminPanel onLogout={handleLogout} user={user} />
              ) : (
                <Navigate to="/" replace />
              )
            } />

            {/* User Routes */}
            <Route path="/*" element={
              <>
                <div className="relative z-50">
                  <Navbar user={user} onLogout={handleLogout} />
                </div>
                <main className="relative pt-16 flex-grow">
                  <Routes>
                    <Route path="/" element={
                      user?.role?.toLowerCase() === 'admin' ? <Navigate to="/admin" replace /> : <Home user={user} />
                    } />
                    <Route path="/rooms" element={
                      user?.role?.toLowerCase() === 'admin' ? <Navigate to="/admin" replace /> : <RoomsPage user={user} />
                    } />
                    <Route path="/rooms/:id" element={
                      user?.role?.toLowerCase() === 'admin' ? <Navigate to="/admin" replace /> : <RoomDetails user={user} onLogout={handleLogout} />
                    } />
                    <Route path="/services" element={
                      user ? (
                        user.role?.toLowerCase() === 'admin' ? <Navigate to="/admin" replace /> : <Services user={user} onLogout={handleLogout} />
                      ) : <Navigate to="/auth" replace />
                    } />
                    <Route path="/auth" element={
                      user ? (
                        user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'staff'
                          ? <Navigate to="/admin" replace />
                          : <Navigate to="/profile" replace />
                      ) : <AuthPage onSuccess={handleAuthSuccess} />
                    } />
                    <Route path="/profile" element={
                      user ? (
                        user.role?.toLowerCase() === 'admin' ? <Navigate to="/admin" replace /> : <Profile user={user} onLogout={handleLogout} setUser={setUser} />
                      ) : <Navigate to="/auth" replace />
                    } />
                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
                <Footer />
              </>
            } />
          </Routes>

          <ScrollToTop />
        </div>
      </DataProvider>
    </Router>
  );
}

export default App;
