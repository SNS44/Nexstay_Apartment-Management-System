<?php

require_once __DIR__ . '/helpers.php';

requireMethod('POST');
$data = getJsonInput();

$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';
$phone = trim($data['phone'] ?? '');

if ($name === '' || $email === '' || $password === '') {
    sendError('Name, email, and password are required.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendError('Invalid email address.');
}

if (strlen($password) < 6) {
    sendError('Password must be at least 6 characters long.');
}

$pdo = getDb();

// Ensure password column exists
try {
    $checkCol = $pdo->query("SHOW COLUMNS FROM users LIKE 'password'");
    if ($checkCol->rowCount() == 0) {
        $pdo->exec("ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT '' AFTER phone");
    }
} catch (PDOException $e) {
    sendError('Database configuration error. Please run migration script.', 500);
}

$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    sendError('An account with this email already exists.');
}

$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare('INSERT INTO users (name, email, password, phone) VALUES (?,?,?,?)');
$stmt->execute([$name, $email, $hash, $phone]);
$userId = (int)$pdo->lastInsertId();

startSession();
$_SESSION['user_id'] = $userId;
$_SESSION['role'] = 'user';

sendJson([
    'success' => true,
    'user' => [
        'id' => $userId,
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'role' => 'user',
        'is_resident' => 0,
    ],
], 201);
