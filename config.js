// Configuration file for the booking engine
// This file contains environment-specific settings

const CONFIG = {
    // API Configuration
    API: {
        // Local development URL (XAMPP)
        LOCAL_BASE_URL: 'http://localhost/fontend-bookingengine-100/frontend-booking-engine/frontend-booking-engine/api',
        
        // Production URL
        PRODUCTION_BASE_URL: 'https://api.rumahdaisycantik.com',
        
        // Staging URL (for testing)
        STAGING_BASE_URL: 'https://staging.rumahdaisycantik.com/api',
        
        // Current environment - change this based on deployment
        // Options: 'local', 'staging', 'production'
        ENVIRONMENT: 'production'
    },
    
    // Application Settings
    APP: {
        NAME: 'Villa Booking Engine',
        VERSION: '1.0.0',
        DEBUG: true // Set to false in production
    },
    
    // Database Configuration (for reference)
    DATABASE: {
        LOCAL: {
            HOST: 'localhost',
            NAME: 'villa_booking',
            USER: 'root',
            PASSWORD: ''
        },
        PRODUCTION: {
            HOST: 'localhost',
            NAME: 'u289291769_booking',
            USER: 'u289291769_booking',
            PASSWORD: 'Kanibal123!!!'
        }
    },
    
    // Admin Settings
    ADMIN: {
        DEFAULT_USERNAME: 'admin',
        DEFAULT_PASSWORD: 'admin123',
        SESSION_TIMEOUT: 30 // minutes
    }
};

// Function to get the current API base URL based on environment
function getApiBaseUrl() {
    switch (CONFIG.API.ENVIRONMENT.toLowerCase()) {
        case 'production':
            return CONFIG.API.PRODUCTION_BASE_URL;
        case 'staging':
            return CONFIG.API.STAGING_BASE_URL;
        case 'local':
        default:
            return CONFIG.API.LOCAL_BASE_URL;
    }
}

// Function to get full API endpoint URL
function getApiUrl(endpoint) {
    const baseUrl = getApiBaseUrl();
    // Remove leading slash from endpoint if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${baseUrl}/${cleanEndpoint}`;
}

// Function to log configuration info (for debugging)
function logConfig() {
    if (CONFIG.APP.DEBUG) {
        console.log('🔧 Configuration Info:');
        console.log('Environment:', CONFIG.API.ENVIRONMENT);
        console.log('API Base URL:', getApiBaseUrl());
        console.log('App Version:', CONFIG.APP.VERSION);
    }
}

// Export configuration for use in other files
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = { CONFIG, getApiBaseUrl, getApiUrl, logConfig };
} else {
    // Browser environment - make available globally
    window.CONFIG = CONFIG;
    window.getApiBaseUrl = getApiBaseUrl;
    window.getApiUrl = getApiUrl;
    window.logConfig = logConfig;
}