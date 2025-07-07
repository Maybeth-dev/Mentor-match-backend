const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(cors());
app.use(express.json());

// Simple test routes
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is working!' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route working!' });
});

// Simple auth test routes
app.post('/api/auth/test', (req, res) => {
  res.json({ message: 'Auth test route working!', body: req.body });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📡 Test: http://localhost:${PORT}/api/health`);
});