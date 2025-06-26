import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { saveGame } from '../../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaExclamationTriangle, FaHome, FaSignOutAlt, FaTimes, FaCheck, FaInfoCircle } from 'react-icons/fa';

// Уровни сложности для ИИ
const DIFFICULTY_LEVELS = {
  easy: { depth: 1, randomFactor: 0.5 },
  medium: { depth: 2, randomFactor: 0.3 },
  hard: { depth: 3, randomFactor: 0.1 },
  impossible: { depth: 4, randomFactor: 0 }
};

const TIME_CONTROLS = {
  3: 180, // 3 minutes in seconds
  5: 300, // 5 minutes in seconds
  8: 480  // 8 minutes in seconds
};

// Веса для оценки позиции шахматной фигуры
const PIECE_VALUES = {
  p: -1,  // пешка
  n: -3,  // конь
  b: -3,  // слон
  r: -5,  // ладья
  q: -9,  // ферзь
  k: -100, // король
  P: 1,   // пешка
  N: 3,   // конь
  B: 3,   // слон
  R: 5,   // ладья
  Q: 9,   // ферзь
  K: 100  // король
};

// Позиционные бонусы для разных фигур (центр доски лучше, чем края)
const POSITION_BONUSES = {
  p: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 5, 5, 5, 5, 5, 5, 5],
    [1, 1, 2, 3, 3, 2, 1, 1],
    [0.5, 0.5, 1, 2.5, 2.5, 1, 0.5, 0.5],
    [0, 0, 0, 2, 2, 0, 0, 0],
    [0.5, -0.5, -1, 0, 0, -1, -0.5, 0.5],
    [0.5, 1, 1, -2, -2, 1, 1, 0.5],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  n: [
    [-5, -4, -3, -3, -3, -3, -4, -5],
    [-4, -2, 0, 0, 0, 0, -2, -4],
    [-3, 0, 1, 1.5, 1.5, 1, 0, -3],
    [-3, 0.5, 1.5, 2, 2, 1.5, 0.5, -3],
    [-3, 0, 1.5, 2, 2, 1.5, 0, -3],
    [-3, 0.5, 1, 1.5, 1.5, 1, 0.5, -3],
    [-4, -2, 0, 0.5, 0.5, 0, -2, -4],
    [-5, -4, -3, -3, -3, -3, -4, -5]
  ],
  b: [
    [-2, -1, -1, -1, -1, -1, -1, -2],
    [-1, 0, 0, 0, 0, 0, 0, -1],
    [-1, 0, 0.5, 1, 1, 0.5, 0, -1],
    [-1, 0.5, 0.5, 1, 1, 0.5, 0.5, -1],
    [-1, 0, 1, 1, 1, 1, 0, -1],
    [-1, 1, 1, 1, 1, 1, 1, -1],
    [-1, 0.5, 0, 0, 0, 0, 0.5, -1],
    [-2, -1, -1, -1, -1, -1, -1, -2]
  ],
  r: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0.5, 1, 1, 1, 1, 1, 1, 0.5],
    [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
    [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
    [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
    [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
    [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
    [0, 0, 0, 0.5, 0.5, 0, 0, 0]
  ],
  q: [
    [-2, -1, -1, -0.5, -0.5, -1, -1, -2],
    [-1, 0, 0, 0, 0, 0, 0, -1],
    [-1, 0, 0.5, 0.5, 0.5, 0.5, 0, -1],
    [-0.5, 0, 0.5, 0.5, 0.5, 0.5, 0, -0.5],
    [0, 0, 0.5, 0.5, 0.5, 0.5, 0, -0.5],
    [-1, 0.5, 0.5, 0.5, 0.5, 0.5, 0, -1],
    [-1, 0, 0.5, 0, 0, 0, 0, -1],
    [-2, -1, -1, -0.5, -0.5, -1, -1, -2]
  ],
  k: [
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-2, -3, -3, -4, -4, -3, -3, -2],
    [-1, -2, -2, -2, -2, -2, -2, -1],
    [2, 2, 0, 0, 0, 0, 2, 2],
    [2, 3, 1, 0, 0, 1, 3, 2]
  ]
};

const GameZone = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Game setup options
  const [options, setOptions] = useState({
    timeControl: 5,    // default 5 minutes
    pieceColor: 'white', // default white
    difficulty: 'medium' // default medium
  });
  
  // Game state
  const [game, setGame] = useState(new Chess());
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState('');
  const [whiteClock, setWhiteClock] = useState(TIME_CONTROLS[5]);
  const [blackClock, setBlackClock] = useState(TIME_CONTROLS[5]);
  const [moveHistory, setMoveHistory] = useState([]);
  const [thinkingMessage, setThinkingMessage] = useState('');
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  
  // Refs for timers
  const whiteTimerRef = useRef(null);
  const blackTimerRef = useRef(null);
  const userColorRef = useRef('white');
  const aiThinkingRef = useRef(false);
  
  // Function to start a new game
  const startGame = () => {
    console.log("Starting new game...");
    
    // Reset chess game
    const newGame = new Chess();
    setGame(newGame);
    
    // Reset game state
    setGameStarted(true);
    setGameOver(false);
    setResult('');
    setMoveHistory([]);
    setThinkingMessage('');
    
    // Set up timers
    const timeInSeconds = TIME_CONTROLS[options.timeControl];
    setWhiteClock(timeInSeconds);
    setBlackClock(timeInSeconds);
    
    // Set user color
    userColorRef.current = options.pieceColor;
    aiThinkingRef.current = false;
    
    console.log("User color:", userColorRef.current);
    console.log("Difficulty:", options.difficulty);
    
    // Start appropriate timer
    stopAllTimers();
    if (options.pieceColor === 'white') {
      startWhiteTimer();
    } else {
      // If player chose black, let AI make first move
      startBlackTimer();
      setTimeout(() => {
        makeAIMove(newGame);
      }, 500);
    }
  };
  
  // Timer functions
  const startWhiteTimer = () => {
    stopWhiteTimer();
    whiteTimerRef.current = setInterval(() => {
      setWhiteClock(prev => {
        if (prev <= 1) {
          // Time's up
          clearInterval(whiteTimerRef.current);
          handleTimeOut('white');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const startBlackTimer = () => {
    stopBlackTimer();
    blackTimerRef.current = setInterval(() => {
      setBlackClock(prev => {
        if (prev <= 1) {
          // Time's up
          clearInterval(blackTimerRef.current);
          handleTimeOut('black');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const stopWhiteTimer = () => {
    if (whiteTimerRef.current) {
      clearInterval(whiteTimerRef.current);
    }
  };
  
  const stopBlackTimer = () => {
    if (blackTimerRef.current) {
      clearInterval(blackTimerRef.current);
    }
  };
  
  const stopAllTimers = () => {
    stopWhiteTimer();
    stopBlackTimer();
  };
  
  // Handle time out
  const handleTimeOut = (color) => {
    stopAllTimers();
    setGameOver(true);
    
    if (color === userColorRef.current) {
      setResult('defeat');
    } else {
      setResult('victory');
    }
    
    // Save the game
    saveGameToHistory(color === userColorRef.current ? 'timeout-loss' : 'timeout-win');
  };
  
  // Оценка позиции (больше - лучше для белых, меньше - лучше для черных)
  const evaluatePosition = (chessInstance) => {
    let score = 0;
    
    // Проверяем мат
    if (chessInstance.isCheckmate()) {
      return chessInstance.turn() === 'w' ? -1000 : 1000;
    }
    
    // Проверяем пат
    if (chessInstance.isDraw()) {
      return 0;
    }
    
    // Оцениваем материал и позицию
    const board = chessInstance.board();
    
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece) {
          // Добавляем стоимость фигуры
          score += PIECE_VALUES[piece.type];
          
          // Добавляем позиционные бонусы
          let bonus = 0;
          const pieceType = piece.type.toLowerCase();
          if (POSITION_BONUSES[pieceType]) {
            // Корректируем индексы в зависимости от цвета фигуры
            const row = piece.color === 'w' ? 7 - i : i;
            const col = piece.color === 'w' ? j : 7 - j;
            bonus = POSITION_BONUSES[pieceType][row][col];
            // Инвертируем бонус для черных фигур
            score += piece.color === 'w' ? bonus : -bonus;
          }
        }
      }
    }
    
    // Дополнительные бонусы
    const isWhiteTurn = chessInstance.turn() === 'w';
    const mobilityBonus = 0.1 * chessInstance.moves().length * (isWhiteTurn ? 1 : -1);
    score += mobilityBonus;
    
    return score;
  };
  
  // Минимакс с альфа-бета отсечением
  const minimax = (chessInstance, depth, alpha, beta, isMaximizing) => {
    if (depth === 0 || chessInstance.isGameOver()) {
      return evaluatePosition(chessInstance);
    }
    
    const moves = chessInstance.moves();
    
    // Сортируем ходы для улучшения отсечения
    moves.sort(() => Math.random() - 0.5);
    
    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        const gameCopy = new Chess(chessInstance.fen());
        gameCopy.move(move);
        const evaluation = minimax(gameCopy, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        const gameCopy = new Chess(chessInstance.fen());
        gameCopy.move(move);
        const evaluation = minimax(gameCopy, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  };
  
  // ИИ ход
  const makeAIMove = (currentGame) => {
    if (gameOver || aiThinkingRef.current) return;
    
    aiThinkingRef.current = true;
    setThinkingMessage(t('aiThinking'));
    
    // Имитируем задержку для создания эффекта "размышления" ИИ
    // Увеличиваем задержку в зависимости от сложности
    const difficultySettings = DIFFICULTY_LEVELS[options.difficulty];
    const thinkingTime = (difficultySettings.depth * 500); // больше времени для более сложных уровней
    
    setTimeout(() => {
      try {
        console.log("Making AI move with difficulty:", options.difficulty);
        
        const moves = currentGame.moves();
        if (moves.length === 0) return; // Нет возможных ходов
        
        // Для каждого хода вычисляем оценку
        const moveEvaluations = [];
        
        for (const move of moves) {
          const gameCopy = new Chess(currentGame.fen());
          gameCopy.move(move);
          
          // Оцениваем позицию с помощью минимакс
          const isWhiteTurn = gameCopy.turn() === 'b'; // Ход только что был сделан, поэтому проверяем противоположный цвет
          const evaluation = minimax(
            gameCopy, 
            difficultySettings.depth - 1, 
            -Infinity, 
            Infinity, 
            isWhiteTurn
          );
          
          moveEvaluations.push({
            move,
            evaluation
          });
        }
        
        // Сортируем ходы по их оценке
        moveEvaluations.sort((a, b) => {
          const isWhite = currentGame.turn() === 'w';
          // Для белых - по убыванию, для черных - по возрастанию
          return isWhite ? b.evaluation - a.evaluation : a.evaluation - b.evaluation;
        });
        
        // Выбираем лучший ход, иногда случайный из лучших N ходов в зависимости от сложности
        let selectedMove;
        const randomFactor = difficultySettings.randomFactor;
        if (randomFactor > 0) {
          // Определяем, сколько лучших ходов рассматриваем
          const topMovesCount = Math.max(1, Math.floor(moves.length * randomFactor));
          const randomIndex = Math.floor(Math.random() * Math.min(topMovesCount, moveEvaluations.length));
          selectedMove = moveEvaluations[randomIndex].move;
        } else {
          // На максимальной сложности всегда выбираем лучший ход
          selectedMove = moveEvaluations[0].move;
        }
        
        console.log("AI selected move:", selectedMove);
        
        // Делаем выбранный ход
        const gameCopy = new Chess(currentGame.fen());
        const move = gameCopy.move(selectedMove);
        
        // Обновляем состояние игры
        setGame(gameCopy);
        updateMoveHistory(move);
        
        // Проверяем окончание игры
        if (checkGameEnd(gameCopy)) return;
        
        // Переключаем таймеры
        if (userColorRef.current === 'white') {
          startWhiteTimer();
          stopBlackTimer();
        } else {
          startBlackTimer();
          stopWhiteTimer();
        }
      } catch (error) {
        console.error("Error making AI move:", error);
      } finally {
        setThinkingMessage('');
        aiThinkingRef.current = false;
      }
    }, thinkingTime); // Динамическая задержка в зависимости от сложности
  };
  
  // Handle player move
  const onDrop = (sourceSquare, targetSquare) => {
    if (gameOver || !gameStarted || aiThinkingRef.current) return false;
    
    // Check if it's player's turn
    const currentTurn = game.turn() === 'w' ? 'white' : 'black';
    if (currentTurn !== userColorRef.current) return false;
    
    try {
      // Make player's move
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // Auto-promote to queen for simplicity
      });
      
      if (move === null) return false; // Invalid move
      
      console.log("Player move:", move);
      
      // Update game state
      setGame(gameCopy);
      updateMoveHistory(move);
      
      // Check for game end
      if (checkGameEnd(gameCopy)) return true;
      
      // Switch timer
      if (userColorRef.current === 'white') {
        stopWhiteTimer();
        startBlackTimer();
      } else {
        stopBlackTimer();
        startWhiteTimer();
      }
      
      // Make AI move after a short delay
      setTimeout(() => {
        makeAIMove(gameCopy);
      }, 500);
      
      return true;
    } catch (error) {
      console.error("Move error:", error);
      return false;
    }
  };
  
  // Check for game end conditions
  const checkGameEnd = (currentGame) => {
    if (currentGame.isGameOver()) {
      stopAllTimers();
      setGameOver(true);
      
      if (currentGame.isCheckmate()) {
        const winner = currentGame.turn() === 'w' ? 'black' : 'white';
        if (winner === userColorRef.current) {
          setResult('victory');
          saveGameToHistory('checkmate-win');
        } else {
          setResult('defeat');
          saveGameToHistory('checkmate-loss');
        }
      } else if (currentGame.isDraw()) {
        setResult('drawResult');
        saveGameToHistory('draw');
      }
      
      return true;
    }
    
    return false;
  };
  
  // Update move history
  const updateMoveHistory = (move) => {
    setMoveHistory(prev => [...prev, move]);
  };
  
  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };
  
  // Handle option changes
  const handleOptionChange = (e) => {
    const { name, value } = e.target;
    setOptions({
      ...options,
      [name]: value
    });
    
    // Update clock display if time control changes
    if (name === 'timeControl') {
      setWhiteClock(TIME_CONTROLS[value]);
      setBlackClock(TIME_CONTROLS[value]);
    }
  };
  
  // Handle resign
  const handleResign = () => {
    if (!gameStarted || gameOver) return;
    
    stopAllTimers();
    setGameOver(true);
    setResult('defeat');
    
    // Save the game
    saveGameToHistory('resignation');
  };
  
  // Handle draw offer
  const handleDrawOffer = () => {
    if (!gameStarted || gameOver) return;
    
    // Simplified draw offer - AI will accept 50% of the time for demo purposes
    const aiAccepts = Math.random() > 0.5;
    
    if (aiAccepts) {
      stopAllTimers();
      setGameOver(true);
      setResult('drawResult');
      
      // Save the game
      saveGameToHistory('draw');
    }
  };
  
  // Save game to history
  const saveGameToHistory = (resultType) => {
    // Format moves string from move history
    const movesText = moveHistory.map((move, index) => {
      if (index % 2 === 0) {
        return `${Math.floor(index/2) + 1}. ${move.san}`;
      } else {
        return `${move.san}`;
      }
    }).join(' ');
    
    // Determine result string
    let resultString;
    if (resultType === 'abandon') {
      resultString = 'abandon';
    } else if (resultType.includes('win')) {
      resultString = 'win';
    } else if (resultType.includes('loss')) {
      resultString = 'loss';
    } else {
      resultString = 'draw';
    }
    
    // Create game data object
    const gameData = {
      piece_color: userColorRef.current,
      difficulty: options.difficulty,
      time_control: options.timeControl,
      result: resultString,
      moves: movesText
    };
    
    // Save to database
    saveGame(gameData)
      .catch(error => console.error("Error saving game:", error));
  };
  
  // Determine board orientation
  const boardOrientation = userColorRef.current === 'white' ? 'white' : 'black';
  
  // Handle automatic loss when leaving the page
  const handleLeavePage = useCallback(() => {
    if (gameStarted && !gameOver) {
      stopAllTimers();
      setGameOver(true);
      setResult('defeat');
      saveGameToHistory('abandon');
    }
  }, [gameStarted, gameOver]);

  // Handle browser close/navigation events
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (gameStarted && !gameOver) {
        // Standard way to show confirmation dialog
        e.preventDefault();
        e.returnValue = '';
        
        // Save the game as lost when closing
        handleLeavePage();
        
        // This message might not be displayed in some browsers
        return t('confirmLeavingGame');
      }
    };

    // Add event listener for page unload
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [gameStarted, gameOver, handleLeavePage, t]);

  // Handle navigation within the app
  useEffect(() => {
    // Create a function to intercept link clicks
    const handleLinkClick = (e) => {
      // Only intercept during active game
      if (gameStarted && !gameOver) {
        // Игнорируем клики внутри модального окна и игровых контролов
        if (
          e.target.closest('.confirmation-modal') !== null || 
          e.target.closest('.modal-button') !== null ||  // Явно исключаем кнопки модального окна
          e.target.closest('.game-controls') !== null || 
          e.target.closest('.game-board-section') !== null ||
          e.target.closest('.chessboard-container') !== null
        ) {
          return; // Не перехватываем эти клики
        }

        // Расширяем селектор, чтобы охватить все навигационные элементы
        const target = e.target.closest('a, button, .nav-link, .nav-item, [role="button"], .navbar *, header *');
        
        if (target) {
          // Проверяем, является ли элемент частью навигации или шапки
          const isNavigationElement = 
            // Проверка на наличие href атрибута
            target.hasAttribute('href') || 
            // Проверка на принадлежность к навигации
            target.classList.contains('nav-link') || 
            target.classList.contains('nav-item') ||
            target.closest('nav') !== null || 
            target.closest('.navbar') !== null || 
            target.closest('header') !== null ||
            // Проверка на типичные классы навигационных кнопок
            target.classList.contains('logo') ||
            target.classList.contains('language-btn');
          
          // Если это навигационный элемент и не часть игровых контролов или модального окна
          if (isNavigationElement) {
            console.log('Navigation element clicked:', target);
            e.preventDefault();
            e.stopPropagation();
            
            // Определяем целевую страницу
            const href = target.getAttribute('href');
            
            // Store the navigation target and show confirmation
            if (href) {
              setPendingNavigation(href);
            } else {
              // Для элементов без href используем общий маркер
              setPendingNavigation('navigation');
            }
            
            setShowExitConfirmation(true);
          }
        }
      }
    };

    // Add event listener for link clicks with capture phase to перехватить раньше
    document.addEventListener('click', handleLinkClick, true);
    
    return () => {
      document.removeEventListener('click', handleLinkClick, true);
    };
  }, [gameStarted, gameOver]);

  // Handle navigation confirmation
  const confirmNavigation = () => {
    // Mark game as lost
    handleLeavePage();
    
    // Proceed with navigation
    if (pendingNavigation) {
      if (pendingNavigation === 'navigation') {
        // Default navigation to home page if no specific target
        navigate('/');
      } else {
        // Проверка на внешние ссылки
        if (pendingNavigation.startsWith('http')) {
          window.location.href = pendingNavigation;
        } else {
          navigate(pendingNavigation);
        }
      }
    }
    
    setShowExitConfirmation(false);
  };

  // Handle navigation cancellation
  const cancelNavigation = () => {
    console.log('Cancelling navigation');
    // Явно очищаем маршрут навигации
    setPendingNavigation(null);
    // Закрываем модальное окно
    setShowExitConfirmation(false);
  };

  // Get navigation target name for user-friendly display
  const getNavigationTargetName = () => {
    if (!pendingNavigation || pendingNavigation === 'navigation') {
      return t('home');
    }
    
    // Try to extract page name from the URL
    const pathParts = pendingNavigation.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1];
      // Try to translate it if it matches a known page
      return t(lastPart) !== lastPart ? t(lastPart) : lastPart;
    }
    
    return t('anotherPage');
  };

  // Handle keyboard navigation (escape key)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showExitConfirmation) {
        cancelNavigation();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showExitConfirmation]);
  
  return (
    <div className="game-container">
      <h1 className="page-title text-center mb-20">{t('playAgainstAI')}</h1>
      
      {/* Exit confirmation dialog */}
      {showExitConfirmation && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <div className="warning-icon">
              <FaExclamationTriangle size={40} color="#e53935" />
            </div>
            <h3>{t('confirmLeaveGame')}</h3>
            <p>
              <FaInfoCircle className="info-icon" />
              {t('leaveGameWarning')}
              {getNavigationTargetName() !== t('home') && (
                <span className="navigation-target">
                  {t('navigatingTo')} <strong>{getNavigationTargetName()}</strong>
                </span>
              )}
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary modal-button" onClick={cancelNavigation}>
                <FaCheck /> {t('stayOnPage')}
              </button>
              <button className="btn btn-danger modal-button" onClick={confirmNavigation}>
                <FaSignOutAlt /> {t('leavePage')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {!gameStarted ? (
        <div className="game-setup-container">
          <div className="game-options-card">
            <h2 className="game-options-title">{t('gameSetup')}</h2>
            
            <div className="option-group">
              <label className="form-label">{t('selectTime')}</label>
              <div className="radio-group time-options">
                <label className={`radio-card ${options.timeControl == 3 ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="timeControl"
                    value="3"
                    checked={options.timeControl == 3}
                    onChange={handleOptionChange}
                    className="radio-input"
                  />
                  <span className="time-value">3</span>
                  <span className="time-unit">{t('minutes')}</span>
                </label>
                <label className={`radio-card ${options.timeControl == 5 ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="timeControl"
                    value="5"
                    checked={options.timeControl == 5}
                    onChange={handleOptionChange}
                    className="radio-input"
                  />
                  <span className="time-value">5</span>
                  <span className="time-unit">{t('minutes')}</span>
                </label>
                <label className={`radio-card ${options.timeControl == 8 ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="timeControl"
                    value="8"
                    checked={options.timeControl == 8}
                    onChange={handleOptionChange}
                    className="radio-input"
                  />
                  <span className="time-value">8</span>
                  <span className="time-unit">{t('minutes')}</span>
                </label>
              </div>
            </div>
            
            <div className="option-group">
              <label className="form-label">{t('selectColor')}</label>
              <div className="radio-group color-options">
                <label className={`radio-card ${options.pieceColor === 'white' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="pieceColor"
                    value="white"
                    checked={options.pieceColor === 'white'}
                    onChange={handleOptionChange}
                    className="radio-input"
                  />
                  <div className="piece-icon white-piece">♔</div>
                  <span>{t('white')}</span>
                </label>
                <label className={`radio-card ${options.pieceColor === 'black' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="pieceColor"
                    value="black"
                    checked={options.pieceColor === 'black'}
                    onChange={handleOptionChange}
                    className="radio-input"
                  />
                  <div className="piece-icon black-piece">♚</div>
                  <span>{t('black')}</span>
                </label>
              </div>
            </div>
            
            <div className="option-group">
              <label className="form-label">{t('selectDifficulty')}</label>
              <div className="radio-group difficulty-options">
                <label className={`radio-card ${options.difficulty === 'easy' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="difficulty"
                    value="easy"
                    checked={options.difficulty === 'easy'}
                    onChange={handleOptionChange}
                    className="radio-input"
                  />
                  <div className="difficulty-indicator easy">●</div>
                  <span>{t('easy')}</span>
                </label>
                <label className={`radio-card ${options.difficulty === 'medium' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="difficulty"
                    value="medium"
                    checked={options.difficulty === 'medium'}
                    onChange={handleOptionChange}
                    className="radio-input"
                  />
                  <div className="difficulty-indicator medium">●●</div>
                  <span>{t('medium')}</span>
                </label>
                <label className={`radio-card ${options.difficulty === 'hard' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="difficulty"
                    value="hard"
                    checked={options.difficulty === 'hard'}
                    onChange={handleOptionChange}
                    className="radio-input"
                  />
                  <div className="difficulty-indicator hard">●●●</div>
                  <span>{t('hard')}</span>
                </label>
                <label className={`radio-card ${options.difficulty === 'impossible' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="difficulty"
                    value="impossible"
                    checked={options.difficulty === 'impossible'}
                    onChange={handleOptionChange}
                    className="radio-input"
                  />
                  <div className="difficulty-indicator impossible">●●●●</div>
                  <span>{t('impossible')}</span>
                </label>
              </div>
            </div>
            
            <button className="btn btn-play" onClick={startGame}>
              {t('startGame')}
            </button>
          </div>
        </div>
      ) : (
        <div className="game-play-container">
          <div className="game-board-section">
            <div className="timer top-timer">
              <div className="timer-label">{boardOrientation === 'white' ? t('black') : t('white')}</div>
              <div className="timer-display">{formatTime(boardOrientation === 'white' ? blackClock : whiteClock)}</div>
            </div>
            
            <div className="chessboard-container">
              <Chessboard
                position={game.fen()}
                onPieceDrop={onDrop}
                boardOrientation={boardOrientation}
                areArrowsAllowed={true}
                customBoardStyle={{
                  borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
                }}
                customDarkSquareStyle={{ backgroundColor: '#769656' }}
                customLightSquareStyle={{ backgroundColor: '#eeeed2' }}
              />
            </div>
            
            <div className="timer bottom-timer">
              <div className="timer-label">{boardOrientation === 'white' ? t('white') : t('black')}</div>
              <div className="timer-display">{formatTime(boardOrientation === 'white' ? whiteClock : blackClock)}</div>
            </div>
          </div>
          
          <div className="game-info-section">
            {thinkingMessage && (
              <div className="thinking-message">{thinkingMessage}</div>
            )}
            
            {gameOver ? (
              <div className="game-result">
                <h2 className={`result-message ${
                  result === 'victory' ? 'victory' : (result === 'defeat' ? 'defeat' : 'draw')
                }`}>
                  {t(result)}
                </h2>
                <button className="btn btn-play" onClick={startGame}>
                  {t('playAgain')}
                </button>
              </div>
            ) : (
              <div className="game-controls">
                <button className="btn btn-danger" onClick={handleResign}>
                  {t('resign')}
                </button>
                <button className="btn btn-secondary" onClick={handleDrawOffer}>
                  {t('offerDraw')}
                </button>
              </div>
            )}
            
            {/* Move history display */}
            <div className="move-history">
              <h3 className="move-history-title">{t('movesPlayed')}</h3>
              <div className="moves-container">
                {moveHistory.length === 0 ? (
                  <p className="no-moves">{t('noMoves')}</p>
                ) : (
                  <div className="moves-list">
                    {moveHistory.map((move, index) => (
                      <span key={index} className={`move ${index % 2 === 0 ? 'white-move' : 'black-move'}`}>
                        {index % 2 === 0 ? `${Math.floor(index/2) + 1}. ` : ''}
                        {move.san}{index % 2 === 1 ? ' ' : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameZone; 