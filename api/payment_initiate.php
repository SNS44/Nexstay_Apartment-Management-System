<?php
/**
 * Payment Initiate API
 * STRICT RULES:
 * - Booking must be Approved to initiate payment
 * - Amount comes from backend (monthly_amount from booking)
 * - Creates or updates payment record to Initiated status
 */

require_once __DIR__ . '/helpers.php';

requireMethod('POST');
$user = requireLogin();

$data = getJsonInput();

$bookingId = isset($data['booking_id']) ? (int)$data['booking_id'] : 0;
$paymentMethod = strtolower(trim($data['payment_method'] ?? ''));

if ($bookingId <= 0) {
    sendError('Booking ID is required.');
}

$allowedMethods = ['upi', 'debit_card', 'credit_card', 'net_banking', 'wallet', 'cash', 'offline'];
if (!in_array($paymentMethod, $allowedMethods, true)) {
    sendError('Invalid payment method. Allowed: ' . implode(', ', $allowedMethods));
}

$pdo = getDb();

try {
    $pdo->beginTransaction();

    // Get booking details - MUST be Approved
    $stmt = $pdo->prepare("SELECT b.*, r.monthly_price, r.room_number 
        FROM bookings b 
        LEFT JOIN rooms r ON b.room_id = r.id 
        WHERE b.id = ? AND b.user_id = ? FOR UPDATE");
    $stmt->execute([$bookingId, $user['id']]);
    $booking = $stmt->fetch();

    if (!$booking) {
        throw new Exception('Booking not found or does not belong to you.');
    }

    // STRICT: Only Approved bookings can initiate payment
    if ($booking['status'] !== 'Approved') {
        throw new Exception('Payment can only be initiated for Approved bookings. Current status: ' . $booking['status']);
    }

    // Amount is calculated by backend - first month's rent
    $amount = (float)$booking['monthly_amount'];
    if ($amount <= 0) {
        $amount = (float)$booking['monthly_price'];
    }
    if ($amount <= 0) {
        throw new Exception('Unable to determine payment amount. Please contact admin.');
    }

    // Check for existing pending/initiated payment for this booking
    $stmt = $pdo->prepare("SELECT id FROM payments 
        WHERE booking_id = ? AND status IN ('Pending', 'Initiated') LIMIT 1");
    $stmt->execute([$bookingId]);
    $existingPayment = $stmt->fetch();

    if ($existingPayment) {
        $paymentId = (int)$existingPayment['id'];
        // Update existing record to Initiated
        $stmt = $pdo->prepare("UPDATE payments SET 
            status = 'Initiated',
            payment_method = ?,
            amount = ?,
            initiated_at = NOW()
            WHERE id = ?");
        $stmt->execute([ucfirst($paymentMethod), $amount, $paymentId]);
    } else {
        // Create new payment record
        $stmt = $pdo->prepare("INSERT INTO payments 
            (booking_id, user_id, amount, payment_method, payment_type, status, initiated_at, created_at)
            VALUES (?, ?, ?, ?, 'First_Month', 'Initiated', NOW(), NOW())");
        $stmt->execute([
            $bookingId,
            $user['id'],
            $amount,
            ucfirst($paymentMethod)
        ]);
        $paymentId = (int)$pdo->lastInsertId();
    }

    // Record activity
    recordActivity($user['id'], 'payment_initiated', 'payment', $paymentId, 
        "Initiated payment of ₹" . number_format($amount, 2) . " via {$paymentMethod}");

    $pdo->commit();

    sendJson([
        'success' => true,
        'payment_id' => $paymentId,
        'amount' => $amount,
        'message' => 'Payment initiated successfully'
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    sendError($e->getMessage());
}
