<?php
/**
 * Simple reservation creation endpoint
 * Just handles POST requests to create new reservations
 */

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only handle POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(array("message" => "Method not allowed"));
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
    echo json_encode(array("message" => "Database connection failed: " . $e->getMessage()));
    exit();
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if (empty($data->customer_name) || empty($data->customer_email) || 
    empty($data->reservation_date) || empty($data->reservation_time) || 
    empty($data->party_size)) {
    
    http_response_code(400);
    echo json_encode(array("message" => "Missing required fields"));
    exit();
}

// Insert reservation
try {
    $query = "INSERT INTO reservations 
              (customer_name, customer_email, customer_phone, reservation_date, 
               reservation_time, party_size, special_requests, status) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($query);
    $result = $stmt->execute([
        $data->customer_name,
        $data->customer_email,
        $data->customer_phone ?? '',
        $data->reservation_date,
        $data->reservation_time,
        $data->party_size,
        $data->special_requests ?? '',
        $data->status ?? 'pending'
    ]);
    
    if ($result) {
        http_response_code(201);
        echo json_encode(array(
            "message" => "Reservation created successfully",
            "id" => $pdo->lastInsertId()
        ));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Failed to create reservation"));
    }
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database error: " . $e->getMessage()));
}
?>