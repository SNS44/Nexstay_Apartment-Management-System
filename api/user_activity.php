<?php

require_once __DIR__ . '/helpers.php';

$user = requireLogin();

try {
    $pdo = getDb();
    
    $stmt = $pdo->prepare("SELECT id, activity_type, reference_type, reference_id, description, created_at 
                             FROM user_activity 
                            WHERE user_id = ? 
                         ORDER BY created_at DESC 
                            LIMIT 50");
    $stmt->execute([$user['id']]);
    $activities = $stmt->fetchAll();
    
    sendJson([
        'success' => true,
        'activities' => $activities
    ]);

} catch (PDOException $e) {
    error_log('User Activity API Error: ' . $e->getMessage());
    sendError('Database error: ' . $e->getMessage(), 500);
}
