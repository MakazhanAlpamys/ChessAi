import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FaChess, FaChessKnight, FaChessQueen, FaChessKing, FaChessRook, FaChessBishop, FaChessPawn } from 'react-icons/fa';
import { AuthContext } from '../../App';

const Home = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className="home-container page-container animate-fadeIn">
      <div className="hero-section text-center chess-board-bg">
        <FaChess size={60} className="logo-icon animate-pulse" style={{ color: 'var(--chess-primary)', marginBottom: '20px' }} />
        <h1 className="animate-fadeIn">{t('welcome')}</h1>
        <p className="hero-description animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          {t('projectDescription')}
        </p>
        
        {!isAuthenticated && (
          <div className="auth-buttons mt-20 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <Link to="/register" className="btn btn-primary" style={{ marginRight: '10px' }}>
              {t('register')}
            </Link>
            <Link to="/login" className="btn btn-secondary">
              {t('login')}
            </Link>
          </div>
        )}
        
        {isAuthenticated && (
          <div className="auth-buttons mt-20 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <Link to="/play" className="btn btn-primary" style={{ marginRight: '10px' }}>
              {t('play')}
            </Link>
            <Link to="/puzzles" className="btn btn-secondary">
              {t('puzzles')}
            </Link>
          </div>
        )}
      </div>
      
      <div className="features-section mt-20">
        <h2 className="text-center mb-20 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
          <span className="chess-piece chess-king"></span>
          {t('featuresTitle')}
        </h2>
        
        <div className="features-grid">
          <div className="feature-card card animate-fadeIn" style={{ animationDelay: '0.7s' }}>
            <FaChessKnight size={40} className="feature-icon" style={{ color: 'var(--chess-primary)' }} />
            <h3 className="feature-title">{t('feature1')}</h3>
            {isAuthenticated ? (
              <Link to="/lessons" className="feature-link btn btn-accent hover-effect">
                {t('lessons')} &rarr;
              </Link>
            ) : (
              <Link to="/login" className="feature-link btn btn-secondary hover-effect">
                {t('login')}
              </Link>
            )}
          </div>
          
          <div className="feature-card card animate-fadeIn" style={{ animationDelay: '0.8s' }}>
            <FaChessQueen size={40} className="feature-icon" style={{ color: 'var(--chess-accent)' }} />
            <h3 className="feature-title">{t('feature2')}</h3>
            {isAuthenticated ? (
              <Link to="/play" className="feature-link btn btn-accent hover-effect">
                {t('play')} &rarr;
              </Link>
            ) : (
              <Link to="/login" className="feature-link btn btn-secondary hover-effect">
                {t('login')}
              </Link>
            )}
          </div>
          
          <div className="feature-card card animate-fadeIn" style={{ animationDelay: '0.9s' }}>
            <FaChessKing size={40} className="feature-icon" style={{ color: 'var(--chess-primary)' }} />
            <h3 className="feature-title">{t('feature3')}</h3>
            {isAuthenticated ? (
              <Link to="/profile" className="feature-link btn btn-accent hover-effect">
                {t('profile')} &rarr;
              </Link>
            ) : (
              <Link to="/login" className="feature-link btn btn-secondary hover-effect">
                {t('login')}
              </Link>
            )}
          </div>
          
          <div className="feature-card card animate-fadeIn" style={{ animationDelay: '1s' }}>
            <FaChessRook size={40} className="feature-icon" style={{ color: 'var(--chess-accent)' }} />
            <h3 className="feature-title">{t('feature4')}</h3>
            {isAuthenticated ? (
              <Link to="/history" className="feature-link btn btn-accent hover-effect">
                {t('history')} &rarr;
              </Link>
            ) : (
              <Link to="/login" className="feature-link btn btn-secondary hover-effect">
                {t('login')}
              </Link>
            )}
          </div>
        </div>
      </div>
      
      <div className="chess-pattern-divider animate-slideIn" style={{ animationDelay: '1.1s' }}></div>
      
      <div className="cta-section text-center animate-fadeIn" style={{ animationDelay: '1.2s' }}>
        {!isAuthenticated ? (
          <>
            <h2>{t('welcome')}</h2>
            <p>{t('projectDescription')}</p>
            <Link to="/register" className="btn btn-primary animate-pulse">
              {t('register')}
            </Link>
          </>
        ) : (
          <>
            <h2>{t('playAgainstAI')}</h2>
            <p>{t('puzzlesDescription')}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <Link to="/play" className="btn btn-primary">
                {t('play')}
              </Link>
              <Link to="/puzzles" className="btn btn-secondary">
                {t('puzzles')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home; 