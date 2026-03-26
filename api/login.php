<?php

// Suppress any accidental HTML output from errors/warnings
error_reporting(0);
ini_set('display_errors', 0);

require_once __DIR__ . '/helpers.php';

try {
    requireMethod('POST');
    $data = getJsonInput();

    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';

    if ($email === '' || $password === '') {
        sendError('Email and password are required.');
    }

    $pdo = getDb();

    // Check which password column exists
    $checkPasswordHash = $pdo->query("SHOW COLUMNS FROM users LIKE 'password_hash'");
    $checkPassword = $pdo->query("SHOW COLUMNS FROM users LIKE 'password'");
    $hasPasswordHash = $checkPasswordHash->rowCount() > 0;
    $hasPassword = $checkPassword->rowCount() > 0;

    // Build query - use password_hash if it exists, otherwise password
    $columns = ['id', 'name', 'email', 'phone', 'role', 'is_resident'];
    $passwordColumn = 'password_hash'; 
    if ($hasPasswordHash) {
        $columns[] = 'password_hash';
        $passwordColumn = 'password_hash';
    } elseif ($hasPassword) {
        $columns[] = 'password';
        $passwordColumn = 'password';
    }

    $stmt = $pdo->prepare('SELECT ' . implode(', ', $columns) . ' FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        sendError('No account found with this email address.', 401);
    }

    $userPasswordHash = $user[$passwordColumn] ?? '';

    if (empty($userPasswordHash)) {
        sendError('Account exists but password is not set.', 401);
    }

    if (!password_verify($password, $userPasswordHash)) {
        sendError('Incorrect password.', 401);
    }

    startSession();
    $_SESSION['user_id'] = (int)$user['id'];
    $_SESSION['role'] = $user['role'] ?? 'user';

    $response = [
        'success' => true,
        'user' => [
            'id' => (int)$user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'phone' => $user['phone'] ?? '',
            'role' => $user['role'] ?? 'user',
            'is_resident' => isset($user['is_resident']) ? (int)$user['is_resident'] : 0,
        ],
    ];

    sendJson($response);

} catch (Exception $e) {
    // Ensure we return JSON even on error
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error: ' . $e->getMessage()
    ]);
    exit;
}
