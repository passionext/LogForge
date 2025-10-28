// -------------------- Libraries --------------------
// Axios is a popular Javascript library for making HTTP requests.
import axios from "axios";



// -------------------- Configuration --------------------
// Defines the URL where the logs will be sent.
const API_URL = "http://localhost:3000/logs";
// Defines the service names that will appear in the log as <source>.
const SOURCE_NAME = "payment-service";
// Defines the probability distribution for the different log levels.
const logWeights = {
  debug: 80,   // 80%
  info: 15,    // 15%
  warn: 4,     // 4%
  error: 1     // 1%
};



// Weighted random selection function
function weightedRandom(weightObj) {
  // Calculates the total weight by summing all values in the weight object. The reduce() iterates through all weight
  // and accumulates the sum that starts from 0. In this case, the sum will be 100 by default, unless the weight
  // parameters are changed.
  const totalWeight = Object.values(weightObj).reduce((sum, weight) => sum + weight, 0);
  // Generates a random number between 0 and totalWeight. Math.random() gives values between 0-1.
  const r = Math.random() * totalWeight;
  let cumulative = 0;

  for (const [item, weight] of Object.entries(weightObj)) {
    // Iteration 1 (debug): cumulative = 0 + 80 = 80
    // Iteration 2 (info):  cumulative = 80 + 15 = 95
    // Iteration 3 (warn):  cumulative = 95 + 4 = 99
    // Iteration 4 (error): cumulative = 99 + 1 = 100
    cumulative += weight;
    // Checks if random number is in current item's range.
    // Range for debug: 0 to 60
    // Range for info: 60 to 75
    // Range for warn: 75 to 79
    // Range for error: 79 to 80
    if (r < cumulative) return item;
  }
  // Fallback in case of no match.
  return Object.keys(weightObj)[0];
}



// This function maps log levels to specific event types for categorization
function mapEvent(level) {
  // Define a mapping object that categorizes events by log level
  const eventMap = {
    // Error level events represent critical system failures
    error: ["PAYMENT_FAILURE", "SYSTEM_ERROR", "SECURITY_VIOLATION", "DATABASE_ERROR"],
    // Warn level events represent potential issues that need attention
    warn: ["PERFORMANCE_ALERT", "CAPACITY_WARNING", "DEPRECATION_WARNING"],
    // Info level events represent normal system operations and successes
    info: ["PAYMENT_SUCCESS", "SUBSCRIPTION_CREATED", "USER_ACTION", "SYSTEM_HEALTH"],
    // Debug level events represent detailed internal operations for troubleshooting
    debug: ["INTERNAL_OPERATION", "VALIDATION_STEP", "CACHE_OPERATION", "DATABASE_QUERY"]
  };

  // Return a randomly selected event from the appropriate level category
  return pick(eventMap[level]);
}

// -------------------- Expanded Message templates --------------------
// Object containing predefined message templates organized by log level
const logTemplates = {
  // Debug messages: Detailed technical operations for developers
  debug: [
    "Validating transaction request payload",
    "Fetching exchange rates from cache",
    "Checking user session token",
    "Preparing SQL statement for transaction insert",
    // ... (30+ detailed technical operation messages)
  ],

  // Info messages: Business-level events and successful operations
  info: [
    "Payment of $%AMOUNT% completed successfully for user %USER%",
    "Refund of $%AMOUNT% processed for order #%ORDER%",
    "Payment gateway responded in %TIME%ms",
    // ... (20+ business operation success messages)
  ],

  // Warn messages: Non-critical issues that require monitoring
  warn: [
    "Transaction delay detected: %TIME%ms latency",
    "Gateway returned HTTP 429 (rate limit)",
    "Payment queue length at %PERCENT%% capacity",
    // ... (20+ warning and performance alert messages)
  ],

  // Error messages: Critical failures that need immediate attention
  error: [
    "Transaction failed for %USER% — card declined",
    "Database error: duplicate transaction ID",
    "Critical: lost connection to payment gateway",
    // ... (20+ error and failure messages)
  ]
};

// -------------------- Sample data for placeholder replacement --------------------

// Array of sample usernames for populating %USER% placeholders
const users = [
  "alice", "bob", "charlie", "diana", "eve", "frank", "grace", "henry",
  "ivy", "jack", "karen", "leo", "mia", "nathan", "olivia", "paul",
  // ... (30 total sample usernames)
];

// Array of sample error types for populating %ERROR% placeholders
const errorSamples = [
  "ECONNRESET", "ETIMEOUT", "EACCESS", "UnknownError", "SQLIntegrityConstraintViolation",
  "SSLHandshakeException", "OutOfMemoryError", "NullPointerException", "StackOverflowError",
  // ... (20 total sample error types)
];

// Array of sample payment amounts for populating %AMOUNT% placeholders
const amounts = [5, 10, 25, 50, 100, 200, 500, 1000, 1500, 2000, 5000];

// Array of sample order IDs for populating %ORDER% placeholders
const orders = () => `ORD${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

// -------------------- Helper functions --------------------

// Picks a random element from an array
// @param {Array} arr - The array to pick from
// @returns {*} A random element from the array
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Generates a random integer between min and max (inclusive)
// @param {number} min - The minimum value (inclusive)
// @param {number} max - The maximum value (inclusive)
// @returns {number} A random integer between min and max
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// -------------------- Create a realistic log --------------------

// Main function that generates a complete, realistic log entry
// @returns {Object} A comprehensive log object with structured data
function createRealisticLog() {
  // Step 1: Select a log level using weighted random distribution
  // This ensures realistic distribution of log levels (more info, fewer errors)
  const level = weightedRandom(logWeights);

  // Step 2: Select a random message template for the chosen level
  let message = pick(logTemplates[level]);

  // Step 3: Replace all placeholder tokens in the message with realistic data
  message = message
    .replace("%USER%", pick(users))          // Replace with random username
    .replace("%AMOUNT%", pick(amounts))      // Replace with random amount
    .replace("%TIME%", randomInt(50, 5000))  // Replace with random time in ms
    .replace("%PERCENT%", randomInt(50, 100)) // Replace with random percentage
    .replace("%ERROR%", pick(errorSamples))   // Replace with random error type
    .replace("%ORDER%", orders())// Replace with random order ID
    .replace("%RETRY%", randomInt(1, 5));     // Replace with random retry count
  // Step 4: Generate timestamps
  const timestamp = new Date().toISOString(); // Current time in ISO format
  // Generate event time as 0-5 seconds in the past for realism
  const eventTime = new Date(Date.now() - randomInt(0, 5000)).toISOString();

  // Step 5: Construct and return the complete log object with all contextual data
  return {
    // Basic log metadata - core identification and classification
    source: SOURCE_NAME,    // Source application/service name
    level,                  // Log level (debug, info, warn, error)
    message,                // The processed message with real data
    event: mapEvent(level), // Categorized event type
    timestamp,              // When the log was generated

    // Application context - information about the running application
    app: {
      name: "payment-service",                    // Service name
      version: "2.3.1",                          // Application version
      environment: "n/a",                        // Deployment environment
      commit_hash: `abc${Math.random().toString(36).substring(2, 7)}`, // Fake git commit
      instance_id: `instance-${randomInt(1, 10)}` // Which instance generated this
    },

    // Transaction context - financial transaction specific data
    transaction: {
      id: `txn_${Math.random().toString(36).substring(2, 9)}`, // Unique transaction ID
      type: pick(["payment", "refund", "subscription", "verification"]), // Transaction type
      amount: level === 'info' || level === 'error' ? pick(amounts) : undefined, // Amount only for relevant levels
      currency: pick(["USD", "EUR", "GBP", "CAD", "AUD"]), // Currency code
      status: mapStatus(level),                  // Derived from log level
      initiated_at: eventTime,                   // When transaction started
      completed_at: level === 'info' ? timestamp : undefined // Completion time for successful transactions
    },

    // User context - information about the user initiating the action
    user: {
      id: pick(users),                          // User identifier
      session_id: `sess_${Math.random().toString(36).substring(2, 12)}`, // Session ID
      ip_address: `${randomInt(192, 203)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}`, // Fake IP
      user_agent: pick([                        // Browser/device information
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15"
      ])
    },

    // Payment method details - how the payment was made
    payment_method: {
      type: pick(["credit_card", "debit_card", "paypal", "bank_transfer", "wallet"]), // Payment type
      last_four: level !== 'debug' ? randomInt(1000, 9999).toString() : undefined, // Last 4 digits (masked)
      brand: pick(["visa", "mastercard", "amex", "discover"]), // Card brand
      expiry_month: level !== 'debug' ? randomInt(1, 12) : undefined, // Expiration month
      expiry_year: level !== 'debug' ? randomInt(2024, 2030) : undefined // Expiration year
    },

    // Performance metrics - system performance data
    metrics: {
      duration_ms: randomInt(10, 3000),         // Total operation duration
      database_query_time: randomInt(5, 500),   // Time spent on database queries
      external_api_time: randomInt(50, 2000),   // Time spent on external API calls
      memory_usage_mb: randomInt(100, 512),     // Memory usage in megabytes
      cpu_percent: randomInt(5, 95)             // CPU utilization percentage
    },

    // Error details - only included for error level logs
    error: level === 'error' ? {                // Conditional error object
      code: pick(errorSamples),                 // Error code/type
      message: message,                         // Error description
      stack_trace: `Error: ${message}\n    at processPayment (payment.js:${randomInt(100, 200)}:${randomInt(10, 50)})\n    at Module.execute (module.js:${randomInt(50, 150)}:${randomInt(10, 30)})`, // Fake stack trace
      fatal: Math.random() > 0.8                // 20% chance of being fatal
    } : undefined,                              // No error object for non-error logs

    // HTTP request context - web API specific information
    http: {
      method: pick(["POST", "GET", "PUT", "DELETE"]), // HTTP method
      path: pick(["/api/payments", "/api/refunds", "/api/subscriptions", "/api/webhook"]), // API endpoint
      status_code: mapStatusCode(level),        // HTTP status code based on level
      request_id: `req_${Math.random().toString(36).substring(2, 12)}`, // Unique request ID
      user_agent: pick([                        // Client user agent
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Stripe/v1 NodeBindings/10.0.0",
        "axios/1.4.0"
      ])
    },

    // Geographic context - location information
    geo: {
      country: pick(["US", "GB", "CA", "AU", "DE", "FR", "JP"]), // Country code
      city: pick(["New York", "London", "Toronto", "Sydney", "Berlin", "Paris", "Tokyo"]), // City name
      timezone: pick(["America/New_York", "Europe/London", "Australia/Sydney", "Asia/Tokyo"]) // Timezone
    },

    // Business context - merchant and commercial information
    business: {
      merchant_id: `merch_${randomInt(10000, 99999)}`, // Merchant identifier
      store_id: pick(["store-001", "store-002", "store-003"]), // Store identifier
      terminal_id: level === 'debug' ? `term-${randomInt(1, 50)}` : undefined, // Terminal ID for debug
      order_id: pick(orders),                   // Order reference
      invoice_number: `INV-${randomInt(100000, 999999)}` // Invoice number
    },

    // Additional metadata - correlation and feature information
    metadata: {
      correlation_id: `corr_${Math.random().toString(36).substring(2, 16)}`, // Request correlation ID
      feature_flags: {                          // Feature toggle states
        new_ui: Math.random() > 0.5,           // 50% chance enabled
        fast_checkout: Math.random() > 0.3,    // 70% chance enabled
        advanced_fraud: Math.random() > 0.7    // 30% chance enabled
      },
      tags: [level, mapEvent(level).toLowerCase(), "payment-service"] // Searchable tags
    }
  };
}

// Helper function to map log level to appropriate HTTP status code
// @param {string} level - The log level (debug, info, warn, error)
// @returns {number} Corresponding HTTP status code
function mapStatusCode(level) {
  const statusMap = {
    debug: 200,  // Success for debug/info levels
    info: 200,   // Success
    warn: 429,   // Too Many Requests (rate limiting)
    error: 500   // Internal Server Error
  };
  return statusMap[level];
}

// Helper function to map log level to transaction status
// @param {string} level - The log level (debug, info, warn, error)
// @returns {string} Corresponding transaction status
function mapStatus(level) {
  const statusMap = {
    debug: "processing",  // Debug logs during processing
    info: "completed",    // Info logs for completed operations
    warn: "pending",      // Warn logs for pending/resolving issues
    error: "failed"       // Error logs for failed operations
  };
  return statusMap[level];
}

// -------------------- Log sending loop --------------------

// Set up a repeating interval to send logs every 2 seconds (2000ms)
setInterval(async () => {
  // Generate a new realistic log entry
  const log = createRealisticLog();

  try {
    // Attempt to send the log to the specified API endpoint
    await axios.post(API_URL, log);
    // Log success to console for monitoring
    console.log(`[${SOURCE_NAME}] Sent ${log.level} log:`, log.message);
  } catch (err) {
    // Log any errors that occur during transmission
    console.error(`[${SOURCE_NAME}] Failed to send log:`, err.message);
  }
}, 1000); // Note: The comment says 2 seconds but code uses 1000ms (1 second)

// Startup confirmation messages
console.log(`[${SOURCE_NAME}] Log generator started with weights:`, logWeights);
console.log(`[${SOURCE_NAME}] Sending logs to: ${API_URL}`);
