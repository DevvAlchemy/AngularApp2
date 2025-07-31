<?php
/**
 * COMPLETELY FIXED Authentication API
 * Simplified lockout logic to prevent cascading issues
 */

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// CORS headers
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection
include_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

// SIMPLIFIED LOCKOUT CONSTANTS - Change these as needed
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 2;  // 🔧 TIMER SETTING: Change to 15 for production

// Get the action from the request
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch($action) {
    case 'login':
        handleLogin($db);
        break;
    case 'signup':
        handleSignup($db);
        break;
    case 'logout':
        handleLogout($db);
        break;
    case 'verify':
        handleVerifySession($db);
        break;
    case 'lockout-status':
        handleLockoutStatus($db);
        break;
    default:
        http_response_code(400);
        echo json_encode(array("message" => "Invalid action"));
        break;
}

/**
 * SIMPLIFIED lockout check - single query approach
 */
function checkAccountLockout($db, $identifier) {
    try {
        // Clean up expired lockouts first and delete failed attempts if expired
$cleanup = "SELECT identifier FROM account_lockouts 
            WHERE locked_until <= NOW() AND is_active = 1";
$stmt = $db->prepare($cleanup);
$stmt->execute();
$expiredIdentifiers = $stmt->fetchAll(PDO::FETCH_COLUMN);

if (!empty($expiredIdentifiers)) {
    // Deactivate the expired lockouts
    $deactivate = "UPDATE account_lockouts 
                   SET is_active = 0, unlocked_at = NOW(), unlocked_by = 'auto'
                   WHERE locked_until <= NOW() AND is_active = 1";
    $db->prepare($deactivate)->execute();

    // Delete failed attempts for those identifiers
    $inClause = implode(',', array_fill(0, count($expiredIdentifiers), '?'));
    $deleteAttempts = "DELETE FROM failed_login_attempts 
                       WHERE identifier IN ($inClause)";
    $db->prepare($deleteAttempts)->execute($expiredIdentifiers);
}

        
        // Check for active lockout - ONLY get the most recent active one
        $query = "SELECT 
                    locked_until,
                    failed_attempts_count,
                    TIMESTAMPDIFF(SECOND, NOW(), locked_until) as seconds_remaining
                  FROM account_lockouts 
                  WHERE identifier = ? 
                  AND is_active = 1 
                  AND locked_until > NOW()
                  ORDER BY locked_at DESC 
                  LIMIT 1";
        
        $stmt = $db->prepare($query);
        $stmt->execute([$identifier]);
        $lockout = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($lockout && $lockout['seconds_remaining'] > 0) {
            return [
                'is_locked' => true,
                'seconds_remaining' => max(0, (int)$lockout['seconds_remaining']),
                'failed_attempts' => (int)$lockout['failed_attempts_count'],
                'locked_until' => $lockout['locked_until']
            ];
        }
        
        // If no active lockout, count recent failed attempts
        $attemptQuery = "SELECT COUNT(*) as count 
                        FROM failed_login_attempts 
                        WHERE identifier = ? 
                        AND attempt_time >= DATE_SUB(NOW(), INTERVAL 30 MINUTE)";
        $stmt = $db->prepare($attemptQuery);
        $stmt->execute([$identifier]);
        $attempts = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return [
            'is_locked' => false,
            'seconds_remaining' => 0,
            'failed_attempts' => (int)$attempts['count'],
            'attempts_remaining' => MAX_FAILED_ATTEMPTS - (int)$attempts['count']
        ];
        
    } catch (PDOException $e) {
        error_log("Lockout check error: " . $e->getMessage());
        return [
            'is_locked' => false,
            'seconds_remaining' => 0,
            'failed_attempts' => 0,
            'attempts_remaining' => MAX_FAILED_ATTEMPTS
        ];
    }
}

/**
 * SIMPLIFIED failed attempt recording
 */
