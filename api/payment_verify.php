<?php
/**
 * Admin Payment Verification API
 * Admin can manually verify a payment, which activates the booking
 * STRICT: Only Pending/Initiated/Failed payments for Approved bookings
 */

require_once __DIR__ . '/helpers.php';

requireMethod('POST');
$admin = requireAdmin();

$data = getJsonInput();
$bookingId = isset($data['booking_id']) ? (int)$data['booking_id'] : 0;
$paymentId = isset($data['payment_id']) ? (int)$data['payment_id'] : 0;
$action = strtolower(trim($data['action'] ?? 'verify'));

if (!$bookingId && !$paymentId) {
    sendError('Booking ID or Payment ID is required.');
}

$pdo = getDb();

try {
    $pdo->beginTransaction();

    // Get payment details
    if ($paymentId) {
        $stmt = $pdo->prepare("SELECT p.*, b.user_id as booking_user_id, b.room_id, b.status as booking_status, r.room_number
            FROM payments p 
            LEFT JOIN bookings b ON p.booking_id = b.id
            LEFT JOIN rooms r ON b.room_id = r.id
            WHERE p.id = ? FOR UPDATE");
        $stmt->execute([$paymentId]);
    } else {
        $stmt = $pdo->prepare("SELECT p.*, b.user_id as booking_user_id, b.room_id, b.status as booking_status, r.room_number
            FROM payments p 
            LEFT JOIN bookings b ON p.booking_id = b.id
            LEFT JOIN rooms r ON b.room_id = r.id
            WHERE p.booking_id = ? 
            ORDER BY p.created_at DESC LIMIT 1 FOR UPDATE");
        $stmt->execute([$bookingId]);
    }
    $payment = $stmt->fetch();

    if (!$payment) {
        throw new Exception('Payment not found.');
    }

    $actualBookingId = (int)$payment['booking_id'];
    $userId = (int)$payment['booking_user_id'];
    $roomId = (int)$payment['room_id'];

    if ($action === 'verify') {
        // STRICT: Booking must be Approved
        if ($payment['booking_status'] !== 'Approved') {
            throw new Exception("Booking must be Approved to verify payment. Current: {$payment['booking_status']}");
        }

        // Payment status doesn't need to be Success - admin can force verify
        $stmt = $pdo->prepare("UPDATE payments SET status = 'Verified', verified_at = NOW() WHERE id = ?");
        $stmt->execute([$payment['id']]);

        // Activate booking
        $stmt = $pdo->prepare("UPDATE bookings SET status = 'Active' WHERE id = ?");
        $stmt->execute([$actualBookingId]);

        // Room -> Occupied
        $stmt = $pdo->prepare("UPDATE rooms SET status = 'Occupied', resident_id = ? WHERE id = ?");
        $stmt->execute([$userId, $roomId]);

        // User -> Resident
        $stmt = $pdo->prepare("UPDATE users SET is_resident = 1 WHERE id = ?");
        $stmt->execute([$userId]);

        // Record activities
        recordActivity($userId, 'payment_verified', 'payment', (int)$payment['id'],
            "Payment verified by admin. Booking activated for room #{$payment['room_number']}.");
        recordActivity($admin['id'], 'admin_verify_payment', 'payment', (int)$payment['id'],
            "Verified payment #{$payment['id']} for booking #{$actualBookingId}");

        $message = "Payment verified. Booking #{$actualBookingId} is now Active.";
    } elseif ($action === 'fail') {
        // Mark payment as failed
        $stmt = $pdo->prepare("UPDATE payments SET status = 'Failed' WHERE id = ?");
        $stmt->execute([$payment['id']]);

        recordActivity($admin['id'], 'admin_fail_payment', 'payment', (int)$payment['id'],
            "Marked payment #{$payment['id']} as Failed");

        $message = "Payment marked as failed.";
    } else {
        throw new Exception("Invalid action. Allowed: verify, fail");
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
