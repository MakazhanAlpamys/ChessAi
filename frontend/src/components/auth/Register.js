import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaEye, FaEyeSlash, FaCheck, FaTimes, FaExclamationCircle, FaUserPlus } from 'react-icons/fa';
import { register as apiRegister } from '../../services/api';
import { AuthContext } from '../../App';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [registerError, setRegisterError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Password strength indicators
  const hasMinLength = formData.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasNumber = /\d/.test(formData.password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.password !== '';
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear errors when field is modified
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
    
    // Clear register error when any field changes
    if (registerError) {
      setRegisterError('');
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = t('error') + ': ' + t('username');
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('error') + ': ' + t('email');
    } else {
      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = t('error') + ': ' + t('email');
      }
    }
    
    if (!hasMinLength || !hasUppercase || !hasNumber || !hasSpecialChar) {
      newErrors.password = t('error') + ': ' + t('password');
    }
    
    if (!passwordsMatch) {
      newErrors.confirmPassword = t('error') + ': ' + t('confirmPassword');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      try {
        const response = await apiRegister(formData);
        
        // Use the login function from context
        login(response.user, response.token);
        
        // Redirect to homepage
        navigate('/');
      } catch (error) {
        setRegisterError(error.message || t('registerError'));
      } finally {
        setLoading(false);
      }
    }
  };
  
  return (
    <div className="register-container page-container chess-board-bg animate-fadeIn">
      <div className="form-container card">
        <h2 className="form-title">
          <span className="chess-piece chess-king"></span>
          {t('register')}
        </h2>
        
        {registerError && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            <div className="alert-icon">
              <FaExclamationCircle />
            </div>
            <div className="alert-content">{registerError}</div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">{t('username')}</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input"
              value={formData.username}
              onChange={handleChange}
              required
            />
            {errors.username && <div className="error-text">{errors.username}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">{t('email')}</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">{t('password')}</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button 
                type="button" 
                className="toggle-password"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <FaEyeSlash title={t('hide')} />
                ) : (
                  <FaEye title={t('show')} />
                )}
              </button>
            </div>
            {errors.password && <div className="error-text">{errors.password}</div>}
            
            <div className="password-strength-meter">
              <div className="password-requirements-title">{t('passwordRequirements')}</div>
              <div className={`strength-item ${hasMinLength ? 'valid animate-fadeIn' : 'invalid'}`}>
                {hasMinLength ? <FaCheck /> : <FaTimes />}
                <span style={{ marginLeft: '5px' }}>{t('atLeast8Chars')}</span>
              </div>
              <div className={`strength-item ${hasUppercase ? 'valid animate-fadeIn' : 'invalid'}`}>
                {hasUppercase ? <FaCheck /> : <FaTimes />}
                <span style={{ marginLeft: '5px' }}>{t('atLeast1UpperCase')}</span>
              </div>
              <div className={`strength-item ${hasNumber ? 'valid animate-fadeIn' : 'invalid'}`}>
                {hasNumber ? <FaCheck /> : <FaTimes />}
                <span style={{ marginLeft: '5px' }}>{t('atLeast1Number')}</span>
              </div>
              <div className={`strength-item ${hasSpecialChar ? 'valid animate-fadeIn' : 'invalid'}`}>
                {hasSpecialChar ? <FaCheck /> : <FaTimes />}
                <span style={{ marginLeft: '5px' }}>{t('atLeast1Special')}</span>
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">{t('confirmPassword')}</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                className="form-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button 
                type="button" 
                className="toggle-password"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? (
                  <FaEyeSlash title={t('hide')} />
                ) : (
                  <FaEye title={t('show')} />
                )}
              </button>
            </div>
            {errors.confirmPassword && <div className="error-text">{errors.confirmPassword}</div>}
            {formData.confirmPassword && (
              <div className={`strength-item ${passwordsMatch ? 'valid animate-fadeIn' : 'invalid'}`}>
                {passwordsMatch ? <FaCheck /> : <FaTimes />}
                <span style={{ marginLeft: '5px' }}>{t('passwordsMatch')}</span>
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block" 
            disabled={loading}
          >
            {loading ? (
              <div className="chess-loader"></div>
            ) : (
              <>
                <FaUserPlus style={{ marginRight: '0.5rem' }} />
                {t('register')}
              </>
            )}
          </button>
        </form>
        
        <div className="form-footer">
          <p>{t('alreadyHaveAccount')} <Link to="/login" className="hover-effect">{t('loginNow')}</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register; 