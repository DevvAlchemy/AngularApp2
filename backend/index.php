<?php
/*
* Routes API requests to appropriate endpoints
 */

// Enable error reporting for development (will disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set CORS headers
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the request URI and parse it
$request = $_SERVER['REQUEST_URI'];
$path = parse_url($request, PHP_URL_PATH);
$path = explode('/', $path);

// Simple routing system
$endpoint = $path[count($path) - 1] ?? '';

switch($endpoint) {
    case 'reservations':
        // Route to reservations endpoint
        include_once 'api/endpoints/reservations.php';
        break;
    
    case '':
    case 'index.php':
        // API information endpoint
        $api_info = array(
            "message" => "Reservation System API",
            "version" => "1.0",
            "endpoints" => array(
                "reservations" => array(
                    "GET" => "Get all reservations or specific reservation by ID",
                    "POST" => "Create new reservation"
                )
            ),
            "status" => "online"
        );
        
        http_response_code(200);
        echo json_encode($api_info);
        break;
    
    default:
        // Endpoint not found
        http_response_code(404);
        echo json_encode(array(
            "message" => "Endpoint not found",
            "available_endpoints" => array("reservations")
        ));
        break;
}
?>