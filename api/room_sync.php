<?php
/**
 * Admin: Fix Room Synchronization
 * Corrects room status based on actual booking state.
 * Fixes any room stuck due to cancelled bookings not releasing the room.
 * POST body: { "room_id": N } to fix a specific room, or {} to fix all rooms.
 */

require_once __DIR__ . '/helpers.php';

requireMethod('POST');
$admin = requireAdmin();

$data    = getJsonInput();
$pdo     = getDb();
$roomId  = isset($data['room_id']) ? (int)$data['room_id'] : null;
$fixed   = [];

try {
    $pdo->beginTransaction();

    // Build WHERE clause
    $whereRoom = $roomId ? 'AND r.id = ' . $roomId : '';

    // Find rooms that are Booked or Occupied but have no Active/Approved booking
    $stmt = $pdo->query("
        SELECT r.id, r.room_number, r.status, r.resident_id
        FROM rooms r
        WHERE r.status IN ('Booked', 'Occupied')
        {$whereRoom}
          AND NOT EXISTS (
              SELECT 1 FROM bookings b
              WHERE b.room_id = r.id
                AND b.status IN ('Active', 'Approved')
          )
    ");
    $stuckRooms = $stmt->fetchAll();

    foreach ($stuckRooms as $room) {
        $stmt = $pdo->prepare("UPDATE rooms SET status = 'Available', resident_id = NULL WHERE id = ?");
        $stmt->execute([$room['id']]);
        $fixed[] = "Room #{$room['room_number']} reset from {$room['status']} to Available (no active/approved booking found)";
        recordActivity($admin['id'], 'admin_room_fix', 'room', $room['id'],
            "Fixed stuck room #{$room['room_number']}: {$room['status']} -> Available");
    }

    // Also: ensure Cancelled/Rejected bookings don't leave rooms in Booked state
    $stmt2 = $pdo->query("
        SELECT DISTINCT r.id, r.room_number, r.status
        FROM rooms r
        INNER JOIN bookings b ON b.room_id = r.id
        WHERE r.status = 'Booked'
          AND b.status IN ('Cancelled', 'Rejected', 'Expired')
          AND NOT EXISTS (
              SELECT 1 FROM bookings b2
              WHERE b2.room_id = r.id
                AND b2.status = 'Approved'
          )
        {$whereRoom}
    ");
    $cancelledStuck = $stmt2->fetchAll();
    foreach ($cancelledStuck as $room) {
        $stmt = $pdo->prepare("UPDATE rooms SET status = 'Available', resident_id = NULL WHERE id = ?");
        $stmt->execute([$room['id']]);
        $fixed[] = "Room #{$room['room_number']} freed from Booked (booking was cancelled/rejected/expired)";
    }

    $pdo->commit();

    sendJson([
        'success'  => true,
        'fixed'    => count($fixed),
        'details'  => $fixed,
        'message'  => count($fixed) > 0 ? 'Rooms synchronized successfully.' : 'All rooms already in correct state.'
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    sendError($e->getMessage());
}
