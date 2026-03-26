<?php
/**
 * Booking Cancel API
 * STRICT RULES:
 * - Only Pending or Approved bookings can be cancelled by user
 * - Active bookings cannot be cancelled by user (admin only)
 * - On cancel: booking -> Cancelled, room -> Available, payments -> Cancelled, resident_id -> NULL
 */

require_once __DIR__ . '/helpers.php';

requireMethod('POST');
$user = requireLogin();

$data      = getJsonInput();
$bookingId = isset($data['booking_id']) ? (int)$data['booking_id'] : 0;

if (!$bookingId) {
    sendError('Booking ID is required.');
}

$pdo = getDb();

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare('SELECT id, user_id, room_id, status FROM bookings WHERE id = ? FOR UPDATE');
    $stmt->execute([$bookingId]);
    $booking = $stmt->fetch();

    if (!$booking || (int)$booking['user_id'] !== $user['id']) {
        throw new Exception('Booking not found.');
    }

    $bookingStatus = $booking['status'];

    // STRICT: Only Pending or Approved can be cancelled by user
    if (!in_array($bookingStatus, ['Pending', 'Approved'], true)) {
        if ($bookingStatus === 'Active') {
            throw new Exception('Active bookings cannot be cancelled online. Please contact the admin for checkout/cancellation.');
        }
        throw new Exception("Cannot cancel a booking with status: {$bookingStatus}");
    }

    $roomId = (int)$booking['room_id'];

    // 1. Cancel booking
    $stmt = $pdo->prepare("UPDATE bookings SET status = 'Cancelled' WHERE id = ?");
    $stmt->execute([$bookingId]);

    // 2. Cancel any associated payments
    $stmt = $pdo->prepare("UPDATE payments SET status = 'Cancelled' WHERE booking_id = ? AND status IN ('Pending', 'Initiated', 'Failed')");
    $stmt->execute([$bookingId]);

    // 3. Always release room back to Available and clear resident
    //    When Pending: room was Available - no change needed, but we ensure it
    //    When Approved: room was Booked - must reset to Available
    //    Either way: clear any stale resident_id assignment
    $stmt = $pdo->prepare("UPDATE rooms SET status = 'Available', resident_id = NULL WHERE id = ? AND status IN ('Booked', 'Available')");
    $stmt->execute([$roomId]);

    // 4. Refresh resident flag
    refreshResidentFlag($user['id']);

    recordActivity($user['id'], 'booking_cancelled', 'booking', $bookingId,
        "Cancelled {$bookingStatus} booking #{$bookingId}. Room released back to Available.");

    $pdo->commit();
    sendJson(['success' => true, 'message' => 'Booking cancelled successfully. Room is now available.']);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    sendError($e->getMessage());
}
