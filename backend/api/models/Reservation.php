<?php
/**
 * Reservation model class
 * Handles all database operations for reservations
 */

class Reservation {
    // Database connection
    private $conn;
    private $table_name = "reservations";

    // Reservation properties
    public $id;
    public $customer_name;
    public $customer_email;
    public $customer_phone;
    public $reservation_date;
    public $reservation_time;
    public $party_size;
    public $special_requests;
    public $status;
    public $created_at;
    public $updated_at;

    /**
     * Constructor with database connection
     * @param PDO $db Database connection object
     */
    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Get all reservations from database
     * @return PDOStatement Returns all reservations ordered by date and time
     */
    public function getAllReservations() {
        // SQL query to select all reservations
        $query = "SELECT 
                    id, customer_name, customer_email, customer_phone, 
                    reservation_date, reservation_time, party_size, 
                    special_requests, status, created_at, updated_at
                  FROM " . $this->table_name . " 
                  ORDER BY reservation_date DESC, reservation_time DESC";

        // Prepare and execute query
        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }

    /**
     * Get a single reservation by ID
     * @param int $id Reservation ID
     * @return bool Returns true if reservation found, false otherwise
     */
    public function getReservationById($id) {
        // SQL query to select single reservation
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 0,1";

        // Prepare query
        $stmt = $this->conn->prepare($query);
        
        // Bind ID parameter
        $stmt->bindParam(1, $id);
        
        // Execute query
        $stmt->execute();

        // Get retrieved row
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        // Set properties if reservation found
        if($row) {
            $this->id = $row['id'];
            $this->customer_name = $row['customer_name'];
            $this->customer_email = $row['customer_email'];
            $this->customer_phone = $row['customer_phone'];
            $this->reservation_date = $row['reservation_date'];
            $this->reservation_time = $row['reservation_time'];
            $this->party_size = $row['party_size'];
            $this->special_requests = $row['special_requests'];
            $this->status = $row['status'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }

        return false;
    }

    /**
     * Create new reservation
     * @return bool Returns true if creation successful, false otherwise
     */
    public function createReservation() {
        // SQL query to insert new reservation
        $query = "INSERT INTO " . $this->table_name . "
                  SET customer_name=:customer_name, customer_email=:customer_email, 
                      customer_phone=:customer_phone, reservation_date=:reservation_date,
                      reservation_time=:reservation_time, party_size=:party_size,
                      special_requests=:special_requests, status=:status";

        // Prepare query
        $stmt = $this->conn->prepare($query);

        // Sanitize input data
        $this->customer_name = htmlspecialchars(strip_tags($this->customer_name));
        $this->customer_email = htmlspecialchars(strip_tags($this->customer_email));
        $this->customer_phone = htmlspecialchars(strip_tags($this->customer_phone));
        $this->reservation_date = htmlspecialchars(strip_tags($this->reservation_date));
        $this->reservation_time = htmlspecialchars(strip_tags($this->reservation_time));
        $this->party_size = htmlspecialchars(strip_tags($this->party_size));
        $this->special_requests = htmlspecialchars(strip_tags($this->special_requests));
        $this->status = htmlspecialchars(strip_tags($this->status));

        // Bind values
        $stmt->bindParam(":customer_name", $this->customer_name);
        $stmt->bindParam(":customer_email", $this->customer_email);
        $stmt->bindParam(":customer_phone", $this->customer_phone);
        $stmt->bindParam(":reservation_date", $this->reservation_date);
        $stmt->bindParam(":reservation_time", $this->reservation_time);
        $stmt->bindParam(":party_size", $this->party_size);
        $stmt->bindParam(":special_requests", $this->special_requests);
        $stmt->bindParam(":status", $this->status);

        // Execute query
        if($stmt->execute()) {
            return true;
        }

        return false;
    }
}
?>