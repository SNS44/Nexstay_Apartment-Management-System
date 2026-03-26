<?php
/**
 * Admin Room Update API
 * Updates room fields. Admin only.
 * NOTE: Status-only updates should use room_manage.php action=update_status
 */
require_once __DIR__ . '/helpers.php';

requireMethod('POST');
$admin = requireAdmin(); // Must be admin

$data = getJsonInput();
$pdo = getDb();

if (empty($data['id'])) {
    sendError('Missing room ID');
}

$roomId = (int)$data['id'];

try {
    $pdo->beginTransaction();

    // Verify room exists
    $stmt = $pdo->prepare('SELECT id, room_number, status FROM rooms WHERE id = ? FOR UPDATE');
    $stmt->execute([$roomId]);
    $room = $stmt->fetch();
    if (!$room) {
        throw new Exception('Room not found.');
    }

    $fields = [];
    $params = [];

    if (isset($data['roomNumber'])) {
        $fields[] = 'room_number = ?';
        $params[] = trim($data['roomNumber']);
    }
    if (isset($data['floor'])) {
        $stmt2 = $pdo->prepare('SELECT id FROM floors WHERE floor_number = ? LIMIT 1');
        $stmt2->execute([(int)$data['floor']]);
        $f = $stmt2->fetch();
        if ($f) {
            $fields[] = 'floor_id = ?';
            $params[] = (int)$f['id'];
        }
    }
    if (isset($data['status'])) {
        $allowed = ['Available', 'Booked', 'Occupied', 'Maintenance', 'Inactive'];
        if (!in_array($data['status'], $allowed, true)) {
            throw new Exception('Invalid status value.');
        }
        $fields[] = 'status = ?';
        $params[] = $data['status'];
        // Clear resident when setting Available
        if ($data['status'] === 'Available') {
            $fields[] = 'resident_id = NULL';
        }
    }
    if (isset($data['monthlyPrice'])) {
        $fields[] = 'monthly_price = ?';
        $params[] = (float)$data['monthlyPrice'];
    }
    if (isset($data['amenities'])) {
        $fields[] = 'description = ?';
        $params[] = trim($data['amenities']);
    }

    if (empty($fields)) {
        $pdo->rollBack();
        sendError('No fields to update');
    }

    $params[] = $roomId;
    $sql = 'UPDATE rooms SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    recordActivity($admin['id'], 'room_updated', 'room', $roomId, "Updated room #{$room['room_number']}");

    $pdo->commit();
    sendJson(['success' => true, 'message' => "Room #{$room['room_number']} updated successfully."]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    sendError($e->getMessage());
}
