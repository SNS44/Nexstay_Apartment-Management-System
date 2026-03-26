<?php
/**
 * User Bookings API
 * Returns all bookings for the logged-in user with payment info
 */

require_once __DIR__ . '/helpers.php';

requireMethod('GET');
$user = requireLogin();

// Auto-expire stale bookings before fetching (helpers.php loaded above)
expireStaleBookings();

$pdo = getDb();

$stmt = $pdo->prepare("
    SELECT b.id, b.room_id, r.room_number,
           f.name AS floor_name, f.floor_number,
           b.move_in_date, b.duration_months,
           b.monthly_amount, b.total_amount,
           b.status, b.payment_status,
           b.created_at,
           p.id     AS payment_id,
           p.amount AS payment_amount,
           p.status AS payment_status_detail
    FROM bookings b
    JOIN  rooms  r ON b.room_id   = r.id
    JOIN  floors f ON r.floor_id  = f.id
    LEFT JOIN payments p
           ON p.booking_id = b.id
          AND p.status IN ('Pending','Initiated','Failed','Success','Verified')
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
");
$stmt->execute([$user['id']]);
$bookings = $stmt->fetchAll();

foreach ($bookings as &$b) {
    $b['total_amount']   = $b['total_amount']   !== null ? (float)$b['total_amount']   : null;
    $b['monthly_amount'] = $b['monthly_amount'] !== null ? (float)$b['monthly_amount'] : null;
    $b['payment_amount'] = $b['payment_amount'] !== null ? (float)$b['payment_amount'] : null;
    $b['payment_id']     = $b['payment_id']     !== null ? (int)$b['payment_id']       : null;
}
unset($b);

sendJson([
    'success'  => true,
    'bookings' => $bookings,
]);
