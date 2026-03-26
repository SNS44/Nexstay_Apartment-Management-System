<?php
/**
 * Payment Update API
 * STRICT RULES:
 * - On Success:
 *   - Payment -> Success
 *   - Booking -> Active
 *   - Room -> Occupied, resident_id = user_id
 *   - User -> is_resident = 1
 * - On Failed:
 *   - Payment -> Failed
 *   - Booking stays Approved
 *   - Room stays Booked
 *   - User can retry payment
 */

require_once __DIR__ . '/helpers.php';

requireMethod('POST');
$user = requireLogin();

$data = getJsonInput();

$paymentId = isset($data['payment_id']) ? (int)$data['payment_id'] : 0;
$status = strtolower(trim($data['status'] ?? ''));
$transactionId = trim($data['transaction_id'] ?? '');
$gatewayResponse = $data['gateway_response'] ?? null;

if ($paymentId <= 0) {
    sendError('Payment ID is required.');
}

if (!in_array($status, ['success', 'failed'], true)) {
    sendError('Invalid status. Allowed: success, failed');
}

$pdo = getDb();

try {
    $pdo->beginTransaction();

    // Get payment details with booking and room info
    $stmt = $pdo->prepare("SELECT p.*, b.user_id as booking_user_id, b.id as booking_id, b.room_id, b.status as booking_status, r.room_number
        FROM payments p 
        LEFT JOIN bookings b ON p.booking_id = b.id 
        LEFT JOIN rooms r ON b.room_id = r.id
        WHERE p.id = ? FOR UPDATE");
    $stmt->execute([$paymentId]);
    $payment = $stmt->fetch();

    if (!$payment) {
        throw new Exception('Payment not found.');
    }

    if ((int)$payment['user_id'] !== $user['id']) {
        throw new Exception('This payment does not belong to you.');
    }
    
    if (empty($payment['booking_id'])) {
        throw new Exception('Payment is not associated with a booking.');
    }
    
    if (empty($payment['room_id'])) {
        throw new Exception('Booking is not associated with a room.');
    }

    // Validate current payment status - only Initiated or Pending can be updated
    $currentStatus = $payment['status'] ?? '';
    if (in_array($currentStatus, ['Success', 'Verified', 'Cancelled'], true)) {
        throw new Exception('Payment has already been completed with status: ' . $currentStatus);
    }

    // STRICT: Booking must be Approved to accept payment
    if ($payment['booking_status'] !== 'Approved') {
        throw new Exception('Booking is not in Approved status. Current: ' . ($payment['booking_status'] ?? 'Unknown'));
    }

    // Update payment status
    $newStatus = $status === 'success' ? 'Success' : 'Failed';
    $stmt = $pdo->prepare("UPDATE payments SET 
        status = ?, 
        transaction_id = ?,
        gateway_response = ?,
        completed_at = NOW()
        WHERE id = ?");
    $stmt->execute([$newStatus, $transactionId ?: null, $gatewayResponse ? json_encode($gatewayResponse) : null, $paymentId]);

    if ($status === 'success') {
        // ✅ SUCCESS: Activate booking and occupy room
        
        // 1. Booking -> Active
        $stmt = $pdo->prepare("UPDATE bookings SET status = 'Active' WHERE id = ?");
        $stmt->execute([$payment['booking_id']]);

        // 2. Room -> Occupied, assign resident
        $stmt = $pdo->prepare("UPDATE rooms SET status = 'Occupied', resident_id = ? WHERE id = ?");
        $stmt->execute([$user['id'], $payment['room_id']]);

        // 3. User -> Resident
        $stmt = $pdo->prepare("UPDATE users SET is_resident = 1 WHERE id = ?");
        $stmt->execute([$user['id']]);

        // 4. Record activities
        recordActivity($user['id'], 'booking_activated', 'booking', $payment['booking_id'], 
            "Booking #{$payment['booking_id']} activated! You are now a resident of room {$payment['room_number']}.");
        recordActivity($user['id'], 'payment_success', 'payment', $paymentId, 
            "Payment successful (TXN: {$transactionId}). Amount: ₹" . number_format($payment['amount'], 2));

        $message = 'Payment successful! Your booking is now Active and your room is assigned.';
    } else {
        // ❌ FAILED: Booking stays Approved, room stays Booked
        // User can retry payment - reset payment to Pending for retry
        $stmt = $pdo->prepare("UPDATE payments SET status = 'Failed' WHERE id = ?");
        $stmt->execute([$paymentId]);

        recordActivity($user['id'], 'payment_failed', 'payment', $paymentId, 
            "Payment failed. You can retry payment.");

        $message = 'Payment failed. Your booking remains approved - you can retry payment.';
    }

    $pdo->commit();

    sendJson([
        'success' => true,
        'payment_status' => $newStatus,
        'message' => $message
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    sendError($e->getMessage());
}
