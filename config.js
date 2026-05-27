// Configuration file - Update this with your backend API URL
// For local development: http://localhost:5000
// For production: https://your-backend-url.onrender.com (or similar)

const CONFIG = {
    API_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:5000'
        : 'https://tomato-disease-api.onrender.com'  // ← Replace with your actual Render URL if different
};

// Export for use in script.js
window.CONFIG = CONFIG;
