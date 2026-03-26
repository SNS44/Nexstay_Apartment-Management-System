<?php
require_once __DIR__ . '/helpers.php';

requireMethod('GET');
$admin = requireAdmin();

try {
    $pdo = getDb();
    
    // Fetch all activity, join with user for name
    // Support generic schema for user_activity
    $sql = "SELECT 
                a.id, 
                a.activity_type as type, 
                a.reference_type, 
                a.reference_id, 
                a.description as details, 
                a.created_at as timestamp,
                u.name as user
            FROM user_activity a
            LEFT JOIN users u ON a.user_id = u.id
            ORDER BY a.created_at DESC 
            LIMIT 100";
            
    $stmt = $pdo->query($sql);
    $activities = $stmt->fetchAll();

    // Mapping activity types to those expected by frontend (booking, service, user, admin)
    // If table doesn't have these, we'll map them
    foreach ($activities as &$a) {
        $a['id'] = (int)$a['id'];
        // activity_type can be: booking_created, room_added, payment_verified, etc.
        // We need to map these to categories: booking, service, user, admin
        $at = strtolower($a['type']);
        if (strpos($at, 'booking') !== false) $a['type'] = 'booking';
        elseif (strpos($at, 'service') !== false || strpos($at, 'maintenance') !== false) $a['type'] = 'service';
        elseif (strpos($at, 'user') !== false || strpos($at, 'resident') !== false) $a['type'] = 'user';
        elseif (strpos($at, 'admin') !== false || strpos($at, 'system') !== false) $a['type'] = 'admin';
        else $a['type'] = 'activity'; // fall through

        $a['action'] = ucwords(str_replace('_', ' ', $a['details'])); // Use description as action summary if needed
        // Or better yet, use a dedicated mapping
        if ($at === 'booking_created') $a['action'] = "New Booking Request";
        elseif ($at === 'payment_verified') $a['action'] = "Payment Verified";
        elseif ($at === 'room_added') $a['action'] = "New Room Added";
        else $a['action'] = $a['details'] ?: ucwords(str_replace('_', ' ', $a['type']));
    }

    sendJson([
        'success' => true,
        'activities' => $activities
    ]);

} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}
