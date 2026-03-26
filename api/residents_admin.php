<?php
require_once __DIR__ . '/helpers.php';

requireMethod('GET');
$admin = requireAdmin();

try {
    $pdo = getDb();
    
    // Fetch users who are residents, joined with their active booking and room
    // Using a more robust query to handle schema variations discovered earlier
    
    $stmt = $pdo->query("SHOW COLUMNS FROM bookings");
    $bookingCols = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $hasCheckIn = in_array('check_in', $bookingCols);
    $checkInCol = $hasCheckIn ? 'check_in' : 'move_in_date';
    $checkOutCol = $hasCheckIn ? 'check_out' : 'DATE_ADD(move_in_date, INTERVAL duration_months MONTH)';

    $sql = "SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.phone, 
                b.status as booking_status,
                r.room_number,
                r.id as room_id,
                r.floor_id as floor,
                b.{$checkInCol} as check_in_date,
                (CASE WHEN b.{$checkOutCol} IS NULL THEN DATE_ADD(b.{$checkInCol}, INTERVAL 12 MONTH) ELSE b.{$checkOutCol} END) as check_out_date
            FROM users u
            LEFT JOIN bookings b ON u.id = b.user_id AND b.status IN ('Active', 'Occupied')
            LEFT JOIN rooms r ON b.room_id = r.id
            WHERE u.is_resident = 1 OR b.status = 'Active' OR b.status = 'Occupied'
            GROUP BY u.id
            ORDER BY r.floor_id ASC, r.room_number ASC";
            
    $stmt = $pdo->query($sql);
    $residents = $stmt->fetchAll();

    // Map account status (if not in DB, assume active if they have an active booking)
    foreach ($residents as &$r) {
        $r['accountStatus'] = 'active'; // Default
        $r['id'] = (int)$r['id'];
        $r['floor'] = (int)($r['floor'] ?? 0);
    }

    sendJson([
        'success' => true,
        'residents' => $residents
    ]);

} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}
