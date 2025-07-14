import express from 'express';
const app = express();

// CORS middleware - add this BEFORE other middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

app.use(express.json());

app.post('/api/analyze-pose', (req, res) => {
  console.log('Received pose data:', req.body);
  res.json({ feedback: "Good posture!" });
});

app.listen(3001, () => {
  console.log('Backend running on port 3001');
});