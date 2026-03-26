<?php

require_once __DIR__ . '/helpers.php';

$user = requireLogin();
$input = getJsonInput();

$name = trim($input['name'] ?? '');
$phone = trim($input['phone'] ?? '');
$emergency = trim($input['emergency_contact'] ?? '');

if (!$name) {
    sendError('Name is required');
}

try {
    $pdo = getDb();
    
    $stmt = $pdo->prepare("UPDATE users SET name = ?, phone = ? WHERE id = ?");
    $stmt->execute([$name, $phone, $user['id']]);
    
    // Fetch updated user data
    $stmt = $pdo->prepare("SELECT id, name, email, phone, role, is_resident, created_at FROM users WHERE id = ?");
    $stmt->execute([$user['id']]);
    $updatedUser = $stmt->fetch();
    
    recordActivity($user['id'], 'Profile Updated', 'user', $user['id'], 'User updated their profile information');
    
    sendJson([
        'success' => true,
        'message' => 'Profile updated successfully',
        'user' => $updatedUser
    ]);

} catch (PDOException $e) {
    error_log('User Update API Error: ' . $e->getMessage());
    sendError('Database error: ' . $e->getMessage(), 500);
}
