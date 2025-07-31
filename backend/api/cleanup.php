<?php
/**
 * Database Cleanup Script
 * Run this to fix existing lockout issues and clean up the database
 */

header("Content-Type: text/html; charset=UTF-8");

echo "<h1>🧹 Lockout System Cleanup & Fix</h1>";

// Include database
include_once 'config/database.php';
include_once 'lockout_service.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    // $lockoutService = new AccountLockoutService($db);
    
    echo "<h3>1. Current Lockout Issues</h3>";
    
    // Check for problematic lockouts
    $query = "SELECT 
                identifier,
                COUNT(*) as lockout_count,
                MAX(locked_until) as latest_lockout,
                MIN(locked_at) as first_lockout,
                SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_count
              FROM account_lockouts 
              GROUP BY identifier 
              HAVING lockout_count > 1 OR active_count > 1
              ORDER BY lockout_count DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $problematic = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($problematic) > 0) {
        echo "<div style='background: #fee; padding: 15px; border: 1px solid #fcc; border-radius: 5px; margin: 10px 0;'>";
        echo "<strong>⚠️ Found " . count($problematic) . " accounts with multiple/conflicting lockouts:</strong><br><br>";
        
        foreach ($problematic as $issue) {
            echo "📍 <strong>{$issue['identifier']}</strong>: {$issue['lockout_count']} lockouts, {$issue['active_count']} active<br>";
        }
        echo "</div>";
    } else {
        echo "✅ No problematic lockouts found<br>";
    }
    
    echo "<h3>2. Cleanup Operations</h3>";
    
    // Fix 1: Deactivate duplicate active lockouts (keep only the most recent)
    $duplicateQuery = "UPDATE account_lockouts l1
                       SET is_active = 0, unlocked_at = NOW(), unlocked_by = 'cleanup'
                       WHERE l1.is_active = 1 
                       AND EXISTS (
                           SELECT 1 FROM account_lockouts l2 
                           WHERE l2.identifier = l1.identifier 
                           AND l2.is_active = 1 
                           AND l2.locked_at > l1.locked_at
                       )";
    $stmt = $db->prepare($duplicateQuery);
    $stmt->execute();
    $duplicatesFixed = $stmt->rowCount();
    
    echo "🔧 Fixed {$duplicatesFixed} duplicate active lockouts<br>";
    
    // Fix 2: Auto-unlock expired lockouts
    $expiredQuery = "UPDATE account_lockouts 
                     SET is_active = 0, unlocked_at = NOW(), unlocked_by = 'cleanup'
                     WHERE locked_until <= NOW() AND is_active = 1";
    $stmt = $db->prepare($expiredQuery);
    $stmt->execute();
    $expiredFixed = $stmt->rowCount();
    
    echo "🔧 Auto-unlocked {$expiredFixed} expired lockouts<br>";
    
    // Fix 3: Clean up user table inconsistencies
    $userCleanupQuery = "UPDATE users 
                         SET locked_until = NULL, failed_login_count = 0
                         WHERE locked_until IS NOT NULL AND locked_until <= NOW()";
    $stmt = $db->prepare($userCleanupQuery);
    $stmt->execute();
    $usersFixed = $stmt->rowCount();
    
    echo "🔧 Cleaned up {$usersFixed} user table lockout entries<br>";
    
    // Fix 4: Remove old failed attempts (older than 24 hours)
    $oldAttemptsQuery = "DELETE FROM failed_login_attempts 
                         WHERE attempt_time < DATE_SUB(NOW(), INTERVAL 24 HOUR)";
    $stmt = $db->prepare($oldAttemptsQuery);
    $stmt->execute();
    $oldAttemptsRemoved = $stmt->rowCount();
    
    echo "🔧 Removed {$oldAttemptsRemoved} old failed attempts<br>";
    
    echo "<h3>3. Current Status After Cleanup</h3>";
    
    // Show current active lockouts
    $activeQuery = "SELECT 
                      identifier,
                      locked_until,
                      TIMESTAMPDIFF(SECOND, NOW(), locked_until) as seconds_remaining,
                      failed_attempts_count
                    FROM account_lockouts 
                    WHERE is_active = 1 AND locked_until > NOW()
                    ORDER BY locked_until DESC";
    
    $stmt = $db->prepare($activeQuery);
    $stmt->execute();
    $activeLockouts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($activeLockouts) > 0) {
        echo "<div style='background: #ffe; padding: 15px; border: 1px solid #ffcc00; border-radius: 5px; margin: 10px 0;'>";
        echo "<strong>🔒 Current Active Lockouts:</strong><br><br>";
        
        foreach ($activeLockouts as $lockout) {
            $minutes = floor($lockout['seconds_remaining'] / 60);
            $seconds = $lockout['seconds_remaining'] % 60;
            echo "📍 <strong>{$lockout['identifier']}</strong>: {$minutes}m {$seconds}s remaining ({$lockout['failed_attempts_count']} attempts)<br>";
        }
        echo "</div>";
    } else {
        echo "✅ No active lockouts found<br>";
    }
    
    echo "<h3>4. Force Reset Specific Account (Optional)</h3>";
    
    echo "<div style='background: #f0f8ff; padding: 15px; border: 1px solid #b0d4f1; border-radius: 5px; margin: 10px 0;'>";
    echo "<strong>To manually reset a specific account, add this to the URL:</strong><br>";
    echo "<code>?reset=username_or_email</code><br><br>";
    echo "<strong>Example:</strong> <code>cleanup.php?reset=admin</code>";
    echo "</div>";
    
    // Handle manual reset if requested
    if (isset($_GET['reset']) && !empty($_GET['reset'])) {
        $resetIdentifier = $_GET['reset'];
        echo "<h4>🔄 Force Resetting: {$resetIdentifier}</h4>";
        
        $resetSuccess = $lockoutService->forceResetLockout($resetIdentifier);
        
        if ($resetSuccess) {
            echo "<div style='background: #e8f5e8; padding: 15px; border: 1px solid #4caf50; border-radius: 5px; margin: 10px 0;'>";
            echo "✅ <strong>Successfully reset all lockouts and attempts for: {$resetIdentifier}</strong><br>";
            echo "This account can now login normally.";
            echo "</div>";
        } else {
            echo "<div style='background: #fee; padding: 15px; border: 1px solid #f44336; border-radius: 5px; margin: 10px 0;'>";
            echo "❌ <strong>Failed to reset lockout for: {$resetIdentifier}</strong><br>";
            echo "Check the error logs for details.";
            echo "</div>";
        }
    }
    
    echo "<h3>✅ Cleanup Complete!</h3>";
    echo "<div style='background: #e8f5e8; padding: 20px; border: 1px solid #4caf50; border-radius: 5px; margin: 20px 0;'>";
    echo "<strong>Summary:</strong><br>";
    echo "• Fixed {$duplicatesFixed} duplicate lockouts<br>";
    echo "• Unlocked {$expiredFixed} expired lockouts<br>";
    echo "• Cleaned {$usersFixed} user table entries<br>";
    echo "• Removed {$oldAttemptsRemoved} old attempts<br><br>";
    echo "<strong>The lockout system should now work correctly!</strong><br>";
    echo "Test by trying wrong passwords - it should lock after 5 attempts for exactly 2 minutes.";
    echo "</div>";
    
} catch (Exception $e) {
    echo "<div style='background: #fee; padding: 15px; border: 1px solid #f44336; border-radius: 5px;'>";
    echo "❌ <strong>Error during cleanup:</strong> " . $e->getMessage();
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
code {
    background: #f1f3f4;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
}
</style>