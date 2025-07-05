<?php
/*
 * Contains database connection settings and PDO connection setup
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
            
            // Set PDO error mode to exception
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
        } catch(PDOException $exception) {
            // Log error message (in production, log to file instead of echoing)
            echo "Connection error: " . $exception->getMessage();
        }

        return $this->conn;
    }
}
?>