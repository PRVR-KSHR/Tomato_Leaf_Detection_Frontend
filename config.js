// Configuration file - Update this with your backend API URL
// For local development: http://localhost:5000
// For production: https://your-backend-url.onrender.com (or similar)

const CONFIG = {
    API_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:5000'
        : 'https://your-backend-url.onrender.com' // Replace with your actual backend URL
};

// Export for use in script.js
window.CONFIG = CONFIG;
