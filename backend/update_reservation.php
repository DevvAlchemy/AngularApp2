<?php
// Simple update reservation
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(array("message" => "Method not allowed"));
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (!$data->id) {
    http_response_code(400);
    echo json_encode(array("message" => "ID required"));
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
    
    $query = "UPDATE reservations SET 
              customer_name = ?, customer_email = ?, customer_phone = ?,
              reservation_date = ?, reservation_time = ?, party_size = ?,
              special_requests = ?, status = ?
              WHERE id = ?";
    
    $stmt = $pdo->prepare($query);
    $result = $stmt->execute([
        $data->customer_name,
        $data->customer_email,
        $data->customer_phone ?? '',
        $data->reservation_date,
        $data->reservation_time,
        $data->party_size,
        $data->special_requests ?? '',
        $data->status ?? 'pending',
        $data->id
    ]);
    
    if ($result) {
        echo json_encode(array("message" => "Reservation updated successfully"));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Failed to update"));
    }
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database error"));
}
?>