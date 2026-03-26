<?php

require_once __DIR__ . '/helpers.php';

requireMethod('GET');

$roomId = isset($_GET['room_id']) ? (int)$_GET['room_id'] : 0;
if (!$roomId) {
    sendError('room_id is required.');
}

$pdo = getDb();

// Support multiple booking table schemas (new: check_in/check_out, old: move_in_date/duration_months)
$hasCheckIn = $pdo->query("SHOW COLUMNS FROM bookings LIKE 'check_in'")->rowCount() > 0;

if ($hasCheckIn) {
    $stmt = $pdo->prepare("SELECT id, check_in, check_out, status
                              FROM bookings
                             WHERE room_id = ?
                               AND status IN ('pending','approved','occupied')
                          ORDER BY check_in ASC");
    $stmt->execute([$roomId]);
    $rows = $stmt->fetchAll();

    $bookings = [];
    foreach ($rows as $r) {
        $bookings[] = [
            'id' => (int)$r['id'],
            'start' => $r['check_in'],
            'end' => $r['check_out'],
            'status' => strtolower((string)($r['status'] ?? 'pending')),
        ];
    }

    sendJson(['success' => true, 'bookings' => $bookings, 'schema' => 'check_in']);
}

// Old schema fallback
$stmt = $pdo->prepare("SELECT id, move_in_date, duration_months, status
                          FROM bookings
                         WHERE room_id = ?
                           AND status IN ('Pending','Approved','Active')
                      ORDER BY move_in_date ASC");
$stmt->execute([$roomId]);
$rows = $stmt->fetchAll();

$bookings = [];
foreach ($rows as $r) {
    $start = $r['move_in_date'];
    $months = (int)($r['duration_months'] ?? 1);
    $startDt = DateTime::createFromFormat('Y-m-d', $start) ?: null;
    if (!$startDt) {
        continue;
    }
    $endDt = (clone $startDt)->modify('+' . max($months, 1) . ' months');

    $statusRaw = (string)($r['status'] ?? 'Pending');
    $status = strtolower($statusRaw);
    if ($status === 'active') $status = 'occupied';
    if ($status === 'pending') $status = 'pending';
    if ($status === 'approved') $status = 'approved';

    $bookings[] = [
        'id' => (int)$r['id'],
        'start' => $startDt->format('Y-m-d'),
        'end' => $endDt->format('Y-m-d'),
        'status' => $status,
    ];
}

sendJson(['success' => true, 'bookings' => $bookings, 'schema' => 'move_in_date']);



