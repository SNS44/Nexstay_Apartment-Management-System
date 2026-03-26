<?php
/**
 * Admin Booking Approval/Rejection API
 * STRICT RULES:
 * Approve:
 *   - booking status -> Approved
 *   - room status -> Booked (NOT Occupied)
 *   - Create payment record with status Pending
 *   - User can now see Pay Now button
 * Reject:
 *   - booking status -> Rejected
 *   - room stays Available (was not changed on booking creation)
 */

require_once __DIR__ . '/helpers.php';

requireMethod('POST');
$admin = requireAdmin();

$data = getJsonInput();
$bookingId = isset($data['booking_id']) ? (int)$data['booking_id'] : (isset($data['id']) ? (int)$data['id'] : 0);
$actionInput = strtolower(trim($data['action'] ?? $data['status'] ?? ''));
$action = null;
if (in_array($actionInput, ['approve', 'approved'])) {
    $action = 'approve';
} elseif (in_array($actionInput, ['reject', 'rejected'])) {
    $action = 'reject';
}
$notes = trim($data['notes'] ?? '');

if (!$bookingId || !in_array($action, ['approve', 'reject'])) {
    sendError('Valid booking ID and action (approve/reject) are required.');
}

$pdo = getDb();

try {
    // Run auto-expiry first
    expireStaleBookings();

    $pdo->beginTransaction();

    // 1. Get Booking Details
    $stmt = $pdo->prepare("SELECT b.*, r.status as room_status, r.room_number 
        FROM bookings b 
        LEFT JOIN rooms r ON b.room_id = r.id
        WHERE b.id = ? FOR UPDATE");
    $stmt->execute([$bookingId]);
    $booking = $stmt->fetch();

    if (!$booking) throw new Exception("Booking not found.");
    if ($booking['status'] !== 'Pending') {
        throw new Exception("This booking has already been processed (Current status: {$booking['status']}).");
    }

    $userId = (int)$booking['user_id'];
    $roomId = (int)$booking['room_id'];

    if ($action === 'approve') {
        // Prevent approval if room is not Available
        if ($booking['room_status'] !== 'Available') {
            throw new Exception("Room #{$booking['room_number']} is already {$booking['room_status']}. Cannot approve this booking.");
        }

        // 1. Update Booking to 'Approved'
        $stmt = $pdo->prepare("UPDATE bookings SET status = 'Approved', approved_by = ? WHERE id = ?");
        $stmt->execute([$admin['id'], $bookingId]);

        // 2. Create Payment Record (Pending) - allows user to see Pay Now
        $stmt = $pdo->prepare("SELECT id FROM payments WHERE booking_id = ? LIMIT 1");
        $stmt->execute([$bookingId]);
        if (!$stmt->fetch()) {
            $amount = (float)$booking['monthly_amount']; // First month rent
            $stmt = $pdo->prepare("INSERT INTO payments (user_id, booking_id, amount, payment_method, payment_type, status, created_at)
                VALUES (?, ?, ?, 'Pending', 'First_Month', 'Pending', NOW())");
            $stmt->execute([$userId, $bookingId, $amount]);
        }

        // 3. Room -> Booked (soft-lock, other users cannot book)
        $stmt = $pdo->prepare("UPDATE rooms SET status = 'Booked' WHERE id = ?");
        $stmt->execute([$roomId]);

        recordActivity($userId, 'booking_approved', 'booking', $bookingId, "Your booking for room #{$booking['room_number']} was approved. Please proceed to payment.");
        recordActivity($admin['id'], 'admin_approve', 'booking', $bookingId, "Approved booking #{$bookingId} for room #{$booking['room_number']}");
        
        $message = "Booking approved. Room is now reserved. User can proceed to payment.";
    } else {
        // REJECT
        $stmt = $pdo->prepare("UPDATE bookings SET status = 'Rejected' WHERE id = ?");
        $stmt->execute([$bookingId]);

        // Room was still Available (no change needed on reject from Pending)
        // But just in case, ensure it's Available
        $stmt = $pdo->prepare("UPDATE rooms SET status = 'Available', resident_id = NULL WHERE id = ? AND status != 'Occupied'");
        $stmt->execute([$roomId]);

        $rejectMsg = "Your booking for room #{$booking['room_number']} was rejected." . ($notes ? " Reason: {$notes}" : '');
        recordActivity($userId, 'booking_rejected', 'booking', $bookingId, $rejectMsg);
        recordActivity($admin['id'], 'admin_reject', 'booking', $bookingId, "Rejected booking #{$bookingId} for room #{$booking['room_number']}");
        
        $message = "Booking rejected.";
    }

    $pdo->commit();

    sendJson([
        'success' => true,
        'message' => $message
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    sendError($e->getMessage());
}
