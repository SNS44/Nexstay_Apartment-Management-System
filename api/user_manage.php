<?php
/**
 * Admin User Management API
 * Supports: deactivate, activate, promote, demote, view_history
 */

require_once __DIR__ . '/helpers.php';

requireMethod('POST');
$admin = requireAdmin();

$data = getJsonInput();
$action = strtolower(trim($data['action'] ?? ''));
$userId = isset($data['user_id']) ? (int)$data['user_id'] : 0;

if (!$userId) {
    sendError('User ID is required.');
}

if (!in_array($action, ['deactivate', 'activate', 'promote', 'demote'])) {
    sendError('Invalid action. Allowed: deactivate, activate, promote, demote');
}

$pdo = getDb();

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("SELECT id, name, role, is_resident FROM users WHERE id = ? FOR UPDATE");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) throw new Exception('User not found.');

    // Prevent self-modification
    if ($userId === $admin['id']) {
        throw new Exception('You cannot modify your own account.');
    }

    switch ($action) {
        case 'deactivate':
            $stmt = $pdo->prepare("UPDATE users SET is_resident = 0 WHERE id = ?");
            $stmt->execute([$userId]);
            recordActivity($admin['id'], 'admin_deactivate_user', 'user', $userId, "Deactivated user: {$user['name']}");
            $message = "User {$user['name']} deactivated.";
            break;

        case 'activate':
            $stmt = $pdo->prepare("UPDATE users SET is_resident = 1 WHERE id = ?");
            $stmt->execute([$userId]);
            recordActivity($admin['id'], 'admin_activate_user', 'user', $userId, "Activated user: {$user['name']}");
            $message = "User {$user['name']} activated.";
            break;

        case 'promote':
            if ($user['role'] === 'admin') throw new Exception("{$user['name']} is already an admin.");
            $stmt = $pdo->prepare("UPDATE users SET role = 'admin' WHERE id = ?");
            $stmt->execute([$userId]);
            recordActivity($admin['id'], 'admin_promote_user', 'user', $userId, "Promoted {$user['name']} to admin.");
            $message = "{$user['name']} promoted to admin.";
            break;

        case 'demote':
            if ($user['role'] === 'user') throw new Exception("{$user['name']} is already a regular user.");
            $stmt = $pdo->prepare("UPDATE users SET role = 'user' WHERE id = ?");
            $stmt->execute([$userId]);
            recordActivity($admin['id'], 'admin_demote_user', 'user', $userId, "Demoted {$user['name']} to user.");
            $message = "{$user['name']} demoted to regular user.";
            break;
    }

    $pdo->commit();
    sendJson(['success' => true, 'message' => $message]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    sendError($e->getMessage());
}
