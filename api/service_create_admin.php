<?php
/**
 * Admin Service Request Creation
 * Allows admins to create service requests for any resident
 */

require_once __DIR__ . '/helpers.php';

requireMethod('POST');
$admin = requireAdmin();

$data = getJsonInput();
// Fallback to admin ID if no specific user is provided (e.g. maintenance for empty room)
$finalUserId = $userId > 0 ? $userId : $admin['id'];

if (!$roomId || !$serviceType || !$title || !$description) {
    sendError('Missing required fields. room_id, service_type, title, and description are required.');
}

$pdo = getDb();

try {
    $stmt = $pdo->prepare("INSERT INTO service_requests 
        (user_id, room_id, service_type, description, status, created_at)
        VALUES (?, ?, ?, ?, 'Pending', NOW())");
    
    $fullDescription = $title . ': ' . $description;
    $stmt->execute([$finalUserId, $roomId, $serviceType, $fullDescription]);
    $requestId = (int)$pdo->lastInsertId();

    // Record activity for admin
    recordActivity($admin['id'], 'admin_service_create', 'service_request', $requestId, 
        "Admin created {$serviceType} request for Room #{$roomId}");

    sendJson([
        'success' => true,
        'request_id' => $requestId,
        'message' => 'Service request created successfully by admin.'
    ]);

} catch (Exception $e) {
    sendError($e->getMessage());
}
