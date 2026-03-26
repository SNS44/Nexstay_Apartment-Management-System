<?php
/**
 * Current User API
 * Returns user profile, current booking (with status details), and payment info
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once __DIR__ . '/helpers.php';

requireMethod('GET');

try {
    $userSession = requireLogin();
    $pdo = getDb();

    // Run auto-expiry
    expireStaleBookings();

    // 1. User data
    $stmt = $pdo->prepare('SELECT id, name, email, phone, role, is_resident, created_at FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$userSession['id']]);
    $userData = $stmt->fetch();

    if (!$userData) {
        sendError('User not found.', 404);
    }

    // 2. Get current booking (most relevant one)
    $currentBooking = null;
    $pendingPayment = null;

    $stmt = $pdo->prepare("SELECT b.id, b.room_id, b.move_in_date, b.duration_months, 
                                  b.monthly_amount, b.total_amount, b.status,
                                  b.created_at as booking_date,
                                  r.room_number, r.floor_id as floor_number
                           FROM bookings b
                           JOIN rooms r ON b.room_id = r.id
                           WHERE b.user_id = ?
                             AND b.status IN ('Pending', 'Approved', 'Active')
                           ORDER BY FIELD(b.status, 'Active', 'Approved', 'Pending')
                           LIMIT 1");
    $stmt->execute([$userSession['id']]);
    $booking = $stmt->fetch();

    if ($booking) {
        $currentBooking = [
            'id' => (int)$booking['id'],
            'room_id' => (int)$booking['room_id'],
            'room_number' => $booking['room_number'],
            'floor_number' => $booking['floor_number'],
            'move_in_date' => $booking['move_in_date'],
            'duration_months' => (int)$booking['duration_months'],
            'monthly_amount' => (float)$booking['monthly_amount'],
            'total_amount' => (float)$booking['total_amount'],
            'status' => $booking['status'],
            'booking_date' => $booking['booking_date'],
        ];

        // If Approved, check for pending payment
        if ($booking['status'] === 'Approved') {
            $stmt = $pdo->prepare("SELECT id, amount, payment_method, status 
                                   FROM payments 
                                   WHERE booking_id = ? AND status IN ('Pending', 'Initiated', 'Failed')
                                   ORDER BY created_at DESC LIMIT 1");
            $stmt->execute([$booking['id']]);
            $payment = $stmt->fetch();
            if ($payment) {
                $pendingPayment = [
                    'id' => (int)$payment['id'],
                    'amount' => (float)$payment['amount'],
                    'payment_method' => $payment['payment_method'],
                    'status' => $payment['status'],
                ];
            }
        }
    }

    // Refresh resident flag based on actual booking status
    refreshResidentFlag($userSession['id']);

    // Re-read is_resident after refresh
    $stmt = $pdo->prepare('SELECT is_resident FROM users WHERE id = ?');
    $stmt->execute([$userSession['id']]);
    $isResident = (int)$stmt->fetchColumn();

    sendJson([
        'success' => true,
        'user' => [
            'id' => (int)$userData['id'],
            'name' => $userData['name'],
            'email' => $userData['email'],
            'phone' => $userData['phone'] ?? '',
            'role' => $userData['role'] ?? 'user',
            'is_resident' => $isResident,
            'created_at' => $userData['created_at'],
        ],
        'currentBooking' => $currentBooking,
        'pendingPayment' => $pendingPayment,
    ]);

} catch (PDOException $e) {
    error_log('User current API DB Error: ' . $e->getMessage());
    sendError('Database error', 500);
} catch (Exception $e) {
    $code = $e->getCode() === 401 ? 401 : 500;
    error_log('User current API Error: ' . $e->getMessage());
    sendError($e->getMessage(), $code);
}
