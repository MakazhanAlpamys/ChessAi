import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { FaUser, FaUserShield, FaTrash, FaPlus, FaStar, FaClipboard, FaVideo, FaTimes, FaPen, FaCheck } from 'react-icons/fa';
import { getUsers, updateUserAdmin, deleteUser, getAdminStats, addLesson, getLessons, deleteLesson } from '../../services/api';
import { LanguageContext } from '../../context/LanguageContext';

const AdminPanel = () => {
  const { t, i18n } = useTranslation();
  const { language } = useContext(LanguageContext);
  
  // Active tab
  const [activeTab, setActiveTab] = useState('users');
  
  // Users state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');
  
  // Stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    topPlayers: []
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');
  
  // Lesson form state
  const [lessonForm, setLessonForm] = useState({
    title: '',
    video_url: ''
  });
  const [lessonError, setLessonError] = useState('');
  const [lessonSuccess, setLessonSuccess] = useState('');
  const [lessonLoading, setLessonLoading] = useState(false);
  
  // Lessons list state
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [lessonsError, setLessonsError] = useState('');
  const [deletingLesson, setDeletingLesson] = useState(null);
  
  // Fetch users data
  useEffect(() => {
    if (activeTab === 'users') {
      const fetchUsers = async () => {
        try {
          setUsersLoading(true);
          const data = await getUsers();
          setUsers(data);
          setUsersError('');
        } catch (err) {
          setUsersError(err.message || t('error'));
        } finally {
          setUsersLoading(false);
        }
      };
      
      fetchUsers();
    }
  }, [activeTab, t, language]);
  
  // Fetch stats data
  useEffect(() => {
    if (activeTab === 'stats') {
      const fetchStats = async () => {
        try {
          setStatsLoading(true);
          const data = await getAdminStats();
          setStats(data);
          setStatsError('');
        } catch (err) {
          setStatsError(err.message || t('error'));
        } finally {
          setStatsLoading(false);
        }
      };
      
      fetchStats();
    }
  }, [activeTab, t, language]);
  
  // Fetch lessons data
  useEffect(() => {
    if (activeTab === 'lessons' || activeTab === 'add-lesson') {
      const fetchLessons = async () => {
        try {
          setLessonsLoading(true);
          const data = await getLessons();
          setLessons(data);
          setLessonsError('');
        } catch (err) {
          setLessonsError(err.message || t('errorFetchingLessons'));
        } finally {
          setLessonsLoading(false);
        }
      };
      
      fetchLessons();
    }
  }, [activeTab, t, language]);
  
  // Handle user role toggle
  const handleToggleAdmin = async (userId, currentIsAdmin) => {
    try {
      await updateUserAdmin(userId, !currentIsAdmin);
      
      // Update users state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, is_admin: !currentIsAdmin } 
            : user
        )
      );
    } catch (err) {
      alert(err.message || t('error'));
    }
  };
  
  // Handle user deletion
  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(t('confirmDeleteUser') + ` ${username}?`)) {
      try {
        await deleteUser(userId);
        
        // Update users state
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalUsers: prev.totalUsers - 1
        }));
      } catch (err) {
        alert(err.message || t('error'));
      }
    }
  };
  
  // Handle lesson form change
  const handleLessonFormChange = (e) => {
    const { name, value } = e.target;
    setLessonForm({ ...lessonForm, [name]: value });
    
    // Clear messages when form changes
    setLessonError('');
    setLessonSuccess('');
  };
  
  // Handle lesson form submission
  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    
    // Validate fields
    if (!lessonForm.title.trim() || !lessonForm.video_url.trim()) {
      setLessonError(t('allFieldsRequired'));
      return;
    }
    
    // Validate YouTube URL
    const youtubeRegex = /^(https:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+$|^(https:\/\/)?youtu\.be\/[\w-]+$/;
    if (!youtubeRegex.test(lessonForm.video_url)) {
      setLessonError(t('invalidYoutubeUrl'));
      return;
    }
    
    try {
      setLessonLoading(true);
      await addLesson(lessonForm);
      
      // Reset form
      setLessonForm({
        title: '',
        video_url: ''
      });
      
      setLessonSuccess(t('lessonAdded'));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setLessonSuccess('');
      }, 3000);
      
      // Refetch lessons
      const updatedLessons = await getLessons();
      setLessons(updatedLessons);
      
    } catch (err) {
      setLessonError(err.message || t('error'));
    } finally {
      setLessonLoading(false);
    }
  };
  
  // Handle lesson deletion
  const handleDeleteLesson = async (lessonId) => {
    if (window.confirm(t('confirmDeleteLesson'))) {
    setDeletingLesson(lessonId);
    
    try {
      await deleteLesson(lessonId);
      
      // Update lessons state
      setLessons(prevLessons => prevLessons.filter(lesson => lesson.id !== lessonId));
      
      // Show success message
      setLessonSuccess(t('lessonDeleted'));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setLessonSuccess('');
      }, 3000);
        
        // Clear any previous errors
        setLessonsError('');
    } catch (err) {
        console.error("Error deleting lesson:", err);
        setLessonsError(t('errorDeletingLesson'));
        
        // Clear error message after 5 seconds
        setTimeout(() => {
          setLessonsError('');
        }, 5000);
    } finally {
      setDeletingLesson(null);
      }
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format YouTube URL for display
  const formatYoutubeUrlForDisplay = (url) => {
    if (url.includes('youtube.com/watch')) {
      return url.replace(/^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=/, 'youtube.com/…/');
    } else if (url.includes('youtu.be')) {
      return url.replace(/^(https?:\/\/)?(www\.)?youtu\.be\//, 'youtu.be/…/');
    }
    return url;
  };
  
  return (
    <div className="admin-container">
      <h1 className="page-title text-center mb-20">{t('adminPanel')}</h1>
      
      {/* Admin Tabs */}
      <div className="admin-tabs" key={`admin-tabs-${language}`}>
        <button 
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <FaUser /> <span>{t('users')}</span>
        </button>
        <button 
          className={`admin-tab ${activeTab === 'lessons' ? 'active' : ''}`}
          onClick={() => setActiveTab('lessons')}
        >
          <FaVideo /> <span>{t('lessons')}</span>
        </button>
        <button 
          className={`admin-tab ${activeTab === 'add-lesson' ? 'active' : ''}`}
          onClick={() => setActiveTab('add-lesson')}
        >
          <FaPlus /> <span>{t('addLesson')}</span>
        </button>
        <button 
          className={`admin-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <FaClipboard /> <span>{t('statistics')}</span>
        </button>
      </div>
      
      {/* Users Management Section */}
      {activeTab === 'users' && (
        <div className="admin-section" key={`users-section-${language}`}>
          <div className="section-header">
            <h2 className="section-title">
              <FaUserShield className="section-icon" />
              {t('usersManagement')}
            </h2>
          </div>
          
          {usersError && (
            <div className="alert alert-error">
              <FaTimes className="alert-icon" />
              <div className="alert-content">{usersError}</div>
            </div>
          )}
          
          {usersLoading ? (
            <div className="loading-container">{t('loading')}</div>
          ) : (
            <div className="table-container">
              <table className="data-table" key={`users-table-${language}`}>
                <thead>
                  <tr>
                    <th>{t('username')}</th>
                    <th>{t('email')}</th>
                    <th>{t('registered')}</th>
                    <th>{t('isAdmin')}</th>
                    <th>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{formatDate(user.created_at)}</td>
                      <td>
                        <span className={`status-badge ${user.is_admin ? 'active' : 'inactive'}`}>
                          {user.is_admin ? t('yes') : t('no')}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-icon" 
                            onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                            title={user.is_admin ? t('removeAdmin') : t('makeAdmin')}
                          >
                            <FaUserShield className={user.is_admin ? 'icon-danger' : 'icon-success'} />
                          </button>
                          <button 
                            className="btn-icon" 
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            title={t('delete')}
                          >
                            <FaTrash className="icon-danger" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Lessons Management Section */}
      {activeTab === 'lessons' && (
        <div className="admin-section" key={`lessons-section-${language}`}>
          <div className="section-header">
            <h2 className="section-title">
              <FaVideo className="section-icon" />
              {t('lessonsManagement')}
            </h2>
          </div>
          
          {lessonsError && (
            <div className="alert alert-error">
              <FaTimes className="alert-icon" />
              <div className="alert-content">{lessonsError}</div>
            </div>
          )}
          
          {lessonSuccess && (
            <div className="alert alert-success">
              <FaCheck className="alert-icon" />
              <div className="alert-content">{lessonSuccess}</div>
            </div>
          )}
          
          {lessonsLoading ? (
            <div className="loading-container">{t('loading')}</div>
          ) : (
            <div className="table-container">
              {lessons.length === 0 ? (
                <div className="empty-state">
                  <FaVideo className="empty-icon" />
                  <p>{t('noLessonsFound')}</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveTab('add-lesson')}
                  >
                    <FaPlus /> {t('addLesson')}
                  </button>
                </div>
              ) : (
                <table className="data-table" key={`lessons-table-${language}`}>
                  <thead>
                    <tr>
                      <th>{t('title')}</th>
                      <th>{t('videoUrl')}</th>
                      <th>{t('dateAdded')}</th>
                      <th>{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lessons.map(lesson => (
                      <tr key={lesson.id}>
                        <td>{lesson.title}</td>
                        <td>
                          <a 
                            href={lesson.video_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="video-link"
                          >
                            {formatYoutubeUrlForDisplay(lesson.video_url)}
                          </a>
                        </td>
                        <td>{formatDate(lesson.created_at)}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-icon" 
                              onClick={() => handleDeleteLesson(lesson.id)}
                              disabled={deletingLesson === lesson.id}
                              title={t('delete')}
                            >
                              {deletingLesson === lesson.id ? (
                                <span className="loading-spinner small"></span>
                              ) : (
                                <FaTrash className="icon-danger" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Add Lesson Section */}
      {activeTab === 'add-lesson' && (
        <div className="admin-section" key={`add-lesson-section-${language}`}>
          <div className="section-header">
            <h2 className="section-title">
              <FaPlus className="section-icon" />
              {t('addLesson')}
            </h2>
          </div>
          
          {lessonError && (
            <div className="alert alert-error">
              <FaTimes className="alert-icon" />
              <div className="alert-content">{lessonError}</div>
            </div>
          )}
          
          {lessonSuccess && (
            <div className="alert alert-success">
              <FaCheck className="alert-icon" />
              <div className="alert-content">{lessonSuccess}</div>
            </div>
          )}
          
          <div className="form-container">
            <form onSubmit={handleLessonSubmit} className="admin-form">
              <div className="form-group">
                <label htmlFor="title" className="form-label">{t('lessonTitle')}</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-input"
                  value={lessonForm.title}
                  onChange={handleLessonFormChange}
                  placeholder={t('enterLessonTitle')}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="video_url" className="form-label">{t('youtubeUrl')}</label>
                <input
                  type="text"
                  id="video_url"
                  name="video_url"
                  className="form-input"
                  value={lessonForm.video_url}
                  onChange={handleLessonFormChange}
                  placeholder="https://www.youtube.com/watch?v=ID or https://youtu.be/ID"
                />
                <small className="form-help-text">
                  {t('supportedFormats')}: https://www.youtube.com/watch?v=ID or https://youtu.be/ID
                </small>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={lessonLoading}
              >
                {lessonLoading ? (
                  <span className="loading-spinner white"></span>
                ) : (
                  <>
                    <FaPlus className="btn-icon" /> {t('addLesson')}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Stats Section */}
      {activeTab === 'stats' && (
        <div className="admin-section" key={`stats-section-${language}`}>
          <div className="section-header">
            <h2 className="section-title">
              <FaClipboard className="section-icon" />
              {t('statistics')}
            </h2>
          </div>
          
          {statsError && (
            <div className="alert alert-error">
              <FaTimes className="alert-icon" />
              <div className="alert-content">{statsError}</div>
            </div>
          )}
          
          {statsLoading ? (
            <div className="loading-container">{t('loading')}</div>
          ) : (
            <div className="stats-container">
              <div className="stat-card">
                <div className="stat-icon-wrapper">
                  <FaUser className="stat-icon" />
                </div>
                <div className="stat-content">
                  <h3 className="stat-title">{t('totalUsers')}</h3>
                  <div className="stat-value">{stats.totalUsers}</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon-wrapper">
                  <FaStar className="stat-icon" />
                </div>
                <div className="stat-content">
                  <h3 className="stat-title">{t('topPlayers')}</h3>
                  {stats.topPlayers.length === 0 ? (
                    <p className="no-data">{t('noData')}</p>
                  ) : (
                    <ul className="top-players-list">
                      {stats.topPlayers.map((player, index) => (
                        <li key={index} className="top-player-item">
                          <span className="player-rank">#{index + 1}</span>
                          <span className="player-name">{player.username}</span>
                          <span className="player-games">
                            {player.game_count} {t('games')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel; 