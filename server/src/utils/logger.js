/**
 * Smart logging utility that detects if requests come from the results processor
 * and adjusts log levels accordingly, respecting LOG_LEVEL environment variable
 */

const RESULTS_PROCESSOR_USER_AGENT = 'ResultsProcessor/1.0.0';

// Get log level from environment, default to INFO
const LOG_LEVEL = (process.env.LOG_LEVEL || 'INFO').toUpperCase();

// Log level hierarchy: ERROR > WARN > INFO > DEBUG
const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1, 
    INFO: 2,
    DEBUG: 3
};

const CURRENT_LOG_LEVEL = LOG_LEVELS[LOG_LEVEL] || LOG_LEVELS.INFO;

/**
 * Checks if the request comes from the results processor
 * @param {Object} req - Express request object
 * @returns {boolean} - True if request is from results processor
 */
function isResultsProcessorRequest(req) {
    const userAgent = req.get('User-Agent') || '';
    return userAgent.includes(RESULTS_PROCESSOR_USER_AGENT);
}

/**
 * Checks if a log level should be output based on current LOG_LEVEL setting
 * @param {string} level - Log level to check
 * @returns {boolean} - True if should log
 */
function shouldLog(level) {
    return LOG_LEVELS[level] <= CURRENT_LOG_LEVEL;
}

/**
 * Smart info logger - uses debug level for results processor, info level for users
 * Respects LOG_LEVEL environment variable
 * @param {Object} req - Express request object
 * @param {string} message - Log message
 */
function logInfo(req, message) {
    if (isResultsProcessorRequest(req)) {
        // Results processor requests use DEBUG level
        if (shouldLog('DEBUG')) {
            console.debug(`[DEBUG] ${message}`);
        }
    } else {
        // User requests use INFO level
        if (shouldLog('INFO')) {
            console.info(message);
        }
    }
}

/**
 * Smart error logger - uses debug level for results processor, error level for users
 * Respects LOG_LEVEL environment variable
 * @param {Object} req - Express request object
 * @param {string} message - Log message
 * @param {Error} [error] - Optional error object
 */
function logError(req, message, error = null) {
    if (isResultsProcessorRequest(req)) {
        // Results processor requests use DEBUG level
        if (shouldLog('DEBUG')) {
            console.debug(`[DEBUG] ${message}`, error ? error.message : '');
            if (error && error.stack) {
                console.debug(`[DEBUG] Stack trace:`, error.stack);
            }
        }
    } else {
        // User requests use ERROR level
        if (shouldLog('ERROR')) {
            console.error(message, error ? error.message : '');
            if (error && error.stack) {
                console.error(`Stack trace:`, error.stack);
            }
        }
    }
}

/**
 * Always log to console.info regardless of source (for critical messages)
 * Respects LOG_LEVEL environment variable
 * @param {string} message - Log message
 */
function logAlways(message) {
    if (shouldLog('INFO')) {
        console.info(message);
    }
}

/**
 * Debug logger that respects LOG_LEVEL environment variable
 * @param {string} message - Log message
 */
function logDebug(message) {
    if (shouldLog('DEBUG')) {
        console.debug(`[DEBUG] ${message}`);
    }
}

export {
    logInfo,
    logError,
    logAlways,
    logDebug,
    isResultsProcessorRequest,
    RESULTS_PROCESSOR_USER_AGENT
};
