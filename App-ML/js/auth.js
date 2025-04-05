// auth.js - Handles MercadoLibre API authentication

// Configuration for MercadoLibre API
const ML_CONFIG = {
    // These values should be updated with your actual app credentials
    clientId: 'YOUR_CLIENT_ID',
    redirectUri: 'https://santttii.github.io/App-ML/',
    authUrl: 'https://auth.mercadolibre.com.ar/authorization',
    apiBaseUrl: 'https://api.mercadolibre.com',
    scopes: [
        'read', 
        'write', 
        'offline_access'
    ]
};

// Check if we are returning from the OAuth process
function checkAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
        // Remove code from URL to avoid reusing it
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Exchange code for access token
        exchangeCodeForToken(code);
        return true;
    }
    return false;
}

// Exchange authorization code for access token
async function exchangeCodeForToken(code) {
    try {
        // In a real application, you would need a backend server to securely exchange the code
        // For this example, we'll simulate a successful response
        
        // NOTE: For a real implementation, this should be done server-side to protect your client_secret
        // For testing, we'll simulate a successful token response
        const tokenResponse = {
            access_token: 'simulated_access_token',
            refresh_token: 'simulated_refresh_token',
            expires_in: 21600 // 6 hours in seconds
        };
        
        // Save tokens to localStorage
        saveTokens(tokenResponse);
        
        // Load user info and show dashboard
        loadUserInfo();
        showDashboard();
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        alert('Error al iniciar sesión. Por favor, intenta nuevamente.');
    }
}

// Save tokens to localStorage with expiration time
function saveTokens(tokenData) {
    const expiresAt = Date.now() + (tokenData.expires_in * 1000);
    
    const authData = {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: expiresAt
    };
    
    localStorage.setItem('ml_auth', JSON.stringify(authData));
}

// Get the stored authentication data
function getAuthData() {
    const authData = localStorage.getItem('ml_auth');
    if (!authData) return null;
    
    return JSON.parse(authData);
}

// Check if the user is authenticated
function isAuthenticated() {
    const authData = getAuthData();
    if (!authData) return false;
    
    // Check if token is expired
    if (Date.now() > authData.expiresAt) {
        // Token expired, try to refresh
        refreshToken();
        return false;
    }
    
    return true;
}

// Refresh the access token using the refresh token
async function refreshToken() {
    const authData = getAuthData();
    if (!authData || !authData.refreshToken) {
        logout();
        return;
    }
    
    try {
        // In a real application, you would need a backend server to securely refresh the token
        // For this example, we'll simulate a successful response
        
        const tokenResponse = {
            access_token: 'new_simulated_access_token',
            refresh_token: 'new_simulated_refresh_token', 
            expires_in: 21600 // 6 hours in seconds
        };
        
        saveTokens(tokenResponse);
        return true;
    } catch (error) {
        console.error('Error refreshing token:', error);
        logout();
        return false;
    }
}

// Get the access token for API calls
function getAccessToken() {
    if (!isAuthenticated()) {
        return null;
    }
    
    const authData = getAuthData();
    return authData.accessToken;
}

// Load user information from MercadoLibre
async function loadUserInfo() {
    const token = getAccessToken();
    if (!token) return;
    
    try {
        // In a real app, we would make an API call to MercadoLibre
        // For this example, we'll simulate a successful response
        
        const userInfo = {
            id: 123456789,
            nickname: 'TESTUSER',
            first_name: 'Test',
            last_name: 'User'
        };
        
        // Update UI with user information
        document.getElementById('username').textContent = userInfo.nickname;
        
        // Save user info to localStorage
        localStorage.setItem('ml_user', JSON.stringify(userInfo));
        
        return userInfo;
    } catch (error) {
        console.error('Error loading user info:', error);
        return null;
    }
}

// Start the OAuth process
function initiateLogin() {
    const scopes = ML_CONFIG.scopes.join(' ');
    const authUrl = `${ML_CONFIG.authUrl}?response_type=code&client_id=${ML_CONFIG.clientId}&redirect_uri=${encodeURIComponent(ML_CONFIG.redirectUri)}&scope=${encodeURIComponent(scopes)}`;
    
    window.location.href = authUrl;
}

// Logout function
function logout() {
    localStorage.removeItem('ml_auth');
    localStorage.removeItem('ml_user');
    showLoginPage();
}

// Show the dashboard UI
function showDashboard() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('user-info').classList.remove('hidden');
}

// Show the login page
function showLoginPage() {
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('user-info').classList.add('hidden');
}

// Initialize authentication handling
function initAuth() {
    // Set up login button event
    document.getElementById('login-btn').addEventListener('click', initiateLogin);
    
    // Set up logout button event
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // Check if returning from auth process
    const authCallbackFound = checkAuthCallback();
    
    // If already authenticated, load dashboard
    if (!authCallbackFound && isAuthenticated()) {
        loadUserInfo();
        showDashboard();
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', initAuth);