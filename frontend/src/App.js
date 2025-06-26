import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n';
import './App.css';
import './chess-theme.css';
import { LanguageProvider } from './context/LanguageContext';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './components/pages/Home';
import Contact from './components/pages/Contact';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/profile/Profile';
import Lessons from './components/lessons/Lessons';
import GameZone from './components/game/GameZone';
import GameHistory from './components/game/GameHistory';
import AdminPanel from './components/admin/AdminPanel';
import NotFound from './components/pages/NotFound';
import Puzzles from './components/puzzles/Puzzles';
import PuzzleSolver from './components/puzzles/PuzzleSolver';

// Create Auth Context
export const AuthContext = createContext();

function App() {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to handle login
  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    
    if (userData && userData.is_admin) {
      setIsAdmin(true);
    }
  };

  // Function to handle logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token or decode JWT
      try {
        // For simplicity, we're just checking if token exists
        // In a real app, you'd validate the token with your backend
        setIsAuthenticated(true);
        
        // Check if user is admin (from localStorage or token payload)
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData && userData.is_admin) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Auth protection for routes
  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  const AdminRoute = ({ children }) => {
    return isAuthenticated && isAdmin ? children : <Navigate to="/" />;
  };

  if (loading) {
    return <div className="loading">{t('loading')}</div>;
  }
  
  // Auth context value
  const authContextValue = {
    isAuthenticated,
    isAdmin,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <LanguageProvider>
        <Router>
          <div className="app">
            <Navbar isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
            <main className="container">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login setAuth={setIsAuthenticated} setAdmin={setIsAdmin} />} />
                <Route path="/register" element={<Register setAuth={setIsAuthenticated} />} />
                
                {/* Protected routes */}
                <Route path="/profile" element={
                  <PrivateRoute>
                    <Profile setAuth={setIsAuthenticated} />
                  </PrivateRoute>
                } />
                <Route path="/lessons" element={
                  <PrivateRoute>
                    <Lessons />
                  </PrivateRoute>
                } />
                <Route path="/play" element={
                  <PrivateRoute>
                    <GameZone />
                  </PrivateRoute>
                } />
                <Route path="/history" element={
                  <PrivateRoute>
                    <GameHistory />
                  </PrivateRoute>
                } />
                <Route path="/puzzles" element={
                  <PrivateRoute>
                    <Puzzles />
                  </PrivateRoute>
                } />
                <Route path="/puzzles/:id" element={
                  <PrivateRoute>
                    <PuzzleSolver />
                  </PrivateRoute>
                } />
                
                {/* Admin route */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                } />
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </LanguageProvider>
    </AuthContext.Provider>
  );
}

export default App;
