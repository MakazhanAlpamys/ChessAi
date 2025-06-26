import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaSearch, FaYoutube, FaArrowLeft, FaTimes, FaExpand, FaCompress } from 'react-icons/fa';
import { getLessons } from '../../services/api';

const Lessons = () => {
  const { t } = useTranslation();
  
  const [lessons, setLessons] = useState([]);
  const [filteredLessons, setFilteredLessons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const lessonsData = await getLessons();
        setLessons(lessonsData);
        setFilteredLessons(lessonsData);
      } catch (err) {
        setError(err.message || t('error'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLessons();
  }, [t]);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        if (isFullscreen) {
          exitFullscreen();
        } else if (selectedVideo) {
          closeExpandedView();
        }
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    // Handle fullscreen change events
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [selectedVideo, isFullscreen]);
  
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    // Filter lessons based on search term
    if (term.trim() === '') {
      setFilteredLessons(lessons);
    } else {
      const filtered = lessons.filter(lesson => 
        lesson.title.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredLessons(filtered);
    }
  };
  
  // Function to format YouTube URLs for embedding
  const formatYoutubeUrl = (url) => {
    let videoId = '';
    
    // Handle both formats of YouTube URLs
    if (url.includes('youtube.com/watch')) {
      videoId = url.split('v=')[1];
      // Handle additional parameters
      const ampersandPosition = videoId.indexOf('&');
      if (ampersandPosition !== -1) {
        videoId = videoId.substring(0, ampersandPosition);
      }
    } else if (url.includes('youtu.be')) {
      videoId = url.split('youtu.be/')[1];
    }
    
    return `https://www.youtube.com/embed/${videoId}`;
  };
  
  const openExpandedView = (lesson) => {
    setSelectedVideo(lesson);
    // Add no-scroll class to body
    document.body.classList.add('no-scroll');
  };
  
  const closeExpandedView = () => {
    setSelectedVideo(null);
    // Remove no-scroll class from body
    document.body.classList.remove('no-scroll');
    // Exit fullscreen if active
    if (isFullscreen) {
      exitFullscreen();
    }
  };
  
  const toggleFullscreen = () => {
    const videoContainer = document.querySelector('.video-modal-content');
    
    if (!isFullscreen) {
      // Enter fullscreen
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      } else if (videoContainer.webkitRequestFullscreen) {
        videoContainer.webkitRequestFullscreen();
      } else if (videoContainer.msRequestFullscreen) {
        videoContainer.msRequestFullscreen();
      }
    } else {
      exitFullscreen();
    }
  };
  
  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  };
  
  if (isLoading) {
    return <div className="loading">{t('loading')}</div>;
  }
  
  return (
    <div className="lessons-page">
      <h1 className="page-title text-center mb-20">{t('lessons')}</h1>
      
      {error && (
        <div className="error-message text-center mb-20">{error}</div>
      )}
      
      <div className="lesson-search">
        <div className="form-group" style={{ position: 'relative' }}>
          <FaSearch style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '15px', 
            transform: 'translateY(-50%)',
            color: '#8f8f8f'
          }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder={t('searchLessons')}
            value={searchTerm}
            onChange={handleSearch}
            style={{ paddingLeft: '40px' }}
          />
        </div>
      </div>
      
      {filteredLessons.length === 0 ? (
        <p className="text-center">{t('noLessons')}</p>
      ) : (
        <div className="lessons-container">
          {filteredLessons.map(lesson => (
            <div key={lesson.id} className="lesson-card">
              <div className="lesson-video" onClick={() => openExpandedView(lesson)}>
                <iframe 
                  title={lesson.title}
                  src={formatYoutubeUrl(lesson.video_url)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
                <div className="video-overlay">
                  <span><FaExpand /> {t('expandVideo')}</span>
                </div>
              </div>
              
              <div className="lesson-content">
                <h3 className="lesson-title">{lesson.title}</h3>
                <a 
                  href={lesson.video_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: '#6d9e46',
                    textDecoration: 'none',
                    fontSize: '0.9rem'
                  }}
                >
                  <FaYoutube style={{ marginRight: '5px' }} />
                  {t('viewOnYoutube')}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Expanded Video Modal */}
      {selectedVideo && (
        <div className={`video-modal-overlay ${isFullscreen ? 'fullscreen' : ''}`}>
          <div className="video-modal">
            <div className="video-modal-header">
              <button className="back-button" onClick={closeExpandedView} title={t('backToLessons')}>
                <FaArrowLeft /> {t('back')}
              </button>
              <h3 className="video-modal-title">{selectedVideo.title}</h3>
              <div className="video-controls">
                <button className="fullscreen-button" onClick={toggleFullscreen} title={isFullscreen ? t('exitFullscreen') : t('enterFullscreen')}>
                  {isFullscreen ? <FaCompress /> : <FaExpand />}
                </button>
                <button className="close-button" onClick={closeExpandedView} title={t('close')}>
                  <FaTimes />
                </button>
              </div>
            </div>
            <div className="video-modal-content">
              <iframe 
                title={selectedVideo.title}
                src={formatYoutubeUrl(selectedVideo.video_url)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lessons; 