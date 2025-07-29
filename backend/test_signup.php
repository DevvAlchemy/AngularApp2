<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

// Test data
$test_data = [
    "username" => "testuser",
    "email" => "test@example.com", 
    "password" => "test123",
    "first_name" => "Test",
    "last_name" => "User",
    "role" => "staff"
];

// Make internal request to signup
$url = 'http://localhost/AngularApp2/backend/api/auth.php?action=signup';
$options = [
    'http' => [
        'header' => "Content-Type: application/json\r\n",
        'method' => 'POST',
        'content' => json_encode($test_data)
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

echo "Response: " . $result;
?>