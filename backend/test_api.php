<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Test - Reservation System</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
            color: #fff;
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        h1 {
            text-align: center;
            margin-bottom: 30px;
            color: #64ffda;
            text-shadow: 0 0 10px rgba(100, 255, 218, 0.3);
        }
        
        .test-section {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 25px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .test-title {
            color: #bb86fc;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .result {
            background: #2d2d44;
            border-radius: 8px;
            padding: 15px;
            margin-top: 10px;
            border-left: 4px solid #64ffda;
            overflow-x: auto;
        }
        
        .success {
            border-left-color: #4caf50;
        }
        
        .error {
            border-left-color: #f44336;
        }
        
        pre {
            white-space: pre-wrap;
            font-size: 14px;
        }
        
        .status {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 0.8em;
            margin-bottom: 10px;
        }
        
        .status.success {
            background: #4caf50;
        }
        
        .status.error {
            background: #f44336;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 Reservation System API Tests</h1>
        
        <?php
        // Test 1: Database Connection
        echo '<div class="test-section">';
        echo '<h3 class="test-title">🔌 Database Connection Test</h3>';
        
        try {
            include_once 'api/config/database.php';
            $database = new Database();
            $db = $database->getConnection();
            
            if($db) {
                echo '<span class="status success">✅ Connected</span>';
                echo '<div class="result success">';
                echo '<strong>SUCCESS:</strong> Database connection established<br>';
                echo 'Database: reservation_system<br>';
                echo 'Status: Ready for operations';
                echo '</div>';
            } else {
                throw new Exception("Connection failed");
            }
        } catch(Exception $e) {
            echo '<span class="status error">❌ Failed</span>';
            echo '<div class="result error">';
            echo '<strong>ERROR:</strong> ' . $e->getMessage();
            echo '</div>';
        }
        echo '</div>';
        
        // Test 2: Model Loading
        echo '<div class="test-section">';
        echo '<h3 class="test-title">📦 Model Loading Test</h3>';
        
        try {
            include_once 'api/models/Reservation.php';
            $reservation = new Reservation($db);
            
            echo '<span class="status success">✅ Loaded</span>';
            echo '<div class="result success">';
            echo '<strong>SUCCESS:</strong> Reservation model loaded successfully<br>';
            echo 'Class: ' . get_class($reservation) . '<br>';
            echo 'Methods: ' . implode(', ', get_class_methods($reservation));
            echo '</div>';
        } catch(Exception $e) {
            echo '<span class="status error">❌ Failed</span>';
            echo '<div class="result error">';
            echo '<strong>ERROR:</strong> ' . $e->getMessage();
            echo '</div>';
        }
        echo '</div>';
        
        // Test 3: Fetch Reservations
        echo '<div class="test-section">';
        echo '<h3 class="test-title">📋 Get Reservations Test</h3>';
        
        try {
            $stmt = $reservation->getAllReservations();
            $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo '<span class="status success">✅ Success</span>';
            echo '<div class="result success">';
            echo '<strong>SUCCESS:</strong> Retrieved ' . count($reservations) . ' reservations<br><br>';
            echo '<strong>Sample Data:</strong><br>';
            echo '<pre>' . json_encode(array_slice($reservations, 0, 2), JSON_PRETTY_PRINT) . '</pre>';
            echo '</div>';
        } catch(Exception $e) {
            echo '<span class="status error">❌ Failed</span>';
            echo '<div class="result error">';
            echo '<strong>ERROR:</strong> ' . $e->getMessage();
            echo '</div>';
        }
        echo '</div>';
        
        // Test 4: API Endpoint Test
        echo '<div class="test-section">';
        echo '<h3 class="test-title">🌐 API Endpoint Test</h3>';
        
        $api_url = 'http://localhost/AngularApp2/backend/api/endpoints/reservations.php';
        echo '<div class="result">';
        echo '<strong>Test this endpoint manually:</strong><br>';
        echo 'URL: <code>' . $api_url . '</code><br>';
        echo 'Method: GET<br>';
        echo 'Expected: JSON response with reservations<br><br>';
        echo '<strong>cURL command:</strong><br>';
        echo '<code>curl -X GET "' . $api_url . '"</code>';
        echo '</div>';
        echo '</div>';
        
        // Test 5: Database Tables Check
        echo '<div class="test-section">';
        echo '<h3 class="test-title">🗄️ Database Structure Test</h3>';
        
        try {
            $query = "DESCRIBE reservations";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo '<span class="status success">✅ Valid</span>';
            echo '<div class="result success">';
            echo '<strong>SUCCESS:</strong> Reservations table structure:<br><br>';
            foreach($columns as $column) {
                echo $column['Field'] . ' (' . $column['Type'] . ')<br>';
            }
            echo '</div>';
        } catch(Exception $e) {
            echo '<span class="status error">❌ Failed</span>';
            echo '<div class="result error">';
            echo '<strong>ERROR:</strong> ' . $e->getMessage() . '<br>';
            echo 'Make sure you\'ve run the database schema SQL first!';
            echo '</div>';
        }
        echo '</div>';
        ?>
        
        <div class="test-section">
            <h3 class="test-title">📝 Next Steps</h3>
            <div class="result">
                <strong>If all tests pass:</strong><br>
                1. ✅ Your backend is ready<br>
                2. ✅ Start your Angular frontend<br>
                3. ✅ Test API calls from Angular<br><br>
                
                <strong>If tests fail:</strong><br>
                1. ❌ Check XAMPP is running<br>
                2. ❌ Verify database exists<br>
                3. ❌ Check file paths<br>
                4. ❌ Review error messages above
            </div>
        </div>
    </div>
</body>
</html>