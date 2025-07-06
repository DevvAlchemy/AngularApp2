<?php
/*
 * Handles HTTP requests for reservation operations
 */

// Set headers to allow cross-origin requests (CORS) for Angular frontend
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and model files
include_once '../config/database.php';
include_once '../models/Reservation.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Initialize reservation object
$reservation = new Reservation($db);

// Get HTTP method
$method = $_SERVER['REQUEST_METHOD'];

/**
 * Handle different HTTP methods
 */
switch($method) {
    case 'GET':
        handleGetRequest($reservation);
        break;
    
    case 'POST':
        handlePostRequest($reservation);
        break;
    
    default:
        // Method not allowed
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed."));
        break;
}

/**
 * Handle GET requests - retrieve reservations
 * @param Reservation $reservation Reservation object
 */
function handleGetRequest($reservation) {
    // Check if specific ID is requested
    if(isset($_GET['id'])) {
        // Get single reservation
        $reservation_id = $_GET['id'];
        
        if($reservation->getReservationById($reservation_id)) {
            // Create array with reservation data
            $reservation_item = array(
                "id" => $reservation->id,
                "customer_name" => $reservation->customer_name,
                "customer_email" => $reservation->customer_email,
                "customer_phone" => $reservation->customer_phone,
                "reservation_date" => $reservation->reservation_date,
                "reservation_time" => $reservation->reservation_time,
                "party_size" => $reservation->party_size,
                "special_requests" => $reservation->special_requests,
                "status" => $reservation->status,
                "created_at" => $reservation->created_at,
                "updated_at" => $reservation->updated_at
            );
            
            // Set response code and output JSON
            http_response_code(200);
            echo json_encode($reservation_item);
        } else {
            // Reservation not found
            http_response_code(404);
            echo json_encode(array("message" => "Reservation not found."));
        }
    } else {
        // Get all reservations
        $stmt = $reservation->getAllReservations();
        $num = $stmt->rowCount();
        
        if($num > 0) {
            // Create array to hold reservations
            $reservations_arr = array();
            $reservations_arr["records"] = array();
            
            // Retrieve table contents and create array
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                extract($row);
                
                $reservation_item = array(
                    "id" => $id,
                    "customer_name" => $customer_name,
                    "customer_email" => $customer_email,
                    "customer_phone" => $customer_phone,
                    "reservation_date" => $reservation_date,
                    "reservation_time" => $reservation_time,
                    "party_size" => $party_size,
                    "special_requests" => $special_requests,
                    "status" => $status,
                    "created_at" => $created_at,
                    "updated_at" => $updated_at
                );
                
                array_push($reservations_arr["records"], $reservation_item);
            }
            
            // Set response code and output JSON
            http_response_code(200);
            echo json_encode($reservations_arr);
        } else {
            // No reservations found
            http_response_code(404);
            echo json_encode(array("message" => "No reservations found."));
        }
    }
}

/**
 * Handle POST requests - create new reservation
 * @param Reservation $reservation Reservation object
 */
function handlePostRequest($reservation) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Make sure data is not empty
    if(!empty($data->customer_name) && 
       !empty($data->customer_email) && 
       !empty($data->reservation_date) && 
       !empty($data->reservation_time) && 
       !empty($data->party_size)) {
        
        // Set reservation property values
        $reservation->customer_name = $data->customer_name;
        $reservation->customer_email = $data->customer_email;
        $reservation->customer_phone = $data->customer_phone ?? '';
        $reservation->reservation_date = $data->reservation_date;
        $reservation->reservation_time = $data->reservation_time;
        $reservation->party_size = $data->party_size;
        $reservation->special_requests = $data->special_requests ?? '';
        $reservation->status = $data->status ?? 'pending';
        
        // Create the reservation
        if($reservation->createReservation()) {
            // Set response code and message
            http_response_code(201);
            echo json_encode(array("message" => "Reservation was created successfully."));
        } else {
            // Set response code and message
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create reservation."));
        }
    } else {
        // Set response code and message - incomplete data
        http_response_code(400);
        echo json_encode(array("message" => "Unable to create reservation. Data is incomplete."));
    }
}
?>