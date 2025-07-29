<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

include_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if ($db) {
        echo json_encode([
            "status" => "success", 
            "message" => "Database connected successfully"
        ]);
    } else {
        echo json_encode([
            "status" => "error", 
            "message" => "Database connection failed"
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        "status" => "error", 
        "message" => "Error: " . $e->getMessage()
    ]);
}
?>