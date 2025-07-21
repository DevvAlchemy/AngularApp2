<?php
// Simple get single reservation
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$id = isset($_GET['id']) ? $_GET['id'] : null;

if (!$id) {
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
    
    $query = "SELECT * FROM reservations WHERE id = ?";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$id]);
    
    $reservation = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($reservation) {
        echo json_encode($reservation);
    } else {
        http_response_code(404);
        echo json_encode(array("message" => "Reservation not found"));
    }
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database error"));
}
?>