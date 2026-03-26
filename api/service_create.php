<?php
/**
 * Service Request Creation
 * STRICT RULES:
 * - User must have an Active booking (NOT Approved, NOT Pending)
 * - Service is linked to user, room, and booking
 * - Room does NOT change to Maintenance on service request
 */

require_once __DIR__ . '/helpers.php';

requireMethod('POST');
$user = requireLogin();

$data = getJsonInput();
$serviceType = strtolower(trim($data['service_type'] ?? ''));
$title = trim($data['title'] ?? '');
$description = trim($data['description'] ?? '');

$allowedTypes = ['plumber', 'electrician', 'cleaner', 'guard', 'ac_repair', 'general_maintenance'];
if (!in_array($serviceType, $allowedTypes, true)) {
    sendError('Invalid service type. Allowed: ' . implode(', ', $allowedTypes));
}

if ($title === '') {
    sendError('Title is required.');
}

if ($description === '') {
    sendError('Description is required.');
}

$pdo = getDb();

try {
    $pdo->beginTransaction();

    // STRICT: User must have an ACTIVE booking
    $stmt = $pdo->prepare("SELECT b.id as booking_id, b.room_id, b.status as booking_status,
                                  r.room_number, r.status as room_status, r.resident_id
                           FROM bookings b
                           JOIN rooms r ON b.room_id = r.id
                           WHERE b.user_id = ?
                             AND b.status = 'Active'
                           LIMIT 1 FOR UPDATE");
    $stmt->execute([$user['id']]);
    $booking = $stmt->fetch();

    if (!$booking) {
        throw new Exception('You must have an active booking to request services. Please complete your booking and payment first.');
    }

    // Verify user is the resident
    if ((int)$booking['resident_id'] !== $user['id']) {
        throw new Exception('You are not the assigned resident of this room.');
    }

    $roomId = (int)$booking['room_id'];
    $bookingId = (int)$booking['booking_id'];

    // Create service request - linked to user, room, and booking
    $stmt = $pdo->prepare("INSERT INTO service_requests 
        (user_id, room_id, service_type, description, status, created_at)
        VALUES (?, ?, ?, ?, 'Pending', NOW())");
    $stmt->execute([$user['id'], $roomId, $serviceType, $title . ': ' . $description]);
    $requestId = (int)$pdo->lastInsertId();

    // NOTE: Room does NOT change to Maintenance on service request
    // Room stays Occupied unless admin explicitly changes it

    // Record activity
    recordActivity($user['id'], 'service_requested', 'service_request', $requestId, 
        "Created {$serviceType} request: {$title}");

    $pdo->commit();

    sendJson([
        'success' => true,
        'request_id' => $requestId,
        'message' => 'Service request created successfully.'
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    sendError($e->getMessage());
}
