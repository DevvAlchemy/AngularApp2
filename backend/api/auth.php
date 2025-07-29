<?php
/**
 * Authentication API endpoint
 * Handles login, signup, logout, and session validation
 */

// Enable error reporting for debugging (disable in production)
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

// Database connection - FIXED PATH
include_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

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
    default:
        http_response_code(400);
        echo json_encode(array("message" => "Invalid action"));
        break;
}

/**
 * Handle user login
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
        // Find user by username or email
        $query = "SELECT id, username, email, password_hash, first_name, last_name, role, is_active 
                  FROM users 
                  WHERE (username = ? OR email = ?) AND is_active = 1";
        
        $stmt = $db->prepare($query);
        $stmt->execute([$data->username, $data->username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($data->password, $user['password_hash'])) {
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
            http_response_code(401);
            echo json_encode(array("message" => "Invalid credentials"));
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Database error: " . $e->getMessage()));
    }
}

/**
 * Handle user signup
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
        $role = isset($data->role) ? $data->role : 'staff';
        
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
                "user_id" => (int)$user_id
            ));
        } else {
            http_response_code(500);
            echo json_encode(array("message" => "Failed to register user"));
        }

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Database error: " . $e->getMessage()));
    }
}

/**
 * Handle user logout
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
        http_response_code(500);
        echo json_encode(array("message" => "Database error"));
    }
}

/**
 * Handle session verification
 */
function handleVerifySession($db) {
    $headers = getallheaders();
    $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;

    if (!$token) {
        http_response_code(401);
        echo json_encode(array("message" => "Token required"));
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
        http_response_code(500);
        echo json_encode(array("message" => "Database error"));
    }
}
?>