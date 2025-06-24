require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'chess_ai_db',
});

// Database initialization function
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Check if tables exist
    const tableCheckQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'lessons', 'games', 'messages');
    `;
    const { rows } = await client.query(tableCheckQuery);
    
    if (rows.length < 4) {
      console.log('Creating database tables...');
      
      // Users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(100) NOT NULL,
          is_admin BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Lessons table
      await client.query(`
        CREATE TABLE IF NOT EXISTS lessons (
          id SERIAL PRIMARY KEY,
          title VARCHAR(100) NOT NULL,
          video_url VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Games table
      await client.query(`
        CREATE TABLE IF NOT EXISTS games (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          piece_color VARCHAR(10) NOT NULL,
          difficulty VARCHAR(20) NOT NULL,
          time_control INTEGER NOT NULL,
          result VARCHAR(10) NOT NULL,
          moves TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Messages table
      await client.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Check if admin exists
      const adminCheck = await client.query('SELECT id FROM users WHERE username = $1', ['admin']);
      
      if (adminCheck.rows.length === 0) {
        // Create admin user
        const hashedPassword = await bcrypt.hash('Admin123!', 10);
        await client.query(`
          INSERT INTO users (username, email, password, is_admin) 
          VALUES ('admin', 'admin@chessai.com', $1, TRUE);
        `, [hashedPassword]);
        
        console.log('✅ Admin user created');
      }
      
      console.log('✅ Database successfully initialized.');
    } else {
      console.log('ℹ️ Database already initialized, skipping auto-fill.');
    }
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    client.release();
  }
}

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  
  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate password
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters with one uppercase letter, one number, and one special character'
      });
    }
    
    // Check if user exists
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );
    
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }
    
    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, is_admin',
      [username, email, hashedPassword]
    );
    
    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (user.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.rows[0].id, is_admin: user.rows[0].is_admin },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.rows[0].id,
        username: user.rows[0].username,
        email: user.rows[0].email,
        is_admin: user.rows[0].is_admin
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Contact form route
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    await pool.query(
      'INSERT INTO messages (name, email, message) VALUES ($1, $2, $3)',
      [name, email, message]
    );
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Lessons routes
app.get('/api/lessons', async (req, res) => {
  try {
    const lessons = await pool.query('SELECT * FROM lessons ORDER BY created_at DESC');
    res.json(lessons.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/lessons', authenticateToken, async (req, res) => {
  try {
    const { title, video_url } = req.body;
    
    // Check if user is admin
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    
    // Validate YouTube URL
    const youtubeRegex = /^(https:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+$|^(https:\/\/)?youtu\.be\/[\w-]+$/;
    if (!youtubeRegex.test(video_url)) {
      return res.status(400).json({ message: 'Invalid YouTube URL format' });
    }
    
    const newLesson = await pool.query(
      'INSERT INTO lessons (title, video_url) VALUES ($1, $2) RETURNING *',
      [title, video_url]
    );
    
    res.status(201).json(newLesson.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE lesson endpoint
app.delete('/api/lessons/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is admin
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    
    // Check if lesson exists
    const lessonCheck = await pool.query('SELECT * FROM lessons WHERE id = $1', [id]);
    if (lessonCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    // Delete the lesson
    await pool.query('DELETE FROM lessons WHERE id = $1', [id]);
    
    res.json({ message: 'Lesson deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Game history routes
app.post('/api/games', authenticateToken, async (req, res) => {
  try {
    const { piece_color, difficulty, time_control, result, moves } = req.body;
    const user_id = req.user.id;
    
    const newGame = await pool.query(
      'INSERT INTO games (user_id, piece_color, difficulty, time_control, result, moves) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [user_id, piece_color, difficulty, time_control, result, moves]
    );
    
    res.status(201).json(newGame.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/games/history', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    
    const games = await pool.query(
      'SELECT * FROM games WHERE user_id = $1 ORDER BY created_at DESC',
      [user_id]
    );
    
    res.json(games.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Keep the old endpoint for backward compatibility
app.get('/api/games', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    
    const games = await pool.query(
      'SELECT * FROM games WHERE user_id = $1 ORDER BY created_at DESC',
      [user_id]
    );
    
    res.json(games.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// User profile routes
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await pool.query(
      'SELECT id, username, email, is_admin FROM users WHERE id = $1',
      [userId]
    );
    
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/profile/username', authenticateToken, async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user.id;
    
    // Check if username already exists
    const usernameExists = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND id != $2',
      [username, userId]
    );
    
    if (usernameExists.rows.length > 0) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    
    await pool.query(
      'UPDATE users SET username = $1 WHERE id = $2',
      [username, userId]
    );
    
    res.json({ message: 'Username updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/profile/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    // Validate new password
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters with one uppercase letter, one number, and one special character'
      });
    }
    
    // Get current user data
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    
    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.rows[0].password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, userId]
    );
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    
    const users = await pool.query(
      'SELECT id, username, email, is_admin, created_at FROM users ORDER BY created_at DESC'
    );
    
    res.json(users.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/users/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    
    const { id } = req.params;
    const { is_admin } = req.body;
    
    await pool.query(
      'UPDATE users SET is_admin = $1 WHERE id = $2',
      [is_admin, id]
    );
    
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/admin/users/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account from admin panel' });
    }
    
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    
    // Get total users count
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users');
    
    // Get top 5 active players
    const topPlayers = await pool.query(`
      SELECT u.username, COUNT(g.id) as game_count 
      FROM users u
      JOIN games g ON u.id = g.user_id
      GROUP BY u.username
      ORDER BY game_count DESC
      LIMIT 5
    `);
    
    res.json({
      totalUsers: totalUsers.rows[0].count,
      topPlayers: topPlayers.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start the server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeDatabase();
}); 