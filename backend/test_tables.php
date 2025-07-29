<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

include_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if users table exists
    $query = "SHOW TABLES LIKE 'users'";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $users_table = $stmt->fetch();
    
    // Check if user_sessions table exists
    $query = "SHOW TABLES LIKE 'user_sessions'";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $sessions_table = $stmt->fetch();
    
    echo json_encode([
        "users_table_exists" => !empty($users_table),
        "sessions_table_exists" => !empty($sessions_table),
        "message" => "Table check completed"
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "error" => $e->getMessage()
    ]);
}
?>