function recordFailedAttempt($db, $identifier) {
    try {
        // First check if already locked
        $lockStatus = checkAccountLockout($db, $identifier);
        if ($lockStatus['is_locked']) {
            return $lockStatus; // Don't record if already locked
        }
        
        // Record the failed attempt
        $insertQuery = "INSERT INTO failed_login_attempts (identifier, ip_address, user_agent) 
                       VALUES (?, ?, ?)";
        $stmt = $db->prepare($insertQuery);
        $stmt->execute([
            $identifier, 
            $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        ]);
        
        // Count total recent attempts
        $countQuery = "SELECT COUNT(*) as count 
                      FROM failed_login_attempts 
                      WHERE identifier = ? 
                      AND attempt_time >= DATE_SUB(NOW(), INTERVAL 30 MINUTE)";
        $stmt = $db->prepare($countQuery);
        $stmt->execute([$identifier]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $totalAttempts = (int)$result['count'];
        
        // Check if we need to lock
        if ($totalAttempts >= MAX_FAILED_ATTEMPTS) {
            return createLockout($db, $identifier, $totalAttempts);
        }
        
        return [
            'is_locked' => false,
            'seconds_remaining' => 0,
            'failed_attempts' => $totalAttempts,
            'attempts_remaining' => MAX_FAILED_ATTEMPTS - $totalAttempts
        ];
        
    } catch (PDOException $e) {
        error_log("Failed attempt recording error: " . $e->getMessage());
        return [
            'is_locked' => false,
            'seconds_remaining' => 0,
            'failed_attempts' => 0,
            'attempts_remaining' => MAX_FAILED_ATTEMPTS
        ];
    }
// Optional: Limit number of tracked attempts
    $cleanupOld = "DELETE FROM failed_login_attempts 
               WHERE identifier = ? 
               AND attempt_time < DATE_SUB(NOW(), INTERVAL 30 MINUTE)";
    $db->prepare($cleanupOld)->execute([$identifier]);
}

/**
 * SIMPLIFIED lockout creation - deactivate ALL previous lockouts first
 */
function createLockout($db, $identifier, $attempts) {
    try {
        // CRITICAL: Deactivate ALL existing lockouts for this identifier first
        $deactivateQuery = "UPDATE account_lockouts 
                           SET is_active = 0, unlocked_at = NOW(), unlocked_by = 'replaced'
                           WHERE identifier = ? AND is_active = 1";
        $stmt = $db->prepare($deactivateQuery);
        $stmt->execute([$identifier]);
        
        // Create new lockout
        $lockoutMinutes = LOCKOUT_DURATION_MINUTES;
        $lockedUntil = date('Y-m-d H:i:s', strtotime("+{$lockoutMinutes} minutes"));
        
        $lockQuery = "INSERT INTO account_lockouts 
                     (identifier, locked_until, failed_attempts_count, ip_address) 
                     VALUES (?, ?, ?, ?)";
        $stmt = $db->prepare($lockQuery);
        $stmt->execute([
            $identifier, 
            $lockedUntil, 
            $attempts, 
            $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ]);
        
        $secondsRemaining = $lockoutMinutes * 60;
        
        error_log("LOCKOUT CREATED: {$identifier} locked for {$secondsRemaining} seconds until {$lockedUntil}");
        
        return [
            'is_locked' => true,
            'seconds_remaining' => $secondsRemaining,
            'failed_attempts' => $attempts,
            'locked_until' => $lockedUntil,
            'lockout_duration_minutes' => $lockoutMinutes
        ];
        
    } catch (PDOException $e) {
        error_log("Lockout creation error: " . $e->getMessage());
        return [
            'is_locked' => false,
            'seconds_remaining' => 0,
            'failed_attempts' => $attempts,
            'attempts_remaining' => 0
        ];
    }
}

/**
 * Clear all lockout data for successful login
 */
function clearLockoutData($db, $identifier) {
    try {
        // Deactivate all lockouts
        $unlockQuery = "UPDATE account_lockouts 
                       SET is_active = 0, unlocked_at = NOW(), unlocked_by = 'success'
                       WHERE identifier = ? AND is_active = 1";
        $stmt = $db->prepare($unlockQuery);
        $stmt->execute([$identifier]);
        
        // Remove recent failed attempts
        $clearQuery = "DELETE FROM failed_login_attempts 
                      WHERE identifier = ? 
                      AND attempt_time >= DATE_SUB(NOW(), INTERVAL 30 MINUTE)";
        $stmt = $db->prepare($clearQuery);
        $stmt->execute([$identifier]);
        
        error_log("LOCKOUT CLEARED: All data cleared for {$identifier} after successful login");
        
    } catch (PDOException $e) {
        error_log("Clear lockout error: " . $e->getMessage());
    }
}

/**
 * Enhanced login handler with SIMPLIFIED lockout logic
 */
function handleLogin($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        return;
    }

    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->username) || empty($data->password)) {
        http_response_code(400);
        echo json_encode(array("message" => "Username and password are required"));
        return;
    }

    try {
        // Check lockout status FIRST
        $lockoutStatus = checkAccountLockout($db, $data->username);
        
        if ($lockoutStatus['is_locked']) {
            error_log("LOGIN BLOCKED: {$data->username} is locked for {$lockoutStatus['seconds_remaining']} seconds");
            http_response_code(423); // 423 Locked
            echo json_encode(array(
                "message" => "Account is temporarily locked due to too many failed login attempts",
                "lockout_info" => $lockoutStatus
            ));
            return;
        }

        // Try to authenticate
        $query = "SELECT id, username, email, password_hash, first_name, last_name, role, is_active 
                  FROM users 
                  WHERE (username = ? OR email = ?) AND is_active = 1";
        
        $stmt = $db->prepare($query);
        $stmt->execute([$data->username, $data->username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($data->password, $user['password_hash'])) {
            // SUCCESS: Clear all lockout data
            clearLockoutData($db, $data->username);
            
            // Generate session token
            $session_token = bin2hex(random_bytes(32));
            $expires_at = date('Y-m-d H:i:s', strtotime('+24 hours'));

            // Store session
            $session_query = "INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES (?, ?, ?)";
            $session_stmt = $db->prepare($session_query);
            $session_stmt->execute([$user['id'], $session_token, $expires_at]);

            // Update last login
            $update_query = "UPDATE users SET last_login = NOW() WHERE id = ?";
            $update_stmt = $db->prepare($update_query);
            $update_stmt->execute([$user['id']]);

            error_log("LOGIN SUCCESS: {$data->username}");

            // Return success response
            http_response_code(200);
            echo json_encode(array(
                "message" => "Login successful",
                "user" => array(
                    "id" => (int)$user['id'],
                    "username" => $user['username'],
                    "email" => $user['email'],
                    "first_name" => $user['first_name'],
                    "last_name" => $user['last_name'],
                    "role" => $user['role']
                ),
                "token" => $session_token,
                "expires_at" => $expires_at
            ));
        } else {
            // FAILED LOGIN: Record attempt
            error_log("LOGIN FAILED: {$data->username} - invalid credentials");
            $lockoutStatus = recordFailedAttempt($db, $data->username);
            
            if ($lockoutStatus['is_locked']) {
                // Just got locked
                http_response_code(423); // 423 Locked
                echo json_encode(array(
                    "message" => "Too many failed login attempts. Account has been temporarily locked.",
                    "lockout_info" => $lockoutStatus
                ));
            } else {
                // Show attempts remaining
                http_response_code(401);
                echo json_encode(array(
                    "message" => "Invalid credentials",
                    "lockout_info" => $lockoutStatus
                ));
            }
        }
    } catch (PDOException $e) {
        error_log("Login error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(array("message" => "Database error occurred"));
    }
}

/**
 * Handle lockout status check
 */
function handleLockoutStatus($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        return;
    }

    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->identifier)) {
        http_response_code(400);
        echo json_encode(array("message" => "Identifier (username or email) is required"));
        return;
    }

    try {
        $lockoutStatus = checkAccountLockout($db, $data->identifier);
        
        http_response_code(200);
        echo json_encode(array(
            "message" => "Lockout status retrieved",
            "lockout_info" => $lockoutStatus
        ));
        
    } catch (Exception $e) {
        error_log("Lockout status error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(array("message" => "Error checking lockout status"));
    }
}

