<?php
/*
 * Contains database connection settings and PDO connection setup
 * Improved version with better error handling for JSON APIs
 */

class Database {
    // Database credentials
    private $host = "localhost";
    private $db_name = "reservation_system";
    private $username = "root";  
    private $password = "";      
    private $conn;

    /**
     * Get database connection
     * @return PDO|null Returns PDO connection object or null on failure
     */
    public function getConnection() {
        $this->conn = null;

        try {
            // Create PDO connection with UTF-8 charset
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8",
                $this->username,
                $this->password
            );
            
            // Set PDO error mode to exception for better error handling
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            
        } catch(PDOException $exception) {
            // Log error to PHP error log instead of echoing
            error_log("Database connection error: " . $exception->getMessage());
            
            // For API responses, we don't want to echo here
            // Let the calling code handle the error response
            throw new Exception("Database connection failed: " . $exception->getMessage());
        }

        return $this->conn;
    }

    /**
     * Close database connection
     */
    public function closeConnection() {
        $this->conn = null;
    }

    /**
     * Test database connection
     * @return bool Returns true if connection is successful
     */
    public function testConnection() {
        try {
            $conn = $this->getConnection();
            return $conn !== null;
        } catch (Exception $e) {
            return false;
        }
    }
}
?>