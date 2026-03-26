<?php

require_once __DIR__ . '/helpers.php';

$user = requireLogin();
$input = getJsonInput();

$current_password = $input['current_password'] ?? '';
$new_password = $input['new_password'] ?? '';

if (!$current_password || !$new_password) {
    sendError('Current and new password are required');
}

try {
    $pdo = getDb();
    
    // Get current password hash
    $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->execute([$user['id']]);
    $pwdHash = $stmt->fetchColumn();
    
    if (!$pwdHash || !password_verify($current_password, $pwdHash)) {
        sendError('Current password is incorrect');
    }
    
    // Update password
    $newHash = password_hash($new_password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt->execute([$newHash, $user['id']]);
    
    recordActivity($user['id'], 'Password Changed', 'user', $user['id'], 'User changed their account password');
    
    sendJson([
        'success' => true,
        'message' => 'Password updated successfully'
    ]);

} catch (PDOException $e) {
    error_log('User Update Password API Error: ' . $e->getMessage());
    sendError('Database error: ' . $e->getMessage(), 500);
}
