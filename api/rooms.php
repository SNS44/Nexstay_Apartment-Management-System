<?php
/**
 * Public Rooms API
 * Returns all rooms grouped by floor with live status from database.
 * No caching. Always returns fresh data.
 */

ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once __DIR__ . '/helpers.php';

requireMethod('GET');

try {
    $pdo = getDb();

    // Auto-repair: rooms stuck as Booked when their booking is cancelled/rejected/expired
    try {
        $pdo->exec("
            UPDATE rooms r
            SET r.status = 'Available', r.resident_id = NULL
            WHERE r.status = 'Booked'
              AND NOT EXISTS (
                  SELECT 1 FROM bookings b
                  WHERE b.room_id = r.id
                    AND b.status = 'Approved'
              )
        ");
    } catch (Exception $autoFixErr) {
        error_log('Auto-fix Booked rooms error: ' . $autoFixErr->getMessage());
    }

    // Ensure rooms table exists
    $tableCheck = $pdo->query("SHOW TABLES LIKE 'rooms'");
    if ($tableCheck->rowCount() == 0) {
        ob_clean();
        sendJson([
            'success'    => true,
            'summary'    => ['totalRooms' => 0, 'counts' => ['available' => 0, 'booked' => 0, 'occupied' => 0, 'maintenance' => 0, 'inactive' => 0]],
            'roomsByFloor' => []
        ]);
    }

    // Primary query: join with floors table using monthly_price schema
    $rooms = [];
    try {
        $stmt = $pdo->query("
            SELECT r.id,
                   f.floor_number,
                   r.room_number,
                   r.status,
                   r.monthly_price  AS base_price_per_night,
                   r.monthly_price,
                   COALESCE(r.image_path, '/Upload/room.jpg') AS image_url,
                   r.description,
                   r.resident_id,
                   u.name           AS resident_name
            FROM rooms r
            JOIN floors f ON r.floor_id = f.id
            LEFT JOIN users u ON r.resident_id = u.id
            ORDER BY f.floor_number, r.room_number
        ");
        $rooms = $stmt->fetchAll();
    } catch (PDOException $joinErr) {
        // Fallback: try without floors join if schema differs
        error_log('Primary rooms query failed: ' . $joinErr->getMessage());
        try {
            $stmt = $pdo->query("
                SELECT r.id,
                       r.floor_id   AS floor_number,
                       r.room_number,
                       r.status,
                       r.monthly_price AS base_price_per_night,
                       r.monthly_price,
                       COALESCE(r.image_path, '/Upload/room.jpg') AS image_url,
                       r.description,
                       r.resident_id
                FROM rooms r
                ORDER BY r.floor_id, r.room_number
            ");
            $rooms = $stmt->fetchAll();
        } catch (PDOException $e2) {
            error_log('Fallback rooms query also failed: ' . $e2->getMessage());
            throw $e2;
        }
    }

    // Normalize data
    foreach ($rooms as &$room) {
        $room['base_price_per_night'] = (float)($room['base_price_per_night'] ?? 0);
        $room['monthly_price']        = (float)($room['monthly_price']        ?? $room['base_price_per_night']);
        $room['floor_number']         = (int)($room['floor_number']           ?? 0);
        $room['image_url']            = $room['image_url'] ?? '/Upload/room.jpg';
        $room['description']          = $room['description'] ?? 'Comfortable room with modern amenities.';
        $room['status']               = $room['status']      ?? 'Available';
        $room['resident_id']          = isset($room['resident_id']) ? (int)$room['resident_id'] : null;
    }
    unset($room);

    // Count by status (case-insensitive)
    $counts = ['available' => 0, 'booked' => 0, 'occupied' => 0, 'maintenance' => 0, 'inactive' => 0];
    foreach ($rooms as $room) {
        $s = strtolower($room['status'] ?? 'available');
        if (isset($counts[$s])) {
            $counts[$s]++;
        }
    }

    // Group by floor
    $grouped = [];
    foreach ($rooms as $room) {
        $floor = (int)($room['floor_number'] ?? 0);
        if (!isset($grouped[$floor])) {
            $grouped[$floor] = [];
        }
        $grouped[$floor][] = $room;
    }
    ksort($grouped);

    ob_clean();
    sendJson([
        'success'    => true,
        'summary'    => [
            'totalRooms' => count($rooms),
            'counts'     => $counts,
        ],
        'roomsByFloor' => $grouped,
    ]);

} catch (PDOException $e) {
    ob_clean();
    error_log('Rooms API DB Error: ' . $e->getMessage());
    sendError('Database error: ' . $e->getMessage(), 500);
} catch (Exception $e) {
    ob_clean();
    error_log('Rooms API Error: ' . $e->getMessage());
    sendError('Error: ' . $e->getMessage(), 500);
}
