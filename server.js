const express = require('express');
const cors = require('cors'); // CORS Module
const connectDB = require('./db'); // MongoDB connection setting
const User = require('./models/User'); // User data model
const authorize = require('./middleware/authorize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // JWT token

const app = express();
const PORT = 5000;

// MongoDB connect
connectDB();

// Middleware
app.use(express.json()); 
app.use(cors());

// Login API
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      console.log('Login attempt:', username, password);
  
      const user = await User.findOne({ username });
      if (!user) {
        console.log('User not found');
        return res.status(400).json({ message: 'Invalid username' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log('Password mismatch'); 
        return res.status(400).json({ message: 'Invalid password' });
      }
  
      const token = jwt.sign({ id: user._id, role: user.role }, 'secret_key', { expiresIn: '1h' });
      res.json({ token, role: user.role });
    } catch (err) {
      console.error('Server error:', err.message);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });
  

// Professor API
app.get('/professor-dashboard', authorize(['professor']), (req, res) => {
  res.json({ message: 'Welcome to the professor dashboard' });
});

// Student API
app.get('/student-dashboard', authorize(['student']), (req, res) => {
  res.json({ message: 'Welcome to the student dashboard' });
});

// General API
app.get('/general-dashboard', (req, res) => {
  res.json({ message: 'Welcome to the general dashboard, Guest!' });
});

// Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
