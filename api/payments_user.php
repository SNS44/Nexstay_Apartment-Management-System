<?php
/**
 * Payments User API
 * Returns payment history for logged-in user
 */

require_once __DIR__ . '/helpers.php';

requireMethod('GET');
$user = requireLogin();

$pdo = getDb();

try {
    $stmt = $pdo->prepare("SELECT 
        p.id,
        p.booking_id,
        p.amount,
        p.payment_method,
        p.status,
        p.transaction_id,
        p.created_at,
        p.verified_at,
        r.room_number
        FROM payments p
        LEFT JOIN bookings b ON p.booking_id = b.id
        LEFT JOIN rooms r ON b.room_id = r.id
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC");

    $stmt->execute([$user['id']]);
    $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    sendJson([
        'success' => true,
        'payments' => $payments
    ]);
} catch (Exception $e) {
    sendError($e->getMessage());
}
