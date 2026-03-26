<?php
/**
 * Admin Payments Management API
 * Returns all payments with user/booking/room info
 */

require_once __DIR__ . '/helpers.php';

requireMethod('GET');
$admin = requireAdmin();

$pdo = getDb();

$statusFilter = $_GET['status'] ?? null;
$allowedStatuses = ['Pending', 'Initiated', 'Success', 'Failed', 'Cancelled', 'Verified'];

$sql = "SELECT p.id, p.booking_id, p.user_id, p.amount, p.payment_method, p.payment_type,
               p.status, p.transaction_id, p.created_at, p.completed_at, p.verified_at,
               u.name AS user_name, u.email AS user_email,
               r.room_number, r.floor_id as floor_number,
               b.status as booking_status
          FROM payments p
          LEFT JOIN users u ON p.user_id = u.id
          LEFT JOIN bookings b ON p.booking_id = b.id
          LEFT JOIN rooms r ON b.room_id = r.id";

$params = [];
if ($statusFilter && in_array($statusFilter, $allowedStatuses, true)) {
    $sql .= ' WHERE p.status = ?';
    $params[] = $statusFilter;
}

$sql .= ' ORDER BY p.created_at DESC';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

foreach ($rows as &$row) {
    $row['amount'] = (float)$row['amount'];
}
unset($row);

sendJson([
    'success' => true,
    'payments' => $rows,
]);
