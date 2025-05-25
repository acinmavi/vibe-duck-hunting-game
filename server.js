// Simple Express server to serve the game files
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from DuckHuntingGame directory
app.use(express.static(path.join(__dirname, 'DuckHuntingGame')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'DuckHuntingGame', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Duck Hunt Game running at http://localhost:${PORT}`);
});

