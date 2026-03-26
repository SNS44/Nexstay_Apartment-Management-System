<?php
/**
 * Admin Service Requests API
 * Returns all service requests with user and room info
 */

require_once __DIR__ . '/helpers.php';

requireMethod('GET');
$admin = requireAdmin();

$pdo = getDb();

$statusFilter = $_GET['status'] ?? null;
$allowedStatuses = ['Pending', 'In_Progress', 'Completed', 'Cancelled', 'Assigned'];

$sql = "SELECT s.id, s.service_type, s.description, s.status,
               s.priority, s.admin_notes, s.completed_at,
               s.created_at,
               r.room_number, f.floor_number,
               u.name AS user_name, u.email AS user_email
          FROM service_requests s
          JOIN rooms r ON s.room_id = r.id
          JOIN floors f ON r.floor_id = f.id
          JOIN users u ON s.user_id = u.id";
$params = [];

if ($statusFilter && in_array($statusFilter, $allowedStatuses, true)) {
    $sql .= ' WHERE s.status = ?';
    $params[] = $statusFilter;
}

$sql .= ' ORDER BY s.created_at DESC';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

// Parse title from description
foreach ($rows as &$row) {
    $desc = $row['description'] ?? '';
    $parts = explode(': ', $desc, 2);
    $row['title'] = count($parts) > 1 ? $parts[0] : $desc;
    $row['description'] = count($parts) > 1 ? $parts[1] : $desc;
}
unset($row);

sendJson([
    'success' => true,
    'requests' => $rows,
]);
