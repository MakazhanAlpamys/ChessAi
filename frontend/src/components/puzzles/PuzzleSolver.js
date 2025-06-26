import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle, FaEye, FaQuestion, FaTag, FaChessKing, FaRedo, FaList } from 'react-icons/fa';
import puzzleData from '../../data/puzzleData';
import { LanguageContext } from '../../context/LanguageContext';

const PuzzleSolver = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language } = useContext(LanguageContext);
  
  const [chess, setChess] = useState(new Chess());
  const [puzzle, setPuzzle] = useState(null);
  const [showSolutionState, setShowSolutionState] = useState(false);
  const [status, setStatus] = useState('initial'); // initial, correct, incorrect, completed
  const [errorMessage, setErrorMessage] = useState('');
  const [boardSize, setBoardSize] = useState(400);

  // Adjust board size for responsive layout
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 500) {
        setBoardSize(width * 0.85);
      } else if (width < 768) {
        setBoardSize(width * 0.6);
      } else {
        setBoardSize(450);
      }
    };

    handleResize(); // Call once on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load the puzzle safely
  const loadFenSafely = useCallback((fen) => {
    try {
      const chessInstance = new Chess();
      chessInstance.load(fen);
      return { success: true, instance: chessInstance };
    } catch (error) {
      console.error(`Error loading FEN: ${fen}`, error);
      
      // Try to recover by loading the default position
      try {
        const defaultChess = new Chess();
        return { success: false, instance: defaultChess, error: "Invalid FEN position" };
      } catch (secondError) {
        console.error("Recovery also failed", secondError);
        return { success: false, instance: null, error: "Critical chess error" };
      }
    }
  }, []);

  // Reset puzzle state - wrapped in useCallback to avoid infinite loops
  const resetPuzzle = useCallback((currentPuzzle = puzzle) => {
    if (!currentPuzzle) return;
    
    setStatus('initial');
    setShowSolutionState(false);
    
    const result = loadFenSafely(currentPuzzle.fen);
    
    if (result.success) {
      setChess(result.instance);
      setErrorMessage('');
    } else {
      setErrorMessage(t('invalidPosition') + ': ' + (result.error || t('unknownError')));
    }
  }, [puzzle, loadFenSafely, t]);

  useEffect(() => {
    // Find the puzzle by ID
    const puzzleId = parseInt(id);
    const currentPuzzle = puzzleData.find(p => p.id === puzzleId);
    
    if (!currentPuzzle) {
      setErrorMessage(t('puzzleNotFound'));
      return;
    }
    
    setPuzzle(currentPuzzle);
    resetPuzzle(currentPuzzle);
  }, [id, t, resetPuzzle]); // Now resetPuzzle is properly memoized

  // Handle piece drop by player
  const handlePieceDrop = (sourceSquare, targetSquare) => {
    if (!puzzle || status === 'completed' || showSolutionState) {
      return false;
    }

    try {
      // Try to make the move
      const move = chess.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // Always promote to queen for simplicity
      });

      if (!move) {
        return false;
      }

      // Check if the move matches the solution
      if (move.from + move.to === puzzle.solution) {
        // Make opponent's response
        try {
          const nextMove = puzzle.nextMove;
          if (nextMove) {
            chess.move({
              from: nextMove.substring(0, 2),
              to: nextMove.substring(2, 4),
              promotion: 'q'
            });
          }
          setStatus('correct');
          setTimeout(() => {
            setStatus('completed');
          }, 1500);
        } catch (error) {
          console.error("Error making opponent's move:", error);
          // Still mark as correct even if opponent move failed
          setStatus('completed');
        }
        return true;
      } else {
        // Incorrect move
        setStatus('incorrect');
        
        // Undo the move after a brief delay
        setTimeout(() => {
          chess.undo();
          setStatus('initial');
        }, 1500);
        return true;
      }
    } catch (error) {
      console.error("Error handling piece drop:", error);
      return false;
    }
  };

  // Get translated theme name
  const getTranslatedTheme = (theme) => {
    return theme ? t(theme) : '';
  };

  // Show solution
  const showSolution = () => {
    if (!puzzle || status === 'completed') {
      return;
    }
    
    setShowSolutionState(true);
    
    try {
      // Reset the board to the initial position to ensure the solution works correctly
      const freshChess = loadFenSafely(puzzle.fen);
      if (!freshChess.success) {
        setErrorMessage(t('errorShowingSolution'));
        return;
      }
      
      setChess(freshChess.instance);
      
      // Make the solution move with visualization delay
      setTimeout(() => {
        try {
          // Make the solution move
          const solution = puzzle.solution;
          const sourceSquare = solution.substring(0, 2);
          const targetSquare = solution.substring(2, 4);
          
          freshChess.instance.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q'
          });
          
          setChess(freshChess.instance);
          
          // Make opponent's response with delay
          const nextMove = puzzle.nextMove;
          if (nextMove) {
            setTimeout(() => {
              try {
                freshChess.instance.move({
                  from: nextMove.substring(0, 2),
                  to: nextMove.substring(2, 4),
                  promotion: 'q'
                });
                setChess(freshChess.instance);
                setStatus('completed');
              } catch (error) {
                console.error("Error making opponent's move:", error);
                setStatus('completed');
              }
            }, 800);
          } else {
            setStatus('completed');
          }
        } catch (error) {
          console.error("Error showing solution move:", error);
          setErrorMessage(t('errorShowingSolution'));
        }
      }, 300);
    } catch (error) {
      console.error("Error showing solution:", error);
      setErrorMessage(t('errorShowingSolution'));
    }
  };
  
  // Navigate to previous puzzle
  const goToPreviousPuzzle = () => {
    if (!puzzle) return;
    
    const prevId = puzzle.id > 1 ? puzzle.id - 1 : puzzleData.length;
    navigate(`/puzzles/${prevId}`);
  };
  
  // Navigate to next puzzle
  const goToNextPuzzle = () => {
    if (!puzzle) return;
    
    const nextId = puzzle.id < puzzleData.length ? puzzle.id + 1 : 1;
    navigate(`/puzzles/${nextId}`);
  };
  
  // Navigate back to puzzles list
  const goBackToPuzzlesList = () => {
    navigate('/puzzles');
  };
  
  // Get translated description
  const getTranslatedDescription = (puzzle) => {
    if (!puzzle) return '';
    
    if (puzzle.translations) {
      if (language === 'ru' && puzzle.translations.ru) {
        return puzzle.translations.ru;
      } else if (language === 'kk' && puzzle.translations.kz) {
        return puzzle.translations.kz;
      }
    }
    
    return puzzle.description;
  };

  if (errorMessage) {
    return (
      <div className="puzzle-error-container">
        <h2>{t('errorOccurred')}</h2>
        <p className="error-message">{errorMessage}</p>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/puzzles')}
        >
          {t('backToPuzzles')}
        </button>
      </div>
    );
  }

  if (!puzzle) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="puzzle-solver">
      <div className="puzzle-header">
        <h1>{t('puzzle')} #{puzzle.id}</h1>
        <div className="puzzle-theme">
          <FaTag className="theme-icon" />
          <div className="puzzle-theme-info">
            {getTranslatedTheme(puzzle.theme)}
          </div>
        </div>
      </div>
      
      <div className="puzzle-description">
        <p>{getTranslatedDescription(puzzle)}</p>
        <div className="player-color-info">
          <FaChessKing className="player-color-icon white" />
          {t('playingWhite')}
        </div>
      </div>
      
      <div className="puzzle-board-container">
        <div className="chessboard-wrapper">
          <Chessboard 
            id="puzzle-board"
            position={chess.fen()}
            onPieceDrop={handlePieceDrop}
            boardOrientation={puzzle.playerColor === 'black' ? 'black' : 'white'}
            areArrowsAllowed={true}
            customBoardStyle={{
              borderRadius: '4px',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
            }}
            customDarkSquareStyle={{ backgroundColor: '#779556' }}
            customLightSquareStyle={{ backgroundColor: '#edeed1' }}
            boardWidth={boardSize}
          />
        </div>
        
        {status === 'correct' && (
          <div className="status-message success-message animate-fadeIn">
            <FaCheckCircle className="correct-icon" />
            {t('correctMove')}
          </div>
        )}
        
        {status === 'incorrect' && (
          <div className="status-message error-message animate-fadeIn">
            <FaTimesCircle className="incorrect-icon" />
            {t('incorrectMove')}
          </div>
        )}
        
        {showSolutionState && (
          <div className="solution-text animate-fadeIn">
            <FaEye className="solution-icon" />
            {t('solutionIs')} <strong>{puzzle.solution}</strong>
          </div>
        )}
      </div>
      
      <div className="puzzle-controls">
        <div className="puzzle-actions-container">
          <div className="puzzle-primary-actions">
            {!showSolutionState && status !== 'completed' && (
              <button 
                className="btn btn-compact btn-secondary show-answer-btn"
                onClick={showSolution}
              >
                <FaQuestion /> <span>{t('showAnswer')}</span>
              </button>
            )}
            
            <button 
              className="btn btn-compact btn-secondary"
              onClick={() => resetPuzzle()}
            >
              <FaRedo /> <span>{t('resetPuzzle')}</span>
            </button>
          </div>
          
          <div className="puzzle-navigation">
            <button 
              className="btn btn-compact btn-primary prev-puzzle-btn"
              onClick={goToPreviousPuzzle}
            >
              <FaArrowLeft /> <span>{t('previousPuzzle')}</span>
            </button>
            
            <button 
              className="btn btn-compact btn-primary back-to-list-btn"
              onClick={goBackToPuzzlesList}
            >
              <FaList /> <span>{t('backToList')}</span>
            </button>
            
            <button 
              className="btn btn-compact btn-primary next-puzzle-btn"
              onClick={goToNextPuzzle}
            >
              <span>{t('nextPuzzle')}</span> <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuzzleSolver; 