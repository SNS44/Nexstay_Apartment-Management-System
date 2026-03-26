<?php
/**
 * Admin Bookings API
 * Returns all bookings with user, room, and payment info
 */

require_once __DIR__ . '/helpers.php';

requireMethod('GET');
$admin = requireAdmin();

$pdo = getDb();

// Run auto-expiry
expireStaleBookings();

$statusFilter = $_GET['status'] ?? null;
$allowedStatuses = ['Pending', 'Approved', 'Active', 'Rejected', 'Cancelled', 'Expired', 'Archived'];

$sql = "SELECT b.id, b.user_id, u.name AS user_name, u.email AS user_email,
               b.room_id, r.room_number, f.name as floor_name, f.floor_number,
               b.move_in_date, b.duration_months, b.monthly_amount, b.total_amount, b.status,
               b.created_at,
               p.id as payment_id, p.amount as payment_amount, p.status as payment_status, p.created_at as payment_date
          FROM bookings b
          LEFT JOIN users u ON b.user_id = u.id
          LEFT JOIN rooms r ON b.room_id = r.id
          LEFT JOIN floors f ON r.floor_id = f.id
          LEFT JOIN (
              SELECT p1.*
              FROM payments p1
              INNER JOIN (
                  SELECT booking_id, MAX(id) as max_id
                  FROM payments
                  GROUP BY booking_id
              ) p2 ON p1.id = p2.max_id
          ) p ON p.booking_id = b.id";

$params = [];
if ($statusFilter && in_array($statusFilter, $allowedStatuses, true)) {
    $sql .= ' WHERE b.status = ?';
    $params[] = $statusFilter;
} else {
    $sql .= " WHERE b.status != 'Archived' OR b.status IS NULL";
}

$sql .= ' ORDER BY b.created_at DESC';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

foreach ($rows as &$row) {
    $row['total_amount'] = $row['total_amount'] !== null ? (float)$row['total_amount'] : null;
    $row['monthly_amount'] = $row['monthly_amount'] !== null ? (float)$row['monthly_amount'] : null;
    $row['payment_amount'] = $row['payment_amount'] !== null ? (float)$row['payment_amount'] : null;
    $row['payment_id'] = $row['payment_id'] !== null ? (int)$row['payment_id'] : null;
}
unset($row);

sendJson([
    'success' => true,
    'bookings' => $rows,
]);
