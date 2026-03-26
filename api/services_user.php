<?php
/**
 * User Service Requests API
 * Returns services AND access status based on booking state
 */

require_once __DIR__ . '/helpers.php';

requireMethod('GET');
$user = requireLogin();

$pdo = getDb();

// Check user's booking status
$stmt = $pdo->prepare("SELECT id, status, room_id FROM bookings 
    WHERE user_id = ? 
    AND status IN ('Pending', 'Approved', 'Active') 
    ORDER BY FIELD(status, 'Active', 'Approved', 'Pending')
    LIMIT 1");
$stmt->execute([$user['id']]);
$booking = $stmt->fetch();

$hasActiveBooking = $booking && $booking['status'] === 'Active';
$bookingStatus = $booking ? $booking['status'] : null;

// Always return services history (even if not active)
$stmt = $pdo->prepare("SELECT s.id, s.service_type, s.description, s.status,
       s.priority, s.admin_notes, s.completed_at,
       s.created_at,
       r.room_number
  FROM service_requests s
  JOIN rooms r ON s.room_id = r.id
 WHERE s.user_id = ?
 ORDER BY s.created_at DESC");
$stmt->execute([$user['id']]);
$rows = $stmt->fetchAll();

// Parse title from description (format: "title: description")
foreach ($rows as &$row) {
    $desc = $row['description'] ?? '';
    $parts = explode(': ', $desc, 2);
    $row['title'] = count($parts) > 1 ? $parts[0] : $desc;
    $row['description'] = count($parts) > 1 ? $parts[1] : $desc;
}
unset($row);

sendJson([
    'success' => true,
    'access' => $hasActiveBooking,
    'booking_status' => $bookingStatus,
    'requests' => $rows,
]);
