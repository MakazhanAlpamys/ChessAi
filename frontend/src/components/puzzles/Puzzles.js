import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { FaChessPawn, FaChessKnight, FaChessRook, FaChessQueen, FaTag, FaChessKing, FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import puzzleData from '../../data/puzzleData';
import { LanguageContext } from '../../context/LanguageContext';

const Puzzles = () => {
  const { t } = useTranslation();
  const { language } = useContext(LanguageContext);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get unique themes
  const themes = [...new Set(puzzleData.map(puzzle => puzzle.theme))];

  // Get translated theme name
  const getTranslatedTheme = (theme) => {
    return t(theme);
  };

  // Get translated description based on current language
  const getTranslatedDescription = (puzzle) => {
    if (!puzzle) return '';
    
    // If we have translations for this puzzle, use them
    if (puzzle.translations) {
      if (language === 'ru' && puzzle.translations.ru) {
        return puzzle.translations.ru;
      } else if (language === 'kk' && puzzle.translations.kz) {
        return puzzle.translations.kz;
      }
    }
    
    // Fallback to English description
    return puzzle.description;
  };

  // Filter puzzles by selected difficulty, theme, and search query
  const filteredPuzzles = puzzleData.filter(puzzle => {
    const difficultyMatch = selectedDifficulty === 'all' || puzzle.difficulty === selectedDifficulty;
    const themeMatch = selectedTheme === 'all' || puzzle.theme === selectedTheme;
    
    const description = getTranslatedDescription(puzzle).toLowerCase();
    const themeText = getTranslatedTheme(puzzle.theme).toLowerCase();
    const searchMatch = searchQuery === '' || 
                        description.includes(searchQuery.toLowerCase()) || 
                        themeText.includes(searchQuery.toLowerCase()) ||
                        String(puzzle.id).includes(searchQuery);
    
    return difficultyMatch && themeMatch && searchMatch;
  });

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy': return <FaChessPawn className="puzzle-difficulty-icon" />;
      case 'medium': return <FaChessKnight className="puzzle-difficulty-icon" />;
      case 'hard': return <FaChessRook className="puzzle-difficulty-icon" />;
      case 'extreme': return <FaChessQueen className="puzzle-difficulty-icon" />;
      default: return null;
    }
  };

  return (
    <div className="puzzles-container">
      <div className="puzzles-header">
        <h1>{t('chessPuzzles')}</h1>
        <p>{t('improveYourSkills')}</p>
      </div>

      <div className="search-and-filters compact-filters">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder={t('searchPuzzles')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button 
              className="clear-search" 
              onClick={() => setSearchQuery('')}
            >
              ×
            </button>
          )}
        </div>

        <div className="filters-container">
          <div className="filter-section compact">
            <h3>{t('difficulty')}:</h3>
            <div className="difficulty-buttons compact-buttons">
              <button 
                className={`filter-button compact ${selectedDifficulty === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedDifficulty('all')}
              >
                {t('allGames')}
              </button>
              <button 
                className={`filter-button compact easy ${selectedDifficulty === 'easy' ? 'active' : ''}`}
                onClick={() => setSelectedDifficulty('easy')}
              >
                {getDifficultyIcon('easy')} {t('easy')}
              </button>
              <button 
                className={`filter-button compact medium ${selectedDifficulty === 'medium' ? 'active' : ''}`}
                onClick={() => setSelectedDifficulty('medium')}
              >
                {getDifficultyIcon('medium')} {t('medium')}
              </button>
              <button 
                className={`filter-button compact hard ${selectedDifficulty === 'hard' ? 'active' : ''}`}
                onClick={() => setSelectedDifficulty('hard')}
              >
                {getDifficultyIcon('hard')} {t('hard')}
              </button>
              <button 
                className={`filter-button compact extreme ${selectedDifficulty === 'extreme' ? 'active' : ''}`}
                onClick={() => setSelectedDifficulty('extreme')}
              >
                {getDifficultyIcon('extreme')} {t('extreme')}
              </button>
            </div>
          </div>

          <div className="filter-section compact">
            <h3>{t('theme')}:</h3>
            <div className="theme-buttons compact-buttons">
              <button 
                className={`filter-button compact ${selectedTheme === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedTheme('all')}
              >
                {t('allGames')}
              </button>
              {themes.map(theme => (
                <button 
                  key={theme}
                  className={`filter-button compact ${selectedTheme === theme ? 'active' : ''}`}
                  onClick={() => setSelectedTheme(theme)}
                >
                  <FaTag className="theme-icon" /> {getTranslatedTheme(theme)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="puzzles-count">
        <span className="count-badge">{filteredPuzzles.length}</span> {t('chessPuzzlesFound')}
      </div>

      <div className="puzzles-grid compact-grid">
        {filteredPuzzles.map(puzzle => (
          <Link 
            to={`/puzzles/${puzzle.id}`} 
            key={puzzle.id} 
            className={`puzzle-card compact ${puzzle.difficulty}`}
          >
            <div className="puzzle-card-header compact-header">
              <h3>{t('puzzle')} #{puzzle.id}</h3>
              <span className={`difficulty-badge compact ${puzzle.difficulty}`}>
                {getDifficultyIcon(puzzle.difficulty)} {t(puzzle.difficulty)}
              </span>
            </div>
            <div className="puzzle-info compact-info">
              <div className="puzzle-theme-tag">
                <FaTag className="theme-icon" /> {getTranslatedTheme(puzzle.theme)}
              </div>
              <div className="puzzle-description-preview">
                {getTranslatedDescription(puzzle).length > 60 
                  ? `${getTranslatedDescription(puzzle).substring(0, 60)}...` 
                  : getTranslatedDescription(puzzle)}
              </div>
            </div>
            <div className="puzzle-card-footer compact-footer">
              <div className="player-color-tag">
                <FaChessKing className="player-color-icon white" />
                {t('playingWhite')}
              </div>
              <button className="solve-btn compact-btn">{t('solve')}</button>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Quick Navigation */}
      <div className="puzzles-nav">
        <div className="puzzle-difficulty-nav">
          <span>{t('quickAccess')}:</span>
          {['easy', 'medium', 'hard', 'extreme'].map(difficulty => (
            <button 
              key={difficulty}
              className={`nav-difficulty-btn ${difficulty}`}
              onClick={() => {
                setSelectedDifficulty(difficulty);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              {getDifficultyIcon(difficulty)} {t(difficulty)}
            </button>
          ))}
        </div>
        {selectedDifficulty !== 'all' || selectedTheme !== 'all' || searchQuery !== '' ? (
          <button 
            className="clear-filters-btn"
            onClick={() => {
              setSelectedDifficulty('all');
              setSelectedTheme('all');
              setSearchQuery('');
            }}
          >
            {t('clearFilters')}
          </button>
        ) : (
          <button 
            className="back-to-top-btn"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            {t('backToTop')}
          </button>
        )}
      </div>
    </div>
  );
};

export default Puzzles; 