<?php
/**
 * Admin Room Delete API
 * Deletes a room. Admin only.
 * Only rooms with no active/pending/approved bookings can be deleted.
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

    // Prevent deletion if room is occupied or has active bookings
    if ($room['status'] === 'Occupied') {
        throw new Exception("Cannot delete room #{$room['room_number']} - it is currently occupied by a resident.");
    }
    if ($room['status'] === 'Booked') {
        throw new Exception("Cannot delete room #{$room['room_number']} - it has a pending booking reservation.");
    }

    // Check for non-terminal bookings
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM bookings WHERE room_id = ? AND status NOT IN ('Cancelled', 'Rejected', 'Expired', 'Completed')");
    $stmt->execute([$roomId]);
    if ($stmt->fetchColumn() > 0) {
        throw new Exception("Cannot delete room #{$room['room_number']} - it has active bookings.");
    }

    $stmt = $pdo->prepare('DELETE FROM rooms WHERE id = ?');
    $stmt->execute([$roomId]);

    recordActivity($admin['id'], 'room_deleted', 'room', $roomId, "Deleted room #{$room['room_number']}");

    $pdo->commit();
    sendJson(['success' => true, 'message' => "Room #{$room['room_number']} deleted successfully."]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    sendError($e->getMessage());
}
