import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaEye, FaEyeSlash, FaSignInAlt } from 'react-icons/fa';
import { login as apiLogin } from '../../services/api';
import { AuthContext } from '../../App';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.email || !formData.password) {
      setError(t('allFieldsRequired'));
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await apiLogin(formData);
      
      // Use the login function from AuthContext
      login(response.user, response.token);
      
      // Redirect to homepage
      navigate('/');
    } catch (err) {
      setError(err.message || t('loginError'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-container page-container">
      <div className="form-container animate-fadeIn">
        <h1 className="form-title">{t('login')}</h1>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">{t('email')}</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('enterYourEmail')}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">{t('password')}</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? (
              t('loading')
            ) : (
              <>
                <FaSignInAlt style={{ marginRight: '0.5rem' }} />
                {t('login')}
              </>
            )}
          </button>
        </form>
        
        <div className="form-footer">
          <p>
            {t('dontHaveAccount')} <a href="/register">{t('registerNow')}</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 