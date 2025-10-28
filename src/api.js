// api-server.js - Complete Log API Server with Log Generator
// ==================== LIBRARY IMPORTS ====================

// Import the Express.js framework - this is the main web server library
// Express makes it easy to create HTTP servers, handle routes, and manage middleware
import express from 'express';

// Import CORS (Cross-Origin Resource Sharing) middleware
// This allows web browsers to make requests to our API from different domains/ports
// Without CORS, browsers would block requests from different origins due to same-origin policy security
import cors from 'cors';

// Import Morgan HTTP request logger middleware
// Automatically logs all incoming HTTP requests with details like method, URL, status code, response time
// Helps with debugging and monitoring API usage patterns
import morgan from 'morgan';

// ==================== SERVER CONFIGURATION ====================

// Create an Express application instance - this is the core of our web server
// This object will handle all incoming HTTP requests, route them to appropriate handlers, and send responses
const app = express();

// Define the port number that our server will listen on for incoming connections
// process.env.API_PORT reads from environment variables (good for Docker/cloud deployment)
// If no environment variable is set, it defaults to port 3000 (common Node.js development port)
const PORT = process.env.API_PORT || 3000;

// ==================== MIDDLEWARE SETUP ====================

// Apply CORS middleware to ALL routes in our application
// This adds CORS headers to every response, allowing cross-origin requests from any domain
// In production, you might want to restrict this to specific domains for security
app.use(cors());

// Apply Morgan middleware with 'combined' format - a comprehensive logging format
// Logs: IP address - username [timestamp] "HTTP_METHOD URL HTTP_VERSION" STATUS_CODE RESPONSE_SIZE "REFERRER" "USER_AGENT"
// Example: "192.168.1.100 - - [15/Jan/2024:10:30:45 +0000] "POST /logs HTTP/1.1" 202 45 "https://example.com" "Mozilla/5.0..."
app.use(morgan('combined'));

// Apply Express JSON parsing middleware to ALL routes
// This automatically parses incoming JSON request bodies and makes them available as JavaScript objects in req.body
// limit: '10mb' prevents denial-of-service attacks by limiting maximum JSON payload size to 10 megabytes
app.use(express.json({ limit: '10mb' }));

// ==================== DATA STORAGE ====================

// Create an array to store all received logs in memory (RAM)
// In a production system, you would use a persistent database like MongoDB, PostgreSQL, or Redis
// Memory storage is simple and fast for testing/demo, but data is lost when server restarts
const receivedLogs = [];

// Create a statistics object to track metrics about received logs
// This helps monitor API health, usage patterns, and performance over time
let stats = {
  totalReceived: 0,  // Counter for total number of logs received since server startup
  byLevel: {         // Object that counts logs categorized by their severity level
    debug: 0,        // Counter for debug-level logs (detailed diagnostic information)
    info: 0,         // Counter for info-level logs (general operational information)
    warn: 0,         // Counter for warn-level logs (warning conditions that aren't errors)
    error: 0         // Counter for error-level logs (error conditions that need attention)
  },
  lastReceived: null // Timestamp of the most recently received log (initially null/undefined)
};


// ==================== API ENDPOINTS ====================

// Define POST endpoint for receiving logs at path '/logs'
// POST is the appropriate HTTP method for creating new resources (log entries)
app.post('/logs', (req, res) => {
  // Extract JSON data from request body - already parsed by express.json() middleware
  const log = req.body;

  // Create timestamp for when we received this log
  // ISO format ensures consistent, machine-readable timestamps across systems
  const timestamp = new Date().toISOString();

  // Validate that incoming log has required fields
  // Every meaningful log should have at minimum a level and message
  if (!log.level || !log.message) {
    // If validation fails, send 400 Bad Request response and stop execution
    return res.status(400).json({
      error: 'Missing required fields: level and message'
    });
  }

  // Create enhanced log object with receipt metadata
  const receivedLog = {
    ...log,                    // Spread operator copies all properties from original log
    received_at: timestamp,    // Add timestamp of when we received this log
    id: `rec_${Math.random().toString(36).substring(2, 9)}`  // Generate unique ID for reference
  };

  // Add new log to beginning of storage array (newest first)
  receivedLogs.unshift(receivedLog);

  // Limit array size to prevent memory issues - keep only most recent 1000 logs
  receivedLogs.splice(1000);

  // Update statistics counters
  stats.totalReceived++;  // Increment total received counter
  stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;  // Increment level-specific counter
  stats.lastReceived = timestamp;  // Update last received timestamp

  // Log to console for real-time monitoring (helps with debugging)
  console.log(`📨 Received ${log.level} log from ${log.source}: ${log.message}`);

  // Send success response - 202 Accepted means we received and will process the log
  res.status(202).json({
    status: 'accepted',    // Confirmation message
    id: receivedLog.id,    // Send back generated ID for client reference
    received_at: timestamp // Send back receipt timestamp
  });
});

// Define GET endpoint for retrieving logs with filtering and pagination
app.get('/logs', (req, res) => {
  // Extract query parameters from URL with default values
  // Example: /logs?level=error&source=payment-service&limit=20&offset=10
  const { level, source, limit = "50", offset = "0" } = req.query;

  // Start with all received logs
  let filteredLogs = receivedLogs;

  // Filter by level if specified in query parameters
  if (level) {
    filteredLogs = filteredLogs.filter(log => log.level === level);
  }

  // Filter by source if specified in query parameters
  if (source) {
    filteredLogs = filteredLogs.filter(log => log.source === source);
  }

  // Apply pagination to prevent sending huge responses
  const start = parseInt(offset);      // Convert offset string to integer
  const end = start + parseInt(limit); // Calculate end index
  const paginatedLogs = filteredLogs.slice(start, end); // Extract slice of array

  // Return paginated results with metadata
  res.json({
    logs: paginatedLogs,  // The actual log data for requested page
    pagination: {         // Metadata to help clients navigate through pages
      total: filteredLogs.length,     // Total number of logs after filtering
      limit: parseInt(limit),         // Number of logs per page
      offset: start,                  // Starting position for this page
      hasMore: end < filteredLogs.length  // Boolean indicating if more logs exist
    }
  });
});

// Define GET endpoint for statistics and analytics
app.get('/stats', (req, res) => {
  // Return comprehensive statistics about received logs
  res.json({
    ...stats,  // Spread operator copies all properties from stats object
    storage: {  // Add storage-specific information
      totalLogs: receivedLogs.length,  // Current number of stored logs
      // Calculate and format current memory usage
      memoryUsage: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`
    }
  });
});



// ==================== SERVER STARTUP ====================

// Start the HTTP server and make it listen for incoming requests on specified port
app.listen(PORT, () => {
  // This callback function executes once the server is successfully started
  console.log(`Log API Server running on port ${PORT}`);
  console.log(`Available Endpoints:`);
  console.log(`   POST /logs        - Receive log entries`);
  console.log(`   GET  /logs        - List stored logs (with filtering & pagination)`);
  console.log(`   GET  /stats       - Get statistics and analytics`);
  console.log(`Storage: In-memory (max 1000 logs)`);
});