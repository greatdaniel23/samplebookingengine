// Configuration file for the booking engine - PRODUCTION VERSION ONLY
// All calls are forced to production API; local/staging logic removed per deployment hardening request.

const CONFIG = {
    // API Configuration
    API: {
        // Production URL (only active endpoint)
        PRODUCTION_BASE_URL: 'https://bookingengine-8g1-boe-kxn.pages.dev/api',
        // Environment fixed to production
        ENVIRONMENT: 'production'
    },

    // Application Settings
    APP: {
        NAME: 'Villa Daisy Cantik - Booking System',
        VERSION: '1.0.0',
        DEBUG: false // Set to false in production for security
    },

    // Villa Information
    VILLA: {
        NAME: 'Villa Daisy Cantik',
        LOCATION: 'Ubud, Bali, Indonesia',
        EMAIL: 'info@rumahdaisycantik.com',
        PHONE: '+62 361 234 5678',
        WEBSITE: 'https://booking.rumahdaisycantik.com'
    },

    // Database Configuration (for reference only)
    DATABASE: {
        LOCAL: {
            HOST: 'localhost',
            NAME: 'villa_booking',
            USER: 'root',
            PASSWORD: ''
        },
        PRODUCTION: {
            HOST: 'localhost',
            NAME: 'u987654321_booking',
            USER: 'u987654321_user',
            PASSWORD: '[CONFIGURED_ON_SERVER]'
        }
    },

    // Admin Settings
    ADMIN: {
        DEFAULT_USERNAME: 'villa_manager',
        SESSION_TIMEOUT: 60, // minutes - longer for production
        MAX_LOGIN_ATTEMPTS: 3
    },

    // Business Settings for Admin Dashboard
    BUSINESS: {
        NAME: 'Villa Daisy Cantik',
        EMAIL: 'info@rumahdaisycantik.com',
        PHONE: '+62 361 234 5678',
        ADDRESS: 'Jl. Ubud Raya',
        CITY: 'Ubud',
        STATE: 'Bali',
        COUNTRY: 'Indonesia',
        WEBSITE: 'https://booking.rumahdaisycantik.com',
        DESCRIPTION: 'Experience luxury and tranquility at Villa Daisy Cantik, nestled in the heart of Ubud, Bali.',
        CHECK_IN_TIME: '14:00',
        CHECK_OUT_TIME: '12:00',
        CURRENCY: 'IDR',
        TAX_RATE: '10',
        CANCELLATION_POLICY: '24',
        SOCIAL_MEDIA: {
            facebook: 'https://facebook.com/villadaisycantik',
            instagram: 'https://instagram.com/villadaisycantik',
            whatsapp: 'https://wa.me/6236123456789'
        }
    }
};

// Function to get the current API base URL based on environment
function getApiBaseUrl() {
    // Always return production base URL (no environment switching)
    return CONFIG.API.PRODUCTION_BASE_URL;
}

// Function to get full API endpoint URL
function getApiUrl(endpoint) {
    const baseUrl = getApiBaseUrl();
    // Remove leading slash from endpoint if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${baseUrl}/${cleanEndpoint}`;
}

// Function to get business configuration
function getBusinessConfig() {
    return CONFIG.BUSINESS;
}

// Function to log configuration info (for debugging)
function logConfig() {
    // Debug disabled in production; function retained for compatibility but does nothing.
    return;
}

// Initialize configuration on load
// Removed DOMContentLoaded logging (production hardening)

// Export configuration for use in other files
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = { CONFIG, getApiBaseUrl, getApiUrl, getBusinessConfig, logConfig };
} else {
    // Browser environment - make available globally
    window.CONFIG = CONFIG;
    window.getApiBaseUrl = getApiBaseUrl;
    window.getApiUrl = getApiUrl;
    window.getBusinessConfig = getBusinessConfig;
    window.logConfig = logConfig;
}