/**
 * Handle user signup (unchanged)
 */
function handleSignup($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        return;
    }

    $data = json_decode(file_get_contents("php://input"));

    // Validate required fields
    if (empty($data->username) || empty($data->email) || empty($data->password) || 
        empty($data->first_name) || empty($data->last_name)) {
        http_response_code(400);
        echo json_encode(array("message" => "All fields are required"));
        return;
    }

    // Validate email format
    if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(array("message" => "Invalid email format"));
        return;
    }

    // Validate password strength
    if (strlen($data->password) < 6) {
        http_response_code(400);
        echo json_encode(array("message" => "Password must be at least 6 characters"));
        return;
    }

    try {
        // Check if username or email already exists
        $check_query = "SELECT id FROM users WHERE username = ? OR email = ?";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([$data->username, $data->email]);
        
        if ($check_stmt->fetch()) {
            http_response_code(409);
            echo json_encode(array("message" => "Username or email already exists"));
            return;
        }

        // Hash password
        $password_hash = password_hash($data->password, PASSWORD_DEFAULT);

        // Insert new user
        $insert_query = "INSERT INTO users (username, email, password_hash, first_name, last_name, role) 
                         VALUES (?, ?, ?, ?, ?, ?)";
        $insert_stmt = $db->prepare($insert_query);
        $role = isset($data->role) && in_array($data->role, ['admin', 'manager', 'staff']) ? $data->role : 'staff';
        
        $result = $insert_stmt->execute([
            $data->username,
            $data->email,
            $password_hash,
            $data->first_name,
            $data->last_name,
            $role
        ]);

        if ($result) {
            $user_id = $db->lastInsertId();
            
            http_response_code(201);
            echo json_encode(array(
                "message" => "User registered successfully",
                "user_id" => (int)$user_id,
                "success" => true
            ));
        } else {
            http_response_code(500);
            echo json_encode(array("message" => "Failed to register user"));
        }

    } catch (PDOException $e) {
        error_log("Signup database error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(array("message" => "Database error occurred"));
    }
}

/**
 * Handle user logout (unchanged)
 */
function handleLogout($db) {
    $headers = getallheaders();
    $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;

    if (!$token) {
        http_response_code(400);
        echo json_encode(array("message" => "Token required"));
        return;
    }

    try {
        // Delete session
        $query = "DELETE FROM user_sessions WHERE session_token = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$token]);

        http_response_code(200);
        echo json_encode(array("message" => "Logged out successfully"));
    } catch (PDOException $e) {
        error_log("Logout error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(array("message" => "Database error"));
    }
}

/**
 * Handle session verification (unchanged)
 */
function handleVerifySession($db) {
    $headers = getallheaders();
    $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;

    if (!$token) {
        http_response_code(401);
        echo json_encode(array("valid" => false, "message" => "Token required"));
        return;
    }

    try {
        // Check if session is valid
        $query = "SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.role
                  FROM users u
                  JOIN user_sessions s ON u.id = s.user_id
                  WHERE s.session_token = ? AND s.expires_at > NOW() AND u.is_active = 1";
        
        $stmt = $db->prepare($query);
        $stmt->execute([$token]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            http_response_code(200);
            echo json_encode(array(
                "valid" => true,
                "user" => array(
                    "id" => (int)$user['id'],
                    "username" => $user['username'],
                    "email" => $user['email'],
                    "first_name" => $user['first_name'],
                    "last_name" => $user['last_name'],
                    "role" => $user['role']
                )
            ));
        } else {
            http_response_code(401);
            echo json_encode(array(
                "valid" => false,
                "message" => "Invalid or expired session"
            ));
        }
    } catch (PDOException $e) {
        error_log("Session verification error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(array("valid" => false, "message" => "Database error"));
    }
}
?>