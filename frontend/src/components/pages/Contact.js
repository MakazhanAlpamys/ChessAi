import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sendContactMessage } from '../../services/api';
import { FaUser, FaEnvelope, FaComment, FaPaperPlane, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const Contact = () => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState({
    submitted: false,
    success: false,
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear error when field is modified
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('nameRequired');
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('emailRequired');
    } else {
      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = t('invalidEmail');
      }
    }
    
    if (!formData.message.trim()) {
      newErrors.message = t('messageRequired');
    } else if (formData.message.trim().length < 10) {
      newErrors.message = t('messageTooShort');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setIsSubmitting(true);
        await sendContactMessage(formData);
        
        setSubmitStatus({
          submitted: true,
          success: true,
          message: t('messageSent')
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          message: ''
        });
        
      } catch (error) {
        setSubmitStatus({
          submitted: true,
          success: false,
          message: error.message || t('messageSendError')
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  return (
    <div className="contact-page page-container animate-fadeIn">
      <div className="contact-container">
        <div className="contact-header">
          <h1 className="page-title">
            <span className="chess-piece chess-knight"></span>
            {t('contactTitle')}
          </h1>
          <p className="contact-subtitle">{t('contactMessage')}</p>
        </div>
        
        <div className="contact-content">
          <div className="contact-info">
            <div className="contact-info-card card animate-slideIn">
              <h3 className="card-title">
                <span className="chess-piece chess-rook"></span>
                {t('contactInfo')}
              </h3>
              <p>{t('contactUsDescription')}</p>
              
              <div className="contact-details">
                <div className="contact-detail-item hover-effect">
                  <div className="contact-icon">
                    <FaEnvelope />
                  </div>
                  <div className="contact-text">
                    <h4>{t('email')}</h4>
                    <p>support@chessteacher.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="contact-form-container card animate-slideIn">
            {submitStatus.submitted && (
              <div className={`submit-message alert ${submitStatus.success ? 'alert-success' : 'alert-error'}`}>
                <div className="alert-icon">
                  {submitStatus.success ? <FaCheckCircle /> : <FaExclamationCircle />}
                </div>
                <div className="submit-text">
                  <h4>{submitStatus.success ? t('success') : t('error')}</h4>
                  <p>{submitStatus.message}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="contact-form">
              <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
                <label htmlFor="name" className="form-label">{t('yourName')}</label>
                <div className="input-with-icon">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-input"
                    placeholder={t('enterYourName')}
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                {errors.name && <div className="error-text">{errors.name}</div>}
              </div>
              
              <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
                <label htmlFor="email" className="form-label">{t('yourEmail')}</label>
                <div className="input-with-icon">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    placeholder={t('enterYourEmail')}
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && <div className="error-text">{errors.email}</div>}
              </div>
              
              <div className={`form-group ${errors.message ? 'has-error' : ''}`}>
                <label htmlFor="message" className="form-label">{t('message')}</label>
                <div className="input-with-icon textarea-container">
                  <FaComment className="input-icon textarea-icon" />
                  <textarea
                    id="message"
                    name="message"
                    className="form-input form-textarea"
                    rows="5"
                    placeholder={t('enterYourMessage')}
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                </div>
                {errors.message && <div className="error-text">{errors.message}</div>}
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="loading-text">
                    <div className="chess-loader"></div>
                    {t('sending')}...
                  </span>
                ) : (
                  <>
                    <FaPaperPlane className="btn-icon" />
                    <span>{t('send')}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 