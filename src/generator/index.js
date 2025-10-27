// -------------------- Libraries --------------------
// Library used for make HTTP requests.
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


// Enhanced event mapping
function mapEvent(level) {
  const eventMap = {
    error: ["PAYMENT_FAILURE", "SYSTEM_ERROR", "SECURITY_VIOLATION", "DATABASE_ERROR"],
    warn: ["PERFORMANCE_ALERT", "CAPACITY_WARNING", "DEPRECATION_WARNING"],
    info: ["PAYMENT_SUCCESS", "SUBSCRIPTION_CREATED", "USER_ACTION", "SYSTEM_HEALTH"],
    debug: ["INTERNAL_OPERATION", "VALIDATION_STEP", "CACHE_OPERATION", "DATABASE_QUERY"]
  };

  return pick(eventMap[level]);
}
// -------------------- Expanded Message templates --------------------
const logTemplates = {
  debug: [
    "Validating transaction request payload",
    "Fetching exchange rates from cache",
    "Checking user session token",
    "Preparing SQL statement for transaction insert",
    "Starting fraud detection analysis",
    "Encrypting sensitive payment data",
    "Validating webhook signature",
    "Processing payment method details",
    "Creating audit trail entry",
    "Calculating transaction fees",
    "Verifying merchant account status",
    "Loading payment gateway configuration",
    "Initializing PCI compliance checks",
    "Parsing customer billing address",
    "Generating unique transaction ID",
    "Checking currency conversion rates",
    "Validating CVV code format",
    "Creating payment intent object",
    "Setting up database connection pool",
    "Caching user payment preferences",
    "Compressing log data for storage",
    "Verifying API rate limits",
    "Loading risk assessment rules",
    "Initializing 3D Secure flow",
    "Processing refund eligibility check",
    "Validating webhook payload structure",
    "Creating payment confirmation email template",
    "Checking duplicate transaction prevention",
    "Loading country-specific tax rules",
    "Processing subscription billing cycle"
  ],
  info: [
    "Payment of $%AMOUNT% completed successfully for user %USER%",
    "Refund of $%AMOUNT% processed for order #%ORDER%",
    "Payment gateway responded in %TIME%ms",
    "New subscription created for %USER%",
    "Webhook sent to /api/payment/status",
    "User %USER% updated payment method",
    "Monthly subscription billing completed for %USER%",
    "Payment method verified successfully for %USER%",
    "Batch payment processing completed",
    "Currency conversion applied for international payment",
    "Payment dispute resolved in favor of merchant",
    "Recurring payment authorized for %USER%",
    "Payment gateway health check passed",
    "Daily transaction summary generated",
    "User %USER% completed KYC verification",
    "Payment reconciliation completed successfully",
    "New merchant account activated",
    "Payment webhook received and validated",
    "Subscription plan upgraded for %USER%",
    "Payment method tokenized successfully"
  ],
  warn: [
    "Transaction delay detected: %TIME%ms latency",
    "Gateway returned HTTP 429 (rate limit)",
    "Payment queue length at %PERCENT%% capacity",
    "Retrying payment after temporary network error",
    "High response time detected in /api/pay",
    "Payment gateway timeout after %TIME%ms",
    "SSL certificate expiring in 30 days",
    "Database connection pool 80% utilized",
    "Cache miss rate increased to 15%",
    "Third-party API response time above threshold",
    "Payment retry attempt #%RETRY% for transaction",
    "Memory usage at 85% of allocated limit",
    "CDN response time degradation detected",
    "Webhook delivery delayed by %TIME%ms",
    "Payment method update required for %USER%",
    "Suspicious login attempt detected from new location",
    "Currency conversion rate stale by 5 minutes",
    "Backup process running longer than expected",
    "SSL handshake taking %TIME%ms to complete",
    "Database index fragmentation at 25%"
  ],
  error: [
    "Transaction failed for %USER% — card declined",
    "Database error: duplicate transaction ID",
    "Critical: lost connection to payment gateway",
    "Payment signature verification failed for user %USER%",
    "Unhandled exception: %ERROR%",
    "Payment gateway authentication failed",
    "Database connection timeout after 30 seconds",
    "SSL certificate validation failed",
    "Webhook signature mismatch for incoming payment",
    "Fraud detection blocked suspicious transaction",
    "Payment processor API key expired",
    "Critical security violation detected",
    "Database deadlock in transactions table",
    "Payment data encryption failed",
    "Third-party service unavailable - payment processing halted",
    "Memory leak detected in payment processing module",
    "Critical file system error - cannot write audit logs",
    "Network partition detected - cannot reach primary database",
    "Payment reconciliation job failed with exception",
    "Security token service unavailable"
  ]
};

// Expanded sample data for placeholders
const users = [
  "alice", "bob", "charlie", "diana", "eve", "frank", "grace", "henry",
  "ivy", "jack", "karen", "leo", "mia", "nathan", "olivia", "paul",
  "quincy", "rachel", "sam", "tina", "umar", "violet", "will", "xena",
  "yara", "zack", "amit", "bella", "carlos", "derek"
];

const errorSamples = [
  "ECONNRESET", "ETIMEOUT", "EACCESS", "UnknownError", "SQLIntegrityConstraintViolation",
  "SSLHandshakeException", "OutOfMemoryError", "NullPointerException", "StackOverflowError",
  "DatabaseConnectionException", "AuthenticationException", "AuthorizationException",
  "PaymentGatewayTimeout", "InvalidSignature", "FraudDetectionError", "EncryptionError",
  "WebhookDeliveryFailed", "RateLimitExceeded", "ServiceUnavailable", "ConfigurationError"
];

const amounts = [5, 10, 25, 50, 100, 200, 500, 1000, 1500, 2000, 5000];
const orders = ["ORD001", "ORD002", "ORD003", "ORD004", "ORD005", "ORD006", "ORD007", "ORD008"];

// -------------------- Helper functions --------------------
// Picks a random element from an array.
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
// Generates a random integer between min and max (inclusive).
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// -------------------- Create a realistic log --------------------
// -------------------- Create a realistic log --------------------
function createRealisticLog() {
  const level = weightedRandom(logWeights);
  let message = pick(logTemplates[level]);

  // Replace placeholders with realistic data
  message = message
    .replace("%USER%", pick(users))
    .replace("%AMOUNT%", pick(amounts))
    .replace("%TIME%", randomInt(50, 5000))
    .replace("%PERCENT%", randomInt(50, 100))
    .replace("%ERROR%", pick(errorSamples))
    .replace("%ORDER%", pick(orders))
    .replace("%RETRY%", randomInt(1, 5));

  // Generate realistic timestamps with slight variations
  const timestamp = new Date().toISOString();
  const eventTime = new Date(Date.now() - randomInt(0, 5000)).toISOString();

  return {
    // Basic log metadata
    source: SOURCE_NAME,
    level,
    message,
    event: mapEvent(level, message),
    timestamp,

    // Application context
    app: {
      name: "payment-service",
      version: "2.3.1",
      environment: "n/a",
      commit_hash: `abc${Math.random().toString(36).substring(2, 7)}`,
      instance_id: `instance-${randomInt(1, 10)}`
    },

    // Transaction context
    transaction: {
      id: `txn_${Math.random().toString(36).substring(2, 9)}`,
      type: pick(["payment", "refund", "subscription", "verification"]),
      amount: level === 'info' || level === 'error' ? pick(amounts) : undefined,
      currency: pick(["USD", "EUR", "GBP", "CAD", "AUD"]),
      status: mapStatus(level),
      initiated_at: eventTime,
      completed_at: level === 'info' ? timestamp : undefined
    },

    // User context
    user: {
      id: pick(users),
      session_id: `sess_${Math.random().toString(36).substring(2, 12)}`,
      ip_address: `${randomInt(192, 203)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}`,
      user_agent: pick([
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15"
      ])
    },

    // Payment method details
    payment_method: {
      type: pick(["credit_card", "debit_card", "paypal", "bank_transfer", "wallet"]),
      last_four: level !== 'debug' ? randomInt(1000, 9999).toString() : undefined,
      brand: pick(["visa", "mastercard", "amex", "discover"]),
      expiry_month: level !== 'debug' ? randomInt(1, 12) : undefined,
      expiry_year: level !== 'debug' ? randomInt(2024, 2030) : undefined
    },

    // Performance metrics
    metrics: {
      duration_ms: randomInt(10, 3000),
      database_query_time: randomInt(5, 500),
      external_api_time: randomInt(50, 2000),
      memory_usage_mb: randomInt(100, 512),
      cpu_percent: randomInt(5, 95)
    },

    // Error details (only for error logs)
    error: level === 'error' ? {
      code: pick(errorSamples),
      message: message,
      stack_trace: `Error: ${message}\n    at processPayment (payment.js:${randomInt(100, 200)}:${randomInt(10, 50)})\n    at Module.execute (module.js:${randomInt(50, 150)}:${randomInt(10, 30)})`,
      fatal: Math.random() > 0.8
    } : undefined,

    // HTTP request context (for API-related logs)
    http: {
      method: pick(["POST", "GET", "PUT", "DELETE"]),
      path: pick(["/api/payments", "/api/refunds", "/api/subscriptions", "/api/webhook"]),
      status_code: mapStatusCode(level),
      request_id: `req_${Math.random().toString(36).substring(2, 12)}`,
      user_agent: pick([
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Stripe/v1 NodeBindings/10.0.0",
        "axios/1.4.0"
      ])
    },

    // Geographic context
    geo: {
      country: pick(["US", "GB", "CA", "AU", "DE", "FR", "JP"]),
      city: pick(["New York", "London", "Toronto", "Sydney", "Berlin", "Paris", "Tokyo"]),
      timezone: pick(["America/New_York", "Europe/London", "Australia/Sydney", "Asia/Tokyo"])
    },

    // Business context
    business: {
      merchant_id: `merch_${randomInt(10000, 99999)}`,
      store_id: pick(["store-001", "store-002", "store-003"]),
      terminal_id: level === 'debug' ? `term-${randomInt(1, 50)}` : undefined,
      order_id: pick(orders),
      invoice_number: `INV-${randomInt(100000, 999999)}`
    },

    // Additional metadata
    metadata: {
      correlation_id: `corr_${Math.random().toString(36).substring(2, 16)}`,
      feature_flags: {
        new_ui: Math.random() > 0.5,
        fast_checkout: Math.random() > 0.3,
        advanced_fraud: Math.random() > 0.7
      },
      tags: [level, mapEvent(level, message).toLowerCase(), "payment-service"]
    }
  };
}

// Helper function to map log level to HTTP status code
function mapStatusCode(level) {
  const statusMap = {
    debug: 200,
    info: 200,
    warn: 429,
    error: 500
  };
  return statusMap[level];
}

// Helper function to map log level to transaction status
function mapStatus(level) {
  const statusMap = {
    debug: "processing",
    info: "completed",
    warn: "pending",
    error: "failed"
  };
  return statusMap[level];
}



// -------------------- Send logs every 2 seconds --------------------
setInterval(async () => {
  const log = createRealisticLog();
  try {
    await axios.post(API_URL, log);
    console.log(`[${SOURCE_NAME}] Sent ${log.level} log:`, log.message);
  } catch (err) {
    console.error(`[${SOURCE_NAME}] Failed to send log:`, err.message);
  }
}, 1000);

console.log(`[${SOURCE_NAME}] Log generator started with weights:`, logWeights);
console.log(`[${SOURCE_NAME}] Sending logs to: ${API_URL}`);

