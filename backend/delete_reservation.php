<?php
/**
 * Simple reservation deletion endpoint
 */

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only handle DELETE requests
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(array("message" => "Method not allowed"));
    exit();
}

// Get reservation ID
$id = isset($_GET['id']) ? $_GET['id'] : null;

if (!$id) {
    http_response_code(400);
    echo json_encode(array("message" => "Reservation ID is required"));
    exit();
}

// Database connection
$host = "localhost";
$db_name = "reservation_system";
$username = "root";
$password = "";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database connection failed"));
    exit();
}

// Delete reservation
try {
    $query = "DELETE FROM reservations WHERE id = ?";
    $stmt = $pdo->prepare($query);
    $result = $stmt->execute([$id]);
    
    if ($result && $stmt->rowCount() > 0) {
        http_response_code(200);
        echo json_encode(array("message" => "Reservation deleted successfully"));
    } else {
        http_response_code(404);
        echo json_encode(array("message" => "Reservation not found"));
    }
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Failed to delete reservation"));
}
?>