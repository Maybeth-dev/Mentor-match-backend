 const express = require('express');
const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());

// Simple route
app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});