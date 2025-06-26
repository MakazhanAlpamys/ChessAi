import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaChess, FaBars, FaTimes, FaGlobe, FaChessKnight, FaSignOutAlt } from 'react-icons/fa';
import { LanguageContext } from '../../context/LanguageContext';
import { AuthContext } from '../../App';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { language, changeLanguage } = useContext(LanguageContext);
  const { isAuthenticated, isAdmin, logout } = useContext(AuthContext);
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const handleLanguageChange = (lng) => {
    changeLanguage(lng);
    setLangMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleLangMenu = () => {
    setLangMenuOpen(!langMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo hover-effect">
          <FaChess className="logo-icon" /> Chess.Ai
        </Link>

        <ul className={`nav-links ${mobileMenuOpen ? 'show-mobile' : 'hidden-mobile'}`}>
          <li>
            <Link 
              to="/" 
              className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
            >
              {t('home')}
            </Link>
          </li>

          {isAuthenticated && (
            <>
              <li>
                <Link 
                  to="/lessons" 
                  className={`nav-item ${location.pathname === '/lessons' ? 'active' : ''}`}
                >
                  {t('lessons')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/play" 
                  className={`nav-item ${location.pathname === '/play' ? 'active' : ''}`}
                >
                  {t('play')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/puzzles" 
                  className={`nav-item ${location.pathname.startsWith('/puzzles') ? 'active' : ''}`}
                >
                  <FaChessKnight className="nav-icon" /> {t('puzzles')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/history" 
                  className={`nav-item ${location.pathname === '/history' ? 'active' : ''}`}
                >
                  {t('history')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/profile" 
                  className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
                >
                  {t('profile')}
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link 
                    to="/admin" 
                    className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}
                  >
                    {t('admin')}
                  </Link>
                </li>
              )}
            </>
          )}

          <li>
            <Link 
              to="/contact" 
              className={`nav-item ${location.pathname === '/contact' ? 'active' : ''}`}
            >
              {t('contact')}
            </Link>
          </li>
        </ul>

        <div className="nav-right">
          <div className="language-dropdown">
            <button 
              className="lang-toggle"
              onClick={toggleLangMenu}
              title={t('changeLanguage')}
            >
              <FaGlobe className="lang-icon" /> 
              <span className="lang-code">{language.toUpperCase()}</span>
            </button>
            
            {langMenuOpen && (
              <div className="lang-dropdown-content">
                <button 
                  className={`lang-option ${language === 'en' ? 'active' : ''}`} 
                  onClick={() => handleLanguageChange('en')}
                >
                  English
                </button>
                <button 
                  className={`lang-option ${language === 'ru' ? 'active' : ''}`} 
                  onClick={() => handleLanguageChange('ru')}
                >
                  Русский
                </button>
                <button 
                  className={`lang-option ${language === 'kk' ? 'active' : ''}`} 
                  onClick={() => handleLanguageChange('kk')}
                >
                  Қазақша
                </button>
              </div>
            )}
          </div>

          {isAuthenticated && (
            <button 
              className="logout-btn" 
              onClick={handleLogout}
              title={t('logout')}
            >
              <FaSignOutAlt />
              <span className="logout-text">{t('logout')}</span>
            </button>
          )}

          {!isAuthenticated && (
            <div className="auth-nav">
              <Link to="/login" className="login-btn">
                {t('login')}
              </Link>
              <Link to="/register" className="register-btn">
                {t('register')}
              </Link>
            </div>
          )}

          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 