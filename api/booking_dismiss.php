<?php
/**
 * User Booking Dismiss API
 * Allows users to "Archive" a Rejected, Cancelled or Expired booking 
 * so it no longer shows up as their primary "Active" status.
 */

require_once __DIR__ . '/helpers.php';

requireMethod('POST');
$user = requireLogin();
$data = getJsonInput();
$bookingId = isset($data['booking_id']) ? (int)$data['booking_id'] : 0;

if (!$bookingId) {
    sendError('Booking ID is required.');
}

$pdo = getDb();
try {
    // Check if the booking belongs to this user and is in a terminal/dismissible state
    $stmt = $pdo->prepare("SELECT id, status FROM bookings WHERE id = ? AND user_id = ?");
    $stmt->execute([$bookingId, $user['id']]);
    $booking = $stmt->fetch();

    if (!$booking) {
        throw new Exception("Booking not found or access denied.");
    }

    $terminalStates = ['Rejected', 'Cancelled', 'Expired', 'Completed'];
    if (!in_array($booking['status'], $terminalStates)) {
        throw new Exception("Only terminal bookings can be dismissed. Current status: {$booking['status']}");
    }

    // Update status to 'Archived' (Hidden from primary view)
    $stmt = $pdo->prepare("UPDATE bookings SET status = 'Archived' WHERE id = ?");
    $stmt->execute([$bookingId]);

    recordActivity($user['id'], 'booking_dismissed', 'booking', $bookingId, "Dissmissed notification for booking #{$bookingId}");

    sendJson(['success' => true, 'message' => 'Notification dismissed.']);
} catch (Exception $e) {
    sendError($e->getMessage());
}
