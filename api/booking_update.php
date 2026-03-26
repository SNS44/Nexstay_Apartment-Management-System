<?php
/**
 * Booking Status Update (Admin)
 * For general status updates by admin.
 * Use booking_approve.php for approve/reject actions.
 */

require_once __DIR__ . '/helpers.php';

requireMethod('POST');
$admin = requireAdmin(); // Must be admin

$data = getJsonInput();
$bookingId = isset($data['id']) ? (int)$data['id'] : (isset($data['booking_id']) ? (int)$data['booking_id'] : 0);
$newStatus = ucfirst(strtolower(trim($data['status'] ?? '')));

// Redirect approve/reject to booking_approve.php
if (in_array($newStatus, ['Approved', 'Rejected'], true)) {
    sendError('Use /api/booking_approve.php for approval/rejection actions.');
}

$allowed = ['Active', 'Completed', 'Cancelled'];
if (!$bookingId || !in_array($newStatus, $allowed, true)) {
    sendError('Invalid booking or status. Allowed: ' . implode(', ', $allowed));
}

$pdo = getDb();

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare('SELECT id, user_id, room_id, status FROM bookings WHERE id = ? LIMIT 1 FOR UPDATE');
    $stmt->execute([$bookingId]);
    $booking = $stmt->fetch();

    if (!$booking) {
        throw new Exception('Booking not found.');
    }

    $currentStatus = $booking['status'];

    if ($currentStatus === $newStatus) {
        $pdo->commit();
        sendJson(['success' => true, 'message' => 'Status unchanged']);
    }

    // Prevent updating already terminal bookings
    if (in_array($currentStatus, ['Cancelled', 'Rejected', 'Expired'], true)) {
        throw new Exception('Cannot update a cancelled, rejected, or expired booking.');
    }

    // Update booking status
    $stmt = $pdo->prepare('UPDATE bookings SET status = ?, updated_at = NOW() WHERE id = ?');
    $stmt->execute([$newStatus, $bookingId]);

    // Handle room status based on new booking status
    if ($newStatus === 'Cancelled' || $newStatus === 'Completed') {
        // Free up the room - clear resident and set Available
        $stmt = $pdo->prepare('UPDATE rooms SET status = \'Available\', resident_id = NULL WHERE id = ?');
        $stmt->execute([$booking['room_id']]);
    }

    recordActivity((int)$booking['user_id'], 'booking_status_change', 'booking', $bookingId,
        "Booking status changed from {$currentStatus} to {$newStatus} by admin");

    // Refresh resident flag based on actual booking state
    refreshResidentFlag((int)$booking['user_id']);

    $pdo->commit();

    sendJson([
        'success' => true,
        'message' => "Booking updated to {$newStatus}"
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    sendError($e->getMessage());
}
