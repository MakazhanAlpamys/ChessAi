import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaTrash, FaKey, FaUserEdit, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { getProfile, updateUsername, updatePassword, deleteAccount } from '../../services/api';

const Profile = ({ setAuth }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState({
    username: '',
    email: ''
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Username update state
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  
  // Password update state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Active tab
  const [activeTab, setActiveTab] = useState('info');
  
  // Load profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfileData(data);
        setNewUsername(data.username);
      } catch (err) {
        setError(err.message || t('error'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [t]);
  
  // Password validation
  const hasMinLength = passwordData.newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordData.newPassword);
  const hasNumber = /\d/.test(passwordData.newPassword);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(passwordData.newPassword);
  const passwordsMatch = passwordData.newPassword === passwordData.confirmNewPassword;
  
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber && hasSpecialChar && passwordsMatch;
  
  // Handle username form
  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    
    if (newUsername.trim() === '') {
      setUsernameError(t('usernameRequired'));
      return;
    }
    
    if (newUsername === profileData.username) {
      setUsernameError('');
      return;
    }
    
    setIsUpdatingUsername(true);
    try {
      await updateUsername(newUsername);
      setProfileData({
        ...profileData,
        username: newUsername
      });
      setSuccessMessage(t('usernameUpdated'));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setUsernameError(err.message || t('usernameUpdateError'));
    } finally {
      setIsUpdatingUsername(false);
    }
  };
  
  // Handle password form
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
    
    // Clear password error when form changes
    if (passwordError) {
      setPasswordError('');
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword) {
      setPasswordError(t('currentPasswordRequired'));
      return;
    }
    
    if (!isPasswordValid) {
      setPasswordError(t('passwordNotValid'));
      return;
    }
    
    setIsUpdatingPassword(true);
    try {
      await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
      
      setSuccessMessage(t('passwordUpdated'));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setPasswordError(err.message || t('passwordUpdateError'));
    } finally {
      setIsUpdatingPassword(false);
    }
  };
  
  // Handle account deletion
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      setAuth(false);
      navigate('/');
    } catch (err) {
      setError(err.message || t('accountDeleteError'));
      setIsDeleting(false);
    }
  };
  
  if (isLoading) {
    return <div className="loading-container">{t('loading')}</div>;
  }
  
  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1 className="page-title text-center">{t('profileSettings')}</h1>
        
        {error && (
          <div className="alert alert-error">
            <FaExclamationCircle className="alert-icon" />
            <div className="alert-content">{error}</div>
          </div>
        )}
        
        {successMessage && (
          <div className="alert alert-success">
            <FaCheckCircle className="alert-icon" />
            <div className="alert-content">{successMessage}</div>
          </div>
        )}
        
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} 
            onClick={() => setActiveTab('info')}
          >
            <FaUser className="tab-icon" />
            <span>{t('profileInfo')}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'username' ? 'active' : ''}`} 
            onClick={() => setActiveTab('username')}
          >
            <FaUserEdit className="tab-icon" />
            <span>{t('changeUsername')}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`} 
            onClick={() => setActiveTab('password')}
          >
            <FaKey className="tab-icon" />
            <span>{t('changePassword')}</span>
          </button>
          <button 
            className={`tab-btn danger ${activeTab === 'delete' ? 'active' : ''}`} 
            onClick={() => setActiveTab('delete')}
          >
            <FaTrash className="tab-icon" />
            <span>{t('deleteAccount')}</span>
          </button>
        </div>
        
        <div className="profile-content">
          {/* Profile Info */}
          {activeTab === 'info' && (
            <div className="profile-card">
              <div className="profile-card-header">
                <h2><FaUser className="section-icon" /> {t('profileInfo')}</h2>
              </div>
              
              <div className="profile-info">
                <div className="info-item">
                  <div className="info-icon">
                    <FaUser />
                  </div>
                  <div className="info-details">
                    <div className="info-label">{t('username')}</div>
                    <div className="info-value">{profileData.username}</div>
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="info-icon">
                    <FaEnvelope />
                  </div>
                  <div className="info-details">
                    <div className="info-label">{t('email')}</div>
                    <div className="info-value">{profileData.email}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Change Username */}
          {activeTab === 'username' && (
            <div className="profile-card">
              <div className="profile-card-header">
                <h2><FaUserEdit className="section-icon" /> {t('changeUsername')}</h2>
              </div>
              
              <form onSubmit={handleUsernameSubmit} className="profile-form">
                <div className={`form-group ${usernameError ? 'has-error' : ''}`}>
                  <label htmlFor="newUsername" className="form-label">{t('newUsername')}</label>
                  <input
                    type="text"
                    id="newUsername"
                    className="form-input"
                    value={newUsername}
                    onChange={(e) => {
                      setNewUsername(e.target.value);
                      if (usernameError) setUsernameError('');
                    }}
                  />
                  {usernameError && <div className="error-text">{usernameError}</div>}
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isUpdatingUsername || newUsername === profileData.username}
                >
                  {isUpdatingUsername ? (
                    <span className="loading-spinner"></span>
                  ) : (
                    t('saveChanges')
                  )}
                </button>
              </form>
            </div>
          )}
          
          {/* Change Password */}
          {activeTab === 'password' && (
            <div className="profile-card">
              <div className="profile-card-header">
                <h2><FaKey className="section-icon" /> {t('changePassword')}</h2>
              </div>
              
              <form onSubmit={handlePasswordSubmit} className="profile-form">
                <div className="form-group">
                  <label htmlFor="currentPassword" className="form-label">{t('currentPassword')}</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      id="currentPassword"
                      name="currentPassword"
                      className="form-input"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                    />
                    <button 
                      type="button" 
                      className="toggle-password"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="newPassword" className="form-label">{t('newPassword')}</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      id="newPassword"
                      name="newPassword"
                      className="form-input"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                    />
                    <button 
                      type="button" 
                      className="toggle-password"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  
                  {/* Password strength indicators */}
                  {passwordData.newPassword && (
                    <div className="password-strength-meter">
                      <div className={`strength-item ${hasMinLength ? 'valid' : 'invalid'}`}>
                        <span className="strength-icon">{hasMinLength ? '✓' : '✗'}</span>
                        <span className="strength-text">{t('min8Chars')}</span>
                      </div>
                      <div className={`strength-item ${hasUppercase ? 'valid' : 'invalid'}`}>
                        <span className="strength-icon">{hasUppercase ? '✓' : '✗'}</span>
                        <span className="strength-text">{t('upperCase')}</span>
                      </div>
                      <div className={`strength-item ${hasNumber ? 'valid' : 'invalid'}`}>
                        <span className="strength-icon">{hasNumber ? '✓' : '✗'}</span>
                        <span className="strength-text">{t('number')}</span>
                      </div>
                      <div className={`strength-item ${hasSpecialChar ? 'valid' : 'invalid'}`}>
                        <span className="strength-icon">{hasSpecialChar ? '✓' : '✗'}</span>
                        <span className="strength-text">{t('specialChar')}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmNewPassword" className="form-label">{t('confirmPassword')}</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmNewPassword"
                      name="confirmNewPassword"
                      className="form-input"
                      value={passwordData.confirmNewPassword}
                      onChange={handlePasswordChange}
                    />
                    <button 
                      type="button" 
                      className="toggle-password"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  
                  {/* Passwords match indicator */}
                  {passwordData.newPassword && passwordData.confirmNewPassword && (
                    <div className={`match-indicator ${passwordsMatch ? 'valid' : 'invalid'}`}>
                      <span className="match-icon">{passwordsMatch ? '✓' : '✗'}</span>
                      <span className="match-text">
                        {passwordsMatch ? t('passwordsMatch') : t('passwordsDontMatch')}
                      </span>
                    </div>
                  )}
                </div>
                
                {passwordError && <div className="error-text">{passwordError}</div>}
                
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={
                    isUpdatingPassword || 
                    !passwordData.currentPassword || 
                    !isPasswordValid
                  }
                >
                  {isUpdatingPassword ? (
                    <span className="loading-spinner"></span>
                  ) : (
                    t('updatePassword')
                  )}
                </button>
              </form>
            </div>
          )}
          
          {/* Delete Account */}
          {activeTab === 'delete' && (
            <div className="profile-card danger">
              <div className="profile-card-header danger">
                <h2><FaTrash className="section-icon" /> {t('deleteAccount')}</h2>
              </div>
              
              <div className="profile-card-content">
                <p className="warning-text">{t('deleteAccountWarning')}</p>
                
                {!showDeleteConfirm ? (
                  <button 
                    className="btn btn-danger" 
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <FaTrash className="btn-icon" />
                    {t('deleteAccount')}
                  </button>
                ) : (
                  <div className="confirmation-box">
                    <p className="confirmation-text">{t('deleteConfirmation')}</p>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-danger" 
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <span className="loading-spinner white"></span>
                        ) : (
                          t('confirmDelete')
                        )}
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        {t('cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 