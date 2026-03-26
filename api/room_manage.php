<?php
/**
 * Admin Room Management API
 * Supports: add, edit, delete, update_status
 */

require_once __DIR__ . '/helpers.php';

requireMethod('POST');
$admin = requireAdmin();

$data = getJsonInput();
$action = strtolower(trim($data['action'] ?? ''));

if (!in_array($action, ['add', 'edit', 'delete', 'update_status'])) {
    sendError('Invalid action. Allowed: add, edit, delete, update_status');
}

$pdo = getDb();

try {
    $pdo->beginTransaction();

    switch ($action) {
        case 'add':
            $roomNumber = trim($data['room_number'] ?? '');
            $floorId = isset($data['floor_id']) ? (int)$data['floor_id'] : (isset($data['floor_number']) ? (int)$data['floor_number'] : 0);
            $price = isset($data['monthly_price']) ? (float)$data['monthly_price'] : (isset($data['rent']) ? (float)$data['rent'] : 0);
            $description = trim($data['description'] ?? '');
            $imageUrl = trim($data['image_url'] ?? '/Upload/room.jpg');

            if (!$roomNumber || $floorId <= 0 || $price <= 0) {
                throw new Exception('Room number, floor, and price are required.');
            }

            // Check for duplicate room number
            $stmt = $pdo->prepare("SELECT id FROM rooms WHERE room_number = ?");
            $stmt->execute([$roomNumber]);
            if ($stmt->fetch()) {
                throw new Exception("Room number {$roomNumber} already exists.");
            }

            $stmt = $pdo->prepare("INSERT INTO rooms (room_number, floor_id, monthly_price, status, image_url, created_at)
                VALUES (?, ?, ?, 'Available', ?, NOW())");
            $stmt->execute([$roomNumber, $floorId, $price, $imageUrl]);
            $roomId = (int)$pdo->lastInsertId();

            recordActivity($admin['id'], 'room_added', 'room', $roomId, "Added room #{$roomNumber} (Floor {$floorId})");

            $pdo->commit();
            sendJson(['success' => true, 'message' => "Room #{$roomNumber} added successfully.", 'room_id' => $roomId]);
            break;

        case 'edit':
            $roomId = isset($data['room_id']) ? (int)$data['room_id'] : 0;
            if (!$roomId) throw new Exception('Room ID is required.');

            $stmt = $pdo->prepare("SELECT id, room_number, status FROM rooms WHERE id = ? FOR UPDATE");
            $stmt->execute([$roomId]);
            $room = $stmt->fetch();
            if (!$room) throw new Exception('Room not found.');

            $updates = [];
            $params = [];
            
            if (isset($data['room_number'])) { $updates[] = 'room_number = ?'; $params[] = trim($data['room_number']); }
            if (isset($data['floor_id'])) { $updates[] = 'floor_id = ?'; $params[] = (int)$data['floor_id']; }
            if (isset($data['monthly_price'])) { $updates[] = 'monthly_price = ?'; $params[] = (float)$data['monthly_price']; }
            if (isset($data['rent'])) { $updates[] = 'monthly_price = ?'; $params[] = (float)$data['rent']; }
            if (isset($data['image_url'])) { $updates[] = 'image_url = ?'; $params[] = trim($data['image_url']); }

            if (empty($updates)) throw new Exception('No fields to update.');

            $params[] = $roomId;
            $stmt = $pdo->prepare("UPDATE rooms SET " . implode(', ', $updates) . " WHERE id = ?");
            $stmt->execute($params);

            recordActivity($admin['id'], 'room_edited', 'room', $roomId, "Updated room #{$room['room_number']}");
            
            $pdo->commit();
            sendJson(['success' => true, 'message' => "Room #{$room['room_number']} updated."]);
            break;

        case 'delete':
            $roomId = isset($data['room_id']) ? (int)$data['room_id'] : 0;
            if (!$roomId) throw new Exception('Room ID is required.');

            $stmt = $pdo->prepare("SELECT id, room_number, status FROM rooms WHERE id = ? FOR UPDATE");
            $stmt->execute([$roomId]);
            $room = $stmt->fetch();
            if (!$room) throw new Exception('Room not found.');

            if ($room['status'] === 'Occupied') {
                throw new Exception("Cannot delete room #{$room['room_number']} - it is currently occupied.");
            }
            if ($room['status'] === 'Booked') {
                throw new Exception("Cannot delete room #{$room['room_number']} - it has an active booking reservation.");
            }

            // Check for any non-cancelled bookings
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM bookings WHERE room_id = ? AND status NOT IN ('Cancelled', 'Rejected', 'Expired')");
            $stmt->execute([$roomId]);
            if ($stmt->fetchColumn() > 0) {
                throw new Exception("Cannot delete room #{$room['room_number']} - it has active bookings.");
            }

            $stmt = $pdo->prepare("DELETE FROM rooms WHERE id = ?");
            $stmt->execute([$roomId]);

            recordActivity($admin['id'], 'room_deleted', 'room', $roomId, "Deleted room #{$room['room_number']}");
            
            $pdo->commit();
            sendJson(['success' => true, 'message' => "Room #{$room['room_number']} deleted."]);
            break;

        case 'update_status':
            $roomId = isset($data['room_id']) ? (int)$data['room_id'] : 0;
            $newStatus = trim($data['status'] ?? '');
            
            if (!$roomId) throw new Exception('Room ID is required.');

            $allowedStatuses = ['Available', 'Booked', 'Occupied', 'Maintenance', 'Inactive'];
            if (!in_array($newStatus, $allowedStatuses, true)) {
                throw new Exception('Invalid status. Allowed: ' . implode(', ', $allowedStatuses));
            }

            $stmt = $pdo->prepare("SELECT id, room_number, status FROM rooms WHERE id = ? FOR UPDATE");
            $stmt->execute([$roomId]);
            $room = $stmt->fetch();
            if (!$room) throw new Exception('Room not found.');

            // If setting to Available, clear resident
            $extraUpdate = '';
            if ($newStatus === 'Available') {
                $extraUpdate = ', resident_id = NULL';
            }

            $stmt = $pdo->prepare("UPDATE rooms SET status = ? {$extraUpdate} WHERE id = ?");
            $stmt->execute([$newStatus, $roomId]);

            recordActivity($admin['id'], 'room_status_changed', 'room', $roomId,
                "Room #{$room['room_number']} status: {$room['status']} → {$newStatus}");
            
            $pdo->commit();
            sendJson(['success' => true, 'message' => "Room #{$room['room_number']} status updated to {$newStatus}."]);
            break;
    }

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    sendError($e->getMessage());
}
