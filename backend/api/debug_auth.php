<?php
/**
 * Debug test for authentication endpoint
 * UPDATED: Fixed database config path
 */

// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

echo "<h1>🔍 Authentication Debug Test - FIXED VERSION</h1>";

// Test 1: Check if database config file exists
echo "<h3>1. Database Config File Test</h3>";
$config_path = 'config/database.php';  // FIXED: Changed from '../config/database.php'
if (file_exists($config_path)) {
    echo "✅ <strong>SUCCESS:</strong> Database config file exists<br>";
    try {
        include_once $config_path;
        echo "✅ <strong>SUCCESS:</strong> Database config file loaded<br>";
    } catch (Exception $e) {
        echo "❌ <strong>ERROR:</strong> Failed to load config: " . $e->getMessage() . "<br>";
    }
} else {
    echo "❌ <strong>ERROR:</strong> Database config file not found at: " . realpath('.') . '/' . $config_path . "<br>";
    echo "Current directory: " . getcwd() . "<br>";
    echo "Looking for: " . $config_path . "<br>";
}

// Test 2: Check database connection
echo "<h3>2. Database Connection Test</h3>";
try {
    $database = new Database();
    $db = $database->getConnection();
    if ($db) {
        echo "✅ <strong>SUCCESS:</strong> Database connected<br>";
    } else {
        echo "❌ <strong>ERROR:</strong> Database connection failed<br>";
    }
} catch (Exception $e) {
    echo "❌ <strong>ERROR:</strong> " . $e->getMessage() . "<br>";
}

// Test 3: Check if users table exists
echo "<h3>3. Users Table Test</h3>";
try {
    $query = "SHOW TABLES LIKE 'users'";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch();
    
    if ($result) {
        echo "✅ <strong>SUCCESS:</strong> Users table exists<br>";
        
        // Check table structure
        $query = "DESCRIBE users";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "<strong>Table structure:</strong><br>";
        foreach($columns as $column) {
            echo "- " . $column['Field'] . " (" . $column['Type'] . ")<br>";
        }
    } else {
        echo "❌ <strong>ERROR:</strong> Users table does not exist<br>";
        echo "<strong>TO FIX:</strong> Run this SQL in phpMyAdmin:<br>";
        echo "<pre>";
        echo "CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);";
        echo "</pre>";
    }
} catch (Exception $e) {
    echo "❌ <strong>ERROR:</strong> " . $e->getMessage() . "<br>";
}

// Test 4: Check if user_sessions table exists
echo "<h3>4. User Sessions Table Test</h3>";
try {
    $query = "SHOW TABLES LIKE 'user_sessions'";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch();
    
    if ($result) {
        echo "✅ <strong>SUCCESS:</strong> User_sessions table exists<br>";
    } else {
        echo "❌ <strong>ERROR:</strong> User_sessions table does not exist<br>";
        echo "<strong>TO FIX:</strong> Run this SQL in phpMyAdmin:<br>";
        echo "<pre>";
        echo "CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);";
        echo "</pre>";
    }
} catch (Exception $e) {
    echo "❌ <strong>ERROR:</strong> " . $e->getMessage() . "<br>";
}

// Test 5: Test signup functionality  
echo "<h3>5. Signup Function Test</h3>";
$test_user = [
    'username' => 'debugtest',
    'email' => 'debug@test.com',
    'password' => 'test123',
    'first_name' => 'Debug',
    'last_name' => 'Test',
    'role' => 'staff'
];

try {
    // Check if user already exists (cleanup)
    $check_query = "SELECT id FROM users WHERE username = ? OR email = ?";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->execute([$test_user['username'], $test_user['email']]);
    
    if ($check_stmt->fetch()) {
        // Delete existing test user
        $delete_query = "DELETE FROM users WHERE username = ? OR email = ?";
        $delete_stmt = $db->prepare($delete_query);
        $delete_stmt->execute([$test_user['username'], $test_user['email']]);
        echo "🧹 Cleaned up existing test user<br>";
    }
    
    // Try to create user
    $password_hash = password_hash($test_user['password'], PASSWORD_DEFAULT);
    $insert_query = "INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)";
    $insert_stmt = $db->prepare($insert_query);
    
    $result = $insert_stmt->execute([
        $test_user['username'],
        $test_user['email'],
        $password_hash,
        $test_user['first_name'],
        $test_user['last_name'],
        $test_user['role']
    ]);
    
    if ($result) {
        echo "✅ <strong>SUCCESS:</strong> Test user created successfully<br>";
        echo "User ID: " . $db->lastInsertId() . "<br>";
        
        // Clean up
        $delete_query = "DELETE FROM users WHERE username = ?";
        $delete_stmt = $db->prepare($delete_query);
        $delete_stmt->execute([$test_user['username']]);
        echo "🧹 Test user cleaned up<br>";
    } else {
        echo "❌ <strong>ERROR:</strong> Failed to create test user<br>";
    }
    
} catch (Exception $e) {
    echo "❌ <strong>ERROR:</strong> " . $e->getMessage() . "<br>";
}

echo "<h3>📋 Summary</h3>";
echo "✅ <strong>GOOD NEWS:</strong> The database path issue should now be fixed!<br>";
echo "If the users tables don't exist, run the SQL commands shown above in phpMyAdmin.<br>";
echo "<strong>Next step:</strong> Try your signup and login from Angular now!<br>";
?>