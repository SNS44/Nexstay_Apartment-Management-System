<?php
/**
 * Admin Room Create API
 * Creates a new room. Admin only.
 */
require_once __DIR__ . '/helpers.php';

requireMethod('POST');
$admin = requireAdmin(); // Must be admin

$data = getJsonInput();
$pdo = getDb();

// Validate input
if (empty($data['roomNumber']) || empty($data['floor']) || empty($data['monthlyPrice'])) {
    sendError('Missing required fields: roomNumber, floor, monthlyPrice');
}

$roomNumber = trim($data['roomNumber']);
$floorNum   = (int)$data['floor'];
$price      = (float)$data['monthlyPrice'];
$amenities  = trim($data['amenities'] ?? '');

if ($price <= 0) {
    sendError('Monthly price must be greater than 0.');
}

try {
    $pdo->beginTransaction();

    // Get floor ID from floor number
    $stmt = $pdo->prepare('SELECT id FROM floors WHERE floor_number = ? LIMIT 1');
    $stmt->execute([$floorNum]);
    $floorRow = $stmt->fetch();
    if (!$floorRow) {
        throw new Exception('Invalid floor number. Floor does not exist.');
    }
    $floorId = (int)$floorRow['id'];

    // Check room number uniqueness
    $stmt = $pdo->prepare('SELECT id FROM rooms WHERE room_number = ?');
    $stmt->execute([$roomNumber]);
    if ($stmt->fetch()) {
        throw new Exception("Room number {$roomNumber} already exists.");
    }

    $stmt = $pdo->prepare('INSERT INTO rooms (room_number, floor_id, status, monthly_price, description, image_path, created_at)
        VALUES (?, ?, \'Available\', ?, ?, ?, NOW())');
    $stmt->execute([$roomNumber, $floorId, $price, $amenities, 'Upload/Room.png']);
    $roomId = (int)$pdo->lastInsertId();

    recordActivity($admin['id'], 'room_added', 'room', $roomId, "Added room #{$roomNumber} on floor {$floorNum}");

    $pdo->commit();
    sendJson(['success' => true, 'message' => "Room #{$roomNumber} created successfully.", 'room_id' => $roomId]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    sendError($e->getMessage());
}
