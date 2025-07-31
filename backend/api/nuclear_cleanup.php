<?php
/**
 * NUCLEAR CLEANUP SCRIPT
 * This will completely reset the entire lockout system
 */

header("Content-Type: text/html; charset=UTF-8");

echo "<h1>💥 NUCLEAR LOCKOUT SYSTEM RESET</h1>";
echo "<p style='color: red; font-weight: bold;'>⚠️ This will completely wipe all lockout data and start fresh!</p>";

// Include database
include_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "<h3>🔥 Step 1: Complete Data Wipe</h3>";
    
    // Nuclear option: Delete ALL lockout data
    $queries = [
        "DELETE FROM failed_login_attempts" => "Failed login attempts",
        "DELETE FROM account_lockouts" => "Account lockouts", 
        "UPDATE users SET locked_until = NULL, failed_login_count = 0, last_failed_login = NULL" => "User lockout fields"
    ];
    
    foreach ($queries as $query => $description) {
        $stmt = $db->prepare($query);
        $stmt->execute();
        $affected = $stmt->rowCount();
        echo "✅ Cleared {$description}: {$affected} records<br>";
    }
    
    echo "<h3>🔧 Step 2: Reset Auto-Increment IDs</h3>";
    
    // Reset auto-increment counters
    $resetQueries = [
        "ALTER TABLE failed_login_attempts AUTO_INCREMENT = 1",
        "ALTER TABLE account_lockouts AUTO_INCREMENT = 1"
    ];
    
    foreach ($resetQueries as $query) {
        try {
            $stmt = $db->prepare($query);
            $stmt->execute();
            echo "✅ Reset auto-increment<br>";
        } catch (Exception $e) {
            echo "⚠️ Auto-increment reset: " . $e->getMessage() . "<br>";
        }
    }
    
    echo "<h3>🧪 Step 3: Test Database State</h3>";
    
    // Verify everything is clean
    $testQueries = [
        "SELECT COUNT(*) as count FROM failed_login_attempts" => "Failed attempts",
        "SELECT COUNT(*) as count FROM account_lockouts" => "Lockouts",
        "SELECT COUNT(*) as count FROM users WHERE locked_until IS NOT NULL" => "Locked users"
    ];
    
    $allClean = true;
    foreach ($testQueries as $query => $description) {
        $stmt = $db->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $count = $result['count'];
        
        if ($count == 0) {
            echo "✅ {$description}: Clean (0 records)<br>";
        } else {
            echo "❌ {$description}: Still has {$count} records<br>";
            $allClean = false;
        }
    }
    
    if ($allClean) {
        echo "<div style='background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 20px; border-radius: 5px; margin: 20px 0;'>";
        echo "<h4>🎉 NUCLEAR RESET COMPLETE!</h4>";
        echo "<strong>All lockout data has been completely wiped.</strong><br><br>";
        echo "<strong>✅ What's been reset:</strong><br>";
        echo "• All failed login attempts deleted<br>";
        echo "• All account lockouts removed<br>";
        echo "• All user lockout flags cleared<br>";
        echo "• Database counters reset<br><br>";
        echo "<strong>🧪 Test Instructions:</strong><br>";
        echo "1. Go to your login page<br>";
        echo "2. Try wrong password 5 times<br>";
        echo "3. Should lock for exactly 2 minutes<br>";
        echo "4. After 2 minutes, should unlock automatically<br>";
        echo "</div>";
    } else {
        echo "<div style='background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px;'>";
        echo "❌ <strong>RESET INCOMPLETE</strong><br>";
        echo "Some data still remains. Check database permissions.";
        echo "</div>";
    }
    
    echo "<h3>🔍 Step 4: Verify Demo Accounts</h3>";
    
    // Check demo accounts
    $userQuery = "SELECT username, email, locked_until, failed_login_count FROM users WHERE username IN ('admin', 'manager', 'demo')";
    $stmt = $db->prepare($userQuery);
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table style='border-collapse: collapse; width: 100%; margin: 10px 0;'>";
    echo "<tr style='background: #f8f9fa;'>";
    echo "<th style='border: 1px solid #dee2e6; padding: 8px;'>Username</th>";
    echo "<th style='border: 1px solid #dee2e6; padding: 8px;'>Email</th>";
    echo "<th style='border: 1px solid #dee2e6; padding: 8px;'>Locked Until</th>";
    echo "<th style='border: 1px solid #dee2e6; padding: 8px;'>Failed Count</th>";
    echo "<th style='border: 1px solid #dee2e6; padding: 8px;'>Status</th>";
    echo "</tr>";
    
    foreach ($users as $user) {
        $status = ($user['locked_until'] === null && $user['failed_login_count'] == 0) ? "✅ Clean" : "❌ Has lockout data";
        $statusColor = ($user['locked_until'] === null && $user['failed_login_count'] == 0) ? "#28a745" : "#dc3545";
        
        echo "<tr>";
        echo "<td style='border: 1px solid #dee2e6; padding: 8px;'>{$user['username']}</td>";
        echo "<td style='border: 1px solid #dee2e6; padding: 8px;'>{$user['email']}</td>";
        echo "<td style='border: 1px solid #dee2e6; padding: 8px;'>" . ($user['locked_until'] ?: 'NULL') . "</td>";
        echo "<td style='border: 1px solid #dee2e6; padding: 8px;'>{$user['failed_login_count']}</td>";
        echo "<td style='border: 1px solid #dee2e6; padding: 8px; color: {$statusColor};'>{$status}</td>";
        echo "</tr>";
    }
    echo "</table>";
    
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px;'>";
    echo "💥 <strong>NUCLEAR RESET FAILED:</strong> " . $e->getMessage();
    echo "</div>";
}
?>

<style>
body { 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
    max-width: 900px; 
    margin: 20px auto; 
    padding: 20px;
    background: #f8f9fa;
    line-height: 1.6;
}
h1, h3 { 
    color: #333; 
    margin-top: 30px;
    margin-bottom: 15px;
}
h1 { 
    text-align: center; 
    color: #dc3545;
    border-bottom: 3px solid #dc3545;
    padding-bottom: 10px;
}
table {
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>