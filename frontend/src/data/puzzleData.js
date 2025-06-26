/**
 * Chess puzzle data
 * Each puzzle includes:
 * - id: unique identifier
 * - fen: the chess position in FEN notation
 * - difficulty: easy, medium, hard, or extreme
 * - solution: the correct move in algebraic notation (from-to)
 * - nextMove: the move the opponent will make after the correct solution (from-to)
 * - playerColor: "white" for all puzzles (we always play as white)
 * - theme: tactical theme of the puzzle
 * - description: brief description of the puzzle goal without revealing the solution
 * - translations: contains Russian and Kazakh translations for the description
 */

const puzzleData = [
  {
    id: 1,
    fen: "r3r1k1/pp3ppp/2p5/8/3N1P2/2P5/PP4PP/3R2K1 w - - 0 1",
    difficulty: "easy",
    solution: "d4e6",
    nextMove: "g8h8",
    playerColor: "white",
    theme: "fork",
    description: "Find the tactical opportunity that exploits the position of multiple enemy pieces.",
    translations: {
      ru: "Найдите тактическую возможность, которая использует позицию нескольких фигур противника.",
      kz: "Қарсыластың бірнеше фигурасының позициясын пайдаланатын тактикалық мүмкіндікті табыңыз."
    }
  },
  {
    id: 2,
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1",
    difficulty: "easy",
    solution: "f3g5",
    nextMove: "h7h6",
    playerColor: "white",
    theme: "pin_attack",
    description: "Find the move that creates a threat and puts pressure on the opponent's position.",
    translations: {
      ru: "Найдите ход, который создает связочную атаку и оказывает давление на позицию противника.",
      kz: "Байланыс шабуылын жасайтын және қарсыластың позициясына қысым көрсететін жүрісті табыңыз."
    }
  },
  {
    id: 3,
    fen: "r1bq1rk1/ppp1nppp/2n5/3p4/2PP4/P1Q5/1P3PPP/R1B1KBNR w KQ - 0 1",
    difficulty: "medium",
    solution: "c4d5",
    nextMove: "c6d4",
    playerColor: "white",
    theme: "zwischenzug",
    description: "A quiet but critical position hides a tactical sequence that requires precise calculation.",
    translations: {
      ru: "В тихой, но критической позиции скрывается тактическая последовательность, требующая точного расчёта.",
      kz: "Тыныш, бірақ маңызды позицияда дәл есептеуді қажет ететін тактикалық тізбек жасырылған."
    }
  },
  {
    id: 4,
    fen: "r4rk1/ppp2ppp/2n1b3/3qP3/3P4/P1P5/2Q2PPP/R1B2RK1 w - - 0 1",
    difficulty: "medium",
    solution: "c2g6",
    nextMove: "f7g6",
    playerColor: "white",
    theme: "queen_sacrifice",
    description: "Find the daring move that initially appears to lose material but leads to a powerful attack.",
    translations: {
      ru: "Найдите смелый ход, который изначально кажется потерей материала, но ведет к мощной атаке.",
      kz: "Бастапқыда материалды жоғалту болып көрінетін, бірақ күшті шабуылға әкелетін батыл жүрісті табыңыз."
    }
  },
  {
    id: 5,
    fen: "r2qr1k1/1pp2ppp/p1pb1n2/8/3P4/1B3NP1/PP3PBP/R2Q1RK1 w - - 0 1",
    difficulty: "hard",
    solution: "b3f7",
    nextMove: "g8f7",
    playerColor: "white",
    theme: "deflection",
    description: "A complex position requires you to see multiple moves ahead to find the winning combination.",
    translations: {
      ru: "Сложная позиция требует видеть на несколько ходов вперед, чтобы найти выигрышную комбинацию.",
      kz: "Күрделі позиция жеңімпаз комбинацияны табу үшін бірнеше жүріс алға қарауды талап етеді."
    }
  },
  {
    id: 6,
    fen: "3r2k1/p4ppp/1p6/2pPp3/2P5/1P4P1/P4P1P/3R2K1 w - - 0 1",
    difficulty: "hard",
    solution: "d5d6",
    nextMove: "d8d6",
    playerColor: "white",
    theme: "pawn_breakthrough",
    description: "A strategic position that conceals a deeply calculated tactical breakthrough.",
    translations: {
      ru: "Стратегическая позиция, скрывающая глубоко просчитанный тактический прорыв.",
      kz: "Терең есептелген тактикалық серпілісті жасыратын стратегиялық позиция."
    }
  },
  {
    id: 7,
    fen: "r1bqk2r/ppp2ppp/2np1n2/2b1p3/4P3/1BP2N2/PP1P1PPP/RNBQ1RK1 w kq - 0 1",
    difficulty: "extreme",
    solution: "f3e5",
    nextMove: "d6e5",
    playerColor: "white",
    theme: "double_attack",
    description: "A deceptively calm position hides a spectacular combination requiring extraordinary vision.",
    translations: {
      ru: "Обманчиво спокойная позиция скрывает захватывающую комбинацию, требующую исключительного видения.",
      kz: "Алдамшы тыныш позиция ерекше көрініс қажет ететін керемет комбинацияны жасырады."
    }
  },
  {
    id: 8,
    fen: "r3r1k1/pp1qppb1/2p1bnp1/3p4/3P1B2/2NB1N1P/PPP2PP1/R2QR1K1 w - - 0 1",
    difficulty: "extreme",
    solution: "f3e5",
    nextMove: "f6e5",
    playerColor: "white",
    theme: "clearance_sacrifice",
    description: "An intricate position demands extraordinary calculation and pattern recognition to find the winning idea.",
    translations: {
      ru: "Сложная позиция требует исключительного расчета и распознавания шаблонов, чтобы найти выигрышную идею.",
      kz: "Күрделі позиция жеңімпаз идеяны табу үшін ерекше есептеуді және үлгіні тануды талап етеді."
    }
  }
];

export default puzzleData; 