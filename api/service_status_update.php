<?php
/**
 * Service Status Update (Admin)
 * Admin can update service status to: Assigned, In_Progress, Completed, Cancelled
 * 
 * STRICT ROOM STATUS RULES:
 * - Assigned/In_Progress: room -> Maintenance (only if room was Occupied or Available)
 * - Completed/Cancelled: room -> revert to its natural state based on active booking
 */

require_once __DIR__ . '/helpers.php';

requireMethod('POST');
$admin = requireAdmin();

$data = getJsonInput();
$requestId = isset($data['id']) ? (int)$data['id'] : (isset($data['request_id']) ? (int)$data['request_id'] : 0);
$newStatus = trim($data['status'] ?? '');
$notes = trim($data['notes'] ?? '');

if (!$requestId) {
    sendError('Service request ID is required.');
}

$allowedStatuses = ['Pending', 'Assigned', 'In_Progress', 'Completed', 'Cancelled'];
$statusMap = [
    'pending'    => 'Pending',
    'in_progress' => 'In_Progress',
    'in progress' => 'In_Progress',
    'inprogress' => 'In_Progress',
    'completed'  => 'Completed',
    'cancelled'  => 'Cancelled',
    'canceled'   => 'Cancelled',
    'rejected'   => 'Cancelled',
    'assigned'   => 'Assigned',
];
$normalizedStatus = $statusMap[strtolower($newStatus)] ?? $newStatus;

if (!in_array($normalizedStatus, $allowedStatuses, true)) {
    sendError('Invalid status. Allowed: ' . implode(', ', $allowedStatuses));
}

$pdo = getDb();

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("SELECT sr.id, sr.room_id, sr.user_id, sr.status, sr.service_type
                           FROM service_requests sr
                           WHERE sr.id = ? FOR UPDATE");
    $stmt->execute([$requestId]);
    $request = $stmt->fetch();

    if (!$request) {
        throw new Exception('Service request not found.');
    }

    // Update service request status
    $completedAt = ($normalizedStatus === 'Completed') ? ', completed_at = NOW()' : '';
    $stmt = $pdo->prepare("UPDATE service_requests SET
        status = ?,
        admin_notes = CONCAT(IFNULL(admin_notes, ''), ?)
        {$completedAt}
        WHERE id = ?");
    $noteText = $notes ? "\n[" . date('Y-m-d H:i:s') . " by Admin] " . $notes : '';
    $stmt->execute([$normalizedStatus, $noteText, $requestId]);

    // Smart Room Status Management
    if ($request['room_id']) {
        $roomId = (int)$request['room_id'];

        if ($normalizedStatus === 'Assigned' || $normalizedStatus === 'In_Progress') {
            // Only put to Maintenance if room is in a valid state
            $stmt = $pdo->prepare("UPDATE rooms SET status = 'Maintenance' WHERE id = ? AND status IN ('Occupied', 'Available')");
            $stmt->execute([$roomId]);
        } elseif ($normalizedStatus === 'Completed' || $normalizedStatus === 'Cancelled') {
            // Restore room to correct status based on active booking
            $stmt = $pdo->prepare("SELECT status FROM bookings WHERE room_id = ? AND status = 'Active' LIMIT 1");
            $stmt->execute([$roomId]);
            $activeBooking = $stmt->fetch();

            $correctRoomStatus = $activeBooking ? 'Occupied' : 'Available';
            $stmt = $pdo->prepare("UPDATE rooms SET status = ? WHERE id = ? AND status = 'Maintenance'");
            $stmt->execute([$correctRoomStatus, $roomId]);
        }
    }

    recordActivity($request['user_id'], 'service_' . strtolower($normalizedStatus), 'service_request', $requestId,
        "Service request #{$requestId} updated to {$normalizedStatus}" . ($notes ? ": {$notes}" : ""));
    recordActivity($admin['id'], 'admin_service_update', 'service_request', $requestId,
        "Updated service #{$requestId} to {$normalizedStatus}");

    $pdo->commit();

    sendJson([
        'success'    => true,
        'message'    => "Service request updated to {$normalizedStatus}",
        'new_status' => $normalizedStatus
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    sendError($e->getMessage());
}
