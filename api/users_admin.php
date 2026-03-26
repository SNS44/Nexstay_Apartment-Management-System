<?php
require_once __DIR__ . '/helpers.php';

requireMethod('GET');
$admin = requireAdmin();

$pdo = getDb();

try {
    // Fetch all users with basic info
    $stmt = $pdo->query("SELECT id, name, email, phone, role, created_at, 
                        (CASE WHEN is_resident = 1 THEN 'Active' ELSE 'Inactive' END) as account_status 
                        FROM users 
                        ORDER BY created_at DESC");
    $users = $stmt->fetchAll();

    sendJson([
        'success' => true,
        'users' => $users
    ]);
} catch (Exception $e) {
    sendError($e->getMessage());
}
