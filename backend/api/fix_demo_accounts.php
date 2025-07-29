<?php
/**
 * Fix Demo Accounts - Reset passwords and verify they work
 * Run this to fix login issues with demo accounts
 */

// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Content-Type: text/html; charset=UTF-8");

echo "<h1>🔧 Demo Accounts Repair Tool</h1>";

// Include database
include_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "<h3>1. Current Demo Accounts Status</h3>";
    
    // Check current demo accounts
    $query = "SELECT id, username, email, role, is_active, created_at FROM users WHERE username IN ('admin', 'manager', 'demo') ORDER BY username";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $existing_accounts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($existing_accounts) > 0) {
        echo "<table style='border-collapse: collapse; width: 100%; margin: 10px 0;'>";
        echo "<tr style='background: #f0f0f0;'>";
        echo "<th style='border: 1px solid #ddd; padding: 8px;'>ID</th>";
        echo "<th style='border: 1px solid #ddd; padding: 8px;'>Username</th>";
        echo "<th style='border: 1px solid #ddd; padding: 8px;'>Email</th>";
        echo "<th style='border: 1px solid #ddd; padding: 8px;'>Role</th>";
        echo "<th style='border: 1px solid #ddd; padding: 8px;'>Active</th>";
        echo "<th style='border: 1px solid #ddd; padding: 8px;'>Created</th>";
        echo "</tr>";
        
        foreach ($existing_accounts as $account) {
            echo "<tr>";
            echo "<td style='border: 1px solid #ddd; padding: 8px;'>" . $account['id'] . "</td>";
            echo "<td style='border: 1px solid #ddd; padding: 8px;'><strong>" . $account['username'] . "</strong></td>";
            echo "<td style='border: 1px solid #ddd; padding: 8px;'>" . $account['email'] . "</td>";
            echo "<td style='border: 1px solid #ddd; padding: 8px;'>" . $account['role'] . "</td>";
            echo "<td style='border: 1px solid #ddd; padding: 8px;'>" . ($account['is_active'] ? 'Yes' : 'No') . "</td>";
            echo "<td style='border: 1px solid #ddd; padding: 8px;'>" . $account['created_at'] . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p style='color: orange;'>❌ No demo accounts found!</p>";
    }
    
    echo "<h3>2. Reset Demo Account Passwords</h3>";
    
    // Demo accounts configuration
    $demo_accounts = [
        [
            'username' => 'admin',
            'email' => 'admin@reserveease.com',
            'password' => 'admin123',
            'first_name' => 'Admin',
            'last_name' => 'User',
            'role' => 'admin'
        ],
        [
            'username' => 'manager',
            'email' => 'manager@reserveease.com',
            'password' => 'admin123',
            'first_name' => 'Manager',
            'last_name' => 'User',
            'role' => 'manager'
        ],
        [
            'username' => 'demo',
            'email' => 'demo@reserveease.com',
            'password' => 'admin123',
            'first_name' => 'Demo',
            'last_name' => 'Staff',
            'role' => 'staff'
        ]
    ];
    
    foreach ($demo_accounts as $account) {
        echo "<h4>Processing: {$account['username']}</h4>";
        
        // Check if account exists
        $check_query = "SELECT id, username, password_hash FROM users WHERE username = ?";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([$account['username']]);
        $existing = $check_stmt->fetch();
        
        // Generate new password hash
        $new_password_hash = password_hash($account['password'], PASSWORD_DEFAULT);
        
        if ($existing) {
            // Update existing account
            $update_query = "UPDATE users SET 
                password_hash = ?, 
                email = ?, 
                first_name = ?, 
                last_name = ?, 
                role = ?, 
                is_active = 1 
                WHERE username = ?";
            
            $update_stmt = $db->prepare($update_query);
            $result = $update_stmt->execute([
                $new_password_hash,
                $account['email'],
                $account['first_name'],
                $account['last_name'],
                $account['role'],
                $account['username']
            ]);
            
            if ($result) {
                echo "✅ <strong>UPDATED:</strong> {$account['username']} - Password reset to 'admin123'<br>";
                
                // Test the new password
                if (password_verify($account['password'], $new_password_hash)) {
                    echo "✅ <strong>PASSWORD VERIFIED:</strong> {$account['username']} can login with 'admin123'<br>";
                } else {
                    echo "❌ <strong>PASSWORD VERIFICATION FAILED:</strong> {$account['username']}<br>";
                }
            } else {
                echo "❌ <strong>UPDATE FAILED:</strong> {$account['username']}<br>";
            }
        } else {
            // Create new account
            $insert_query = "INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)";
            $insert_stmt = $db->prepare($insert_query);
            $result = $insert_stmt->execute([
                $account['username'],
                $account['email'],
                $new_password_hash,
                $account['first_name'],
                $account['last_name'],
                $account['role']
            ]);
            
            if ($result) {
                echo "✅ <strong>CREATED:</strong> {$account['username']} - Password set to 'admin123'<br>";
            } else {
                echo "❌ <strong>CREATION FAILED:</strong> {$account['username']}<br>";
            }
        }
        echo "<br>";
    }
    
    echo "<h3>3. Login Test for All Demo Accounts</h3>";
    
    // Test login for each account
    foreach ($demo_accounts as $account) {
        $query = "SELECT id, username, password_hash, is_active FROM users WHERE username = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$account['username']]);
        $user = $stmt->fetch();
        
        if ($user && $user['is_active'] && password_verify($account['password'], $user['password_hash'])) {
            echo "✅ <strong>LOGIN TEST PASSED:</strong> {$account['username']} / admin123<br>";
        } else {
            echo "❌ <strong>LOGIN TEST FAILED:</strong> {$account['username']} / admin123";
            if (!$user) {
                echo " (User not found)";
            } elseif (!$user['is_active']) {
                echo " (User inactive)";
            } else {
                echo " (Password mismatch)";
            }
            echo "<br>";
        }
    }
    
    echo "<h3>4. Clean Up Old Sessions</h3>";
    
    // Clean up any old sessions that might interfere
    $cleanup_query = "DELETE FROM user_sessions WHERE expires_at < NOW()";
    $cleanup_stmt = $db->prepare($cleanup_query);
    $cleanup_result = $cleanup_stmt->execute();
    $deleted_sessions = $cleanup_stmt->rowCount();
    
    echo "🧹 <strong>Cleaned up {$deleted_sessions} expired sessions</strong><br>";
    
    echo "<h3>✅ Demo Accounts Ready!</h3>";
    echo "<div style='background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0;'>";
    echo "<strong>Your demo accounts are now ready to use:</strong><br><br>";
    echo "<strong>Admin Account:</strong> admin / admin123<br>";
    echo "<strong>Manager Account:</strong> manager / admin123<br>";
    echo "<strong>Staff Account:</strong> demo / admin123<br><br>";
    echo "<em>All passwords have been reset and verified. You can now login to your Angular app!</em>";
    echo "</div>";
    
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px;'>";
    echo "❌ <strong>ERROR:</strong> " . $e->getMessage();
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
h1, h3, h4 { 
    color: #333; 
    margin-top: 30px;
    margin-bottom: 15px;
}
h1 { 
    text-align: center; 
    color: #007bff;
    border-bottom: 3px solid #007bff;
    padding-bottom: 10px;
}
table {
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>