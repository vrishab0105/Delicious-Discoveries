const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static files - updated to be more explicit
app.use(express.static(__dirname));

// Explicitly serve files from the photos directory
app.use('/photos', express.static(path.join(__dirname, 'photos')));

// Explicitly serve files from the dishes directory
app.use('/dishes', express.static(path.join(__dirname, 'dishes')));

// API endpoint to serve Firebase config
app.get('/api/config', (req, res) => {
  try {
    console.log('API config endpoint accessed');
    // Check if environment variables are set
    const requiredEnvVars = [
      'FIREBASE_API_KEY',
      'FIREBASE_AUTH_DOMAIN',
      'FIREBASE_PROJECT_ID',
      'FIREBASE_STORAGE_BUCKET',
      'FIREBASE_MESSAGING_SENDER_ID',
      'FIREBASE_APP_ID',
      'FIREBASE_DATABASE_URL'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error(`Missing environment variables: ${missingVars.join(', ')}`);
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'Missing required environment variables'
      });
    }
    
    const firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      databaseURL: process.env.FIREBASE_DATABASE_URL
    };
    
    console.log('Firebase config successfully generated');
    
    // Set CORS headers for API endpoint
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    res.json({ firebaseConfig });
  } catch (error) {
    console.error('Error serving config:', error);
    res.status(500).json({ error: 'Failed to retrieve configuration' });
  }
});

// API endpoint to serve OpenAI API key
app.get('/api/openai-key', (req, res) => {
  try {
    console.log('OpenAI API key endpoint accessed');
    
    if (!process.env.OPENAI_API_KEY) {
      console.error('Missing OPENAI_API_KEY environment variable');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'Missing OpenAI API key configuration'
      });
    }
    
    // Set CORS headers for API endpoint
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    res.json({ apiKey: process.env.OPENAI_API_KEY });
  } catch (error) {
    console.error('Error serving OpenAI API key:', error);
    res.status(500).json({ error: 'Failed to retrieve OpenAI API key' });
  }
});

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'about.html'));
}
);
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
}
);
app.get('/ai-recipe', (req, res) => {
  res.sendFile(path.join(__dirname, 'ai-recipe.html'));
}
);

// Add routes for additional HTML files
app.get('/country-search', (req, res) => {
  res.sendFile(path.join(__dirname, 'country-search.html'));
});

app.get('/ingredients', (req, res) => {
  res.sendFile(path.join(__dirname, 'ingredients.html'));
});

app.get('/recipe-detail', (req, res) => {
  res.sendFile(path.join(__dirname, 'recipe-detail.html'));
});

app.get('/recipe-list', (req, res) => {
  res.sendFile(path.join(__dirname, 'recipe-list.html'));
});

app.get('/reverse-image-search', (req, res) => {
  res.sendFile(path.join(__dirname, 'reverse-image-search.html'));
});

// Add a specific route to handle image requests
app.get('/photos/:filename', (req, res) => {
  const filename = req.params.filename;
  res.sendFile(path.join(__dirname, 'photos', filename));
});

// Add a specific route to handle dishes file requests
app.get('/dishes/:filename', (req, res) => {
  const filename = req.params.filename;
  res.sendFile(path.join(__dirname, 'dishes', filename));
});

// Catch-all route to handle SPA routing and direct requests to CSS/JS files
app.get('*', (req, res) => {
  // Check if the request is for a CSS or JS file
  if (req.path.endsWith('.css') || req.path.endsWith('.js')) {
    res.sendFile(path.join(__dirname, req.path));
  } else if (req.path.startsWith('/photos/') && (req.path.endsWith('.gif') || req.path.endsWith('.png') || req.path.endsWith('.jpg') || req.path.endsWith('.jpeg'))) {
    // Handle image files specifically
    res.sendFile(path.join(__dirname, req.path));
  } else if (req.path.startsWith('/dishes/') && (req.path.endsWith('.gif') || req.path.endsWith('.png') || req.path.endsWith('.jpg') || req.path.endsWith('.jpeg'))) {
    // Handle dish image files specifically
    res.sendFile(path.join(__dirname, req.path));
  } else {
    res.sendFile(path.join(__dirname, 'homepage.html'));
  }
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
