# Chess.AI - Advanced Chess Learning Platform

![Chess.AI Logo](frontend/src/logo.svg)

## Overview

Chess.AI is a modern, interactive chess platform that combines artificial intelligence with a rich learning environment. The application offers various features for both beginners and advanced players, including AI-powered gameplay, puzzles, and an extensive learning system.

## Features

### 🎮 Game Play
- Multiple AI difficulty levels (Easy, Medium, Hard, Impossible)
- Customizable time controls (3, 5, 8 minutes)
- Real-time game analysis
- Move history tracking
- Piece position evaluation
- Advanced AI algorithms with minimax and alpha-beta pruning

### 🧩 Puzzles
- Curated chess puzzles for skill improvement
- Various tactical themes
- Progressive difficulty levels
- Interactive puzzle solving interface
- Immediate feedback system

### 📊 Game Analysis
- Comprehensive game history
- Performance statistics
- Win rate tracking
- Detailed move analysis
- Game replay functionality

### 🌐 User Features
- User authentication system
- Personalized profiles
- Progress tracking
- Multi-language support
- Responsive design for all devices

## Technical Stack

### Frontend
- React.js
- React Router for navigation
- react-chessboard for chess UI
- chess.js for game logic
- i18next for internationalization
- React Icons for UI elements
- Custom CSS with responsive design

### Backend
- Node.js
- Express.js
- RESTful API architecture
- User authentication system
- Game state management
- AI move calculation

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd Chess.AI
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

4. Start the backend server:
```bash
npm start
```

5. Start the frontend development server:
```bash
cd ../frontend
npm start
```

The application will be available at `http://localhost:3000`

## AI Implementation

The chess AI uses several advanced techniques:
- Minimax algorithm with alpha-beta pruning
- Position evaluation based on piece values and positions
- Multiple difficulty levels with varying search depths
- Dynamic move ordering for optimization
- Position evaluation matrices for all pieces

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Chess.js library for chess logic
- React-Chessboard for the chess interface
- All contributors and testers

## Contact

For any queries or support, please use the contact form in the application or reach out through the GitHub repository. 