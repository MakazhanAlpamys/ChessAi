import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getGameHistory } from '../../services/api';
import { FaChess, FaTrophy, FaTimesCircle, FaChessBoard, FaHandshake, FaFilter, FaSort, FaTimes, FaAngleDown, FaAngleUp, FaEye } from 'react-icons/fa';

const GameHistory = () => {
  const { t } = useTranslation();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // State for move viewer
  const [expandedGameId, setExpandedGameId] = useState(null);
  
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const data = await getGameHistory();
        setGames(data);
        setError(null);
      } catch (err) {
        setError(t('errorFetchingGames'));
        console.error('Error fetching game history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [t]);
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get result icon
  const getResultIcon = (result) => {
    switch (result) {
      case 'win':
        return <FaTrophy className="result-icon win" />;
      case 'loss':
        return <FaTimesCircle className="result-icon loss" />;
      case 'draw':
        return <FaHandshake className="result-icon draw" />;
      case 'abandon':
        return <FaTimes className="result-icon abandon" />;
      default:
        return <FaChessBoard className="result-icon" />;
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Handle sort order change
  const handleSortOrderChange = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
  };
  
  // Toggle expanded game view
  const toggleGameExpand = (gameId) => {
    setExpandedGameId(prevId => prevId === gameId ? null : gameId);
  };
  
  // Format moves for display
  const formatMovesForDisplay = (movesString) => {
    if (!movesString) return [];
    
    const moves = movesString.split(' ').filter(move => move.trim() !== '');
    const formattedMoves = [];
    
    for (let i = 0; i < moves.length; i += 2) {
      formattedMoves.push({
        number: Math.floor(i / 2) + 1,
        white: moves[i],
        black: moves[i + 1] || ''
      });
    }
    
    return formattedMoves;
  };

  // Filter and sort games
  const filteredAndSortedGames = React.useMemo(() => {
    // First apply filter
    let result = [...games];
    if (filter !== 'all') {
      result = result.filter(game => game.result === filter);
    }

    // Then apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.created_at) - new Date(b.created_at);
      } else if (sortBy === 'difficulty') {
        const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3, 'impossible': 4 };
        comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      } else if (sortBy === 'time') {
        comparison = a.time_control - b.time_control;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [games, filter, sortBy, sortOrder]);

  // Calculate stats
  const stats = React.useMemo(() => {
    const totalGames = games.length;
    const wins = games.filter(game => game.result === 'win').length;
    const losses = games.filter(game => game.result === 'loss').length;
    const draws = games.filter(game => game.result === 'draw').length;
    
    const winRate = totalGames > 0 ? (wins / totalGames * 100).toFixed(1) : 0;
    
    return { totalGames, wins, losses, draws, winRate };
  }, [games]);

  if (loading) {
    return <div className="loading-container">{t('loading')}</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="game-history-container page-container animate-fadeIn">
      <h1 className="page-title text-center mb-20">
        <span className="chess-piece chess-rook"></span>
        {t('gameHistory')}
      </h1>
      
      {/* Stats summary */}
      <div className="stats-summary">
        <div className="stat-card card animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <div className="stat-icon-wrapper">
            <FaChessBoard className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-title">{t('totalGames')}</div>
            <div className="stats-counter">{stats.totalGames}</div>
          </div>
        </div>
        <div className="stat-card card animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="stat-icon-wrapper win">
            <FaTrophy className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-title">{t('wins')}</div>
            <div className="stats-counter">{stats.wins}</div>
          </div>
        </div>
        <div className="stat-card card animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <div className="stat-icon-wrapper loss">
            <FaTimesCircle className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-title">{t('losses')}</div>
            <div className="stats-counter">{stats.losses}</div>
          </div>
        </div>
        <div className="stat-card card animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <div className="stat-icon-wrapper draw">
            <FaHandshake className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-title">{t('draws')}</div>
            <div className="stats-counter">{stats.draws}</div>
          </div>
        </div>
        <div className="stat-card card animate-fadeIn" style={{ animationDelay: '0.5s' }}>
          <div className="stat-icon-wrapper rate">
            <div className="win-rate-chart" style={{ backgroundImage: `conic-gradient(var(--chess-primary) ${stats.winRate}%, #f5f5f5 0)` }}>
              <div className="win-rate-inner">{stats.winRate}%</div>
            </div>
          </div>
          <div className="stat-content">
            <div className="stat-title">{t('winRate')}</div>
            <div className="stats-counter">{stats.winRate}%</div>
          </div>
        </div>
      </div>
      
      {/* Filter and Sort Controls */}
      <div className="filter-sort-controls card animate-slideIn">
        <h3 className="section-title">
          <FaFilter className="section-icon" /> {t('filterAndSort')}
        </h3>
          
        <div className="controls-grid">
          <div className="control-group">
            <label htmlFor="filter" className="control-label">{t('filterBy')}</label>
              <select 
              id="filter" 
              className="form-input" 
                value={filter} 
                onChange={handleFilterChange}
              >
                <option value="all">{t('allGames')}</option>
              <option value="win">{t('win')}</option>
              <option value="loss">{t('loss')}</option>
              <option value="draw">{t('draw')}</option>
              </select>
            </div>
            
          <div className="control-group">
            <label htmlFor="sortBy" className="control-label">{t('sortBy')}</label>
              <select 
              id="sortBy" 
              className="form-input" 
                value={sortBy} 
                onChange={handleSortChange}
              >
                <option value="date">{t('date')}</option>
                <option value="difficulty">{t('difficulty')}</option>
              <option value="time">{t('time')}</option>
              </select>
          </div>
          
          <div className="control-group">
            <label className="control-label">{t('changeSortOrder')}</label>
              <button 
              className="btn btn-secondary"
                onClick={handleSortOrderChange} 
              >
              <FaSort /> {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
          </div>
        </div>
      </div>
      
      {/* Games List */}
      <h2 className="section-title">
        <FaChess className="section-icon" /> {t('gamesList')}
      </h2>
        
        {filteredAndSortedGames.length === 0 ? (
        <div className="no-games-message card animate-fadeIn">{t('noGames')}</div>
        ) : (
        <div className="games-list compact-list">
          {filteredAndSortedGames.map((game, index) => (
            <div key={game.id} className="game-card-container animate-fadeIn" style={{ animationDelay: `${0.1 * index}s` }}>
              <div className={`game-card card ${expandedGameId === game.id ? 'expanded' : ''}`}>
                <div className="game-card-header">
                  <div className="game-result-icon">
                      {getResultIcon(game.result)}
                      </div>
                  <div className="game-date">{formatDate(game.created_at)}</div>
          </div>
                
                <div className="game-card-content">
                  <div className="game-detail">
                    <div className="detail-label">{t('color')}</div>
                    <div className="detail-value">{game.player_color === 'white' ? t('white') : t('black')}</div>
      </div>
      
                  <div className="game-detail">
                    <div className="detail-label">{t('difficulty')}</div>
                    <div className="detail-value">{t(game.difficulty)}</div>
            </div>
            
                  <div className="game-detail">
                    <div className="detail-label">{t('timeControl')}</div>
                    <div className="detail-value">{game.time_control} {t('minutes')}</div>
                </div>
                  
                  <div className="game-detail">
                    <div className="detail-label">{t('moves')}</div>
                    <div className="detail-value">{game.moves ? game.moves.split(' ').length : 0}</div>
                </div>
                </div>
                
                <div className="game-card-footer">
                  <button 
                    className="btn btn-primary view-btn"
                    onClick={() => toggleGameExpand(game.id)}
                  >
                    {expandedGameId === game.id ? (
                      <><FaAngleUp className="icon-left" /> {t('hideDetails')}</>
                    ) : (
                      <><FaEye className="icon-left" /> {t('view')}</>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Expandable Game Details */}
              {expandedGameId === game.id && (
                <div className="game-details-expanded card animate-slideDown">
                  <div className="expanded-header">
                    <h3 className="expanded-title">{t('gameDetails')}</h3>
                  </div>
                  
                  <div className="expanded-content">
                    <div className="game-details-section">
                      <div className="details-grid">
                        <div className="detail-row">
                          <div className="detail-label">{t('date')}</div>
                          <div className="detail-value">{formatDate(game.created_at)}</div>
                        </div>
                        
                        <div className="detail-row">
                          <div className="detail-label">{t('result')}</div>
                          <div className="detail-value result">
                            {getResultIcon(game.result)}
                            <span>{t(game.result)}</span>
                          </div>
                        </div>
                        
                        <div className="detail-row">
                          <div className="detail-label">{t('pieceColor')}</div>
                          <div className="detail-value">{game.player_color === 'white' ? t('white') : t('black')}</div>
                        </div>
                        
                        <div className="detail-row">
                          <div className="detail-label">{t('difficulty')}</div>
                          <div className="detail-value">{t(game.difficulty)}</div>
                        </div>
                        
                        <div className="detail-row">
                          <div className="detail-label">{t('timeControl')}</div>
                          <div className="detail-value">{game.time_control} {t('minutes')}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="moves-section">
                      <h4 className="moves-title">{t('movesPlayed')}</h4>
                      
                      {!game.moves ? (
                        <p className="no-moves">{t('noMovesRecorded')}</p>
                      ) : (
                        <div className="moves-list chess-board-bg">
                          <div className="moves-scrollable">
                            <table className="moves-table">
                              <thead>
                                <tr>
                                  <th>#</th>
                                  <th>{t('white')}</th>
                                  <th>{t('black')}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {formatMovesForDisplay(game.moves).map(move => (
                                  <tr key={move.number}>
                                    <td>{move.number}.</td>
                                    <td className="move-cell">{move.white}</td>
                                    <td className="move-cell">{move.black}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="expanded-footer">
                    <button 
                      className="btn btn-primary close-details-btn" 
                      onClick={() => toggleGameExpand(null)}
                    >
                      {t('close')}
                    </button>
                  </div>
                </div>
              )}
          </div>
          ))}
        </div>
        )}
        
        {/* View All Games Button at Bottom */}
        {filteredAndSortedGames.length > 0 && (
          <div className="view-all-container">
            <button 
              className="btn btn-primary view-all-btn"
              onClick={() => {
                if (expandedGameId) {
                  setExpandedGameId(null);
                } else if (filter !== 'all' || sortBy !== 'date' || sortOrder !== 'desc') {
                  setFilter('all');
                  setSortBy('date');
                  setSortOrder('desc');
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              {expandedGameId ? t('collapseAll') : 
               (filter !== 'all' || sortBy !== 'date' || sortOrder !== 'desc') ? 
               t('showAllGames') : t('backToTop')}
            </button>
        </div>
      )}
    </div>
  );
};

export default GameHistory; 