<?php
/**
 * Admin Dashboard Summary
 * Returns counts for dashboard overview
 */

require_once __DIR__ . '/helpers.php';

requireMethod('GET');
$admin = requireAdmin();

$pdo = getDb();

// Run auto-expiry
expireStaleBookings();

try {
    // Room counts
    $stmt = $pdo->query("SELECT 
        COUNT(*) as total_rooms,
        SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'Booked' THEN 1 ELSE 0 END) as booked,
        SUM(CASE WHEN status = 'Occupied' THEN 1 ELSE 0 END) as occupied,
        SUM(CASE WHEN status = 'Maintenance' THEN 1 ELSE 0 END) as maintenance
        FROM rooms");
    $roomStats = $stmt->fetch();

    // Booking counts
    $stmt = $pdo->query("SELECT 
        COUNT(*) as total_bookings,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status = 'Expired' THEN 1 ELSE 0 END) as expired
        FROM bookings");
    $bookingStats = $stmt->fetch();

    // Payment stats
    $stmt = $pdo->query("SELECT 
        COUNT(*) as total_payments,
        SUM(CASE WHEN status IN ('Success', 'Verified') THEN amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN status = 'Pending' OR status = 'Initiated' THEN 1 ELSE 0 END) as pending_payments,
        SUM(CASE WHEN status IN ('Success', 'Verified') THEN 1 ELSE 0 END) as completed_payments,
        SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) as failed_payments
        FROM payments");
    $paymentStats = $stmt->fetch();

    // User counts
    $stmt = $pdo->query("SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN is_resident = 1 THEN 1 ELSE 0 END) as active_residents
        FROM users WHERE role != 'admin'");
    $userStats = $stmt->fetch();

    // Pending service requests
    $stmt = $pdo->query("SELECT COUNT(*) FROM service_requests WHERE status IN ('Pending', 'In_Progress')");
    $pendingServices = (int)$stmt->fetchColumn();

    // Recent activity
    $stmt = $pdo->query("SELECT a.activity_type, a.description, a.created_at, u.name as user_name
        FROM user_activity a
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC LIMIT 10");
    $recentActivity = $stmt->fetchAll();

    sendJson([
        'success' => true,
        'rooms' => [
            'total' => (int)$roomStats['total_rooms'],
            'available' => (int)$roomStats['available'],
            'booked' => (int)$roomStats['booked'],
            'occupied' => (int)$roomStats['occupied'],
            'maintenance' => (int)$roomStats['maintenance'],
        ],
        'bookings' => [
            'total' => (int)$bookingStats['total_bookings'],
            'pending' => (int)$bookingStats['pending'],
            'approved' => (int)$bookingStats['approved'],
            'active' => (int)$bookingStats['active'],
            'rejected' => (int)$bookingStats['rejected'],
            'cancelled' => (int)$bookingStats['cancelled'],
            'expired' => (int)$bookingStats['expired'],
        ],
        'payments' => [
            'total' => (int)$paymentStats['total_payments'],
            'total_revenue' => (float)$paymentStats['total_revenue'],
            'pending' => (int)$paymentStats['pending_payments'],
            'completed' => (int)$paymentStats['completed_payments'],
            'failed' => (int)$paymentStats['failed_payments'],
        ],
        'users' => [
            'total' => (int)$userStats['total_users'],
            'residents' => (int)$userStats['active_residents'],
        ],
        'pending_services' => $pendingServices,
        'recent_activity' => $recentActivity,
    ]);

} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}
