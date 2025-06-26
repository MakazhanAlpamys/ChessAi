import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaChessBoard } from 'react-icons/fa';

const NotFound = () => {
  const { t } = useTranslation();
  
  return (
    <div className="not-found-container" style={{ 
      textAlign: 'center', 
      padding: '50px 20px' 
    }}>
      <FaChessBoard size={100} style={{ color: '#6d9e46', marginBottom: '20px' }} />
      
      <h1 style={{ marginBottom: '20px', fontSize: '3rem' }}>404</h1>
      <h2 style={{ marginBottom: '30px' }}>{t('notFound')}</h2>
      
      <Link to="/" className="btn">
        {t('back')}
      </Link>
    </div>
  );
};

export default NotFound; 