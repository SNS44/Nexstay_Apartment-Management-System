<?php
/**
 * Create Booking API
 * STRICT RULES:
 * 1. Validate user and room
 * 2. Room must be Available
 * 3. User must not have existing active/pending booking
 * 4. Create booking with status = Pending
 * 5. Room stays Available (does NOT change)
 * 6. No payment record created yet
 */

require_once __DIR__ . '/helpers.php';

requireMethod('POST');
$user = requireLogin();

$data = getJsonInput();

$roomId = isset($data['room_id']) ? (int)$data['room_id'] : 0;
$startDate = trim((string)($data['start_date'] ?? $data['move_in_date'] ?? ''));
$durationMonths = isset($data['duration_months']) ? (int)$data['duration_months'] : 1;

if (!$roomId || !$startDate) {
    sendError('Room and start date are required.');
}

if ($durationMonths < 1 || $durationMonths > 36) {
    sendError('Duration must be between 1 and 36 months.');
}

$pdo = getDb();

try {
    // Run auto-expiry before booking
    expireStaleBookings();

    $pdo->beginTransaction();

    // 1. Validate Room
    $stmt = $pdo->prepare("SELECT id, status, monthly_price, room_number FROM rooms WHERE id = ? FOR UPDATE");
    $stmt->execute([$roomId]);
    $room = $stmt->fetch();

    if (!$room) throw new Exception("Room not found.");
    if ($room['status'] !== 'Available') {
        throw new Exception("Room {$room['room_number']} is not available (Status: {$room['status']}).");
    }

    // 2. Check User's existing bookings - one active/pending at a time
    $stmt = $pdo->prepare("SELECT id FROM bookings WHERE user_id = ? AND status IN ('Pending', 'Approved', 'Active') LIMIT 1");
    $stmt->execute([$user['id']]);
    if ($stmt->fetch()) {
        throw new Exception("You already have an active or pending booking.");
    }

    // 3. Calculate Pricing on backend
    $monthlyPrice = (float)$room['monthly_price'];
    $totalAmount = $monthlyPrice * $durationMonths;

    // 4. Create Booking with status = Pending
    $stmt = $pdo->prepare("INSERT INTO bookings (user_id, room_id, move_in_date, duration_months, monthly_amount, total_amount, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'Pending', NOW())");
    $stmt->execute([$user['id'], $roomId, $startDate, $durationMonths, $monthlyPrice, $totalAmount]);
    $bookingId = $pdo->lastInsertId();

    // 5. Room stays Available - NO room status change here

    // 6. Record Activity
    try {
        recordActivity($user['id'], 'booking_created', 'booking', $bookingId, "Requested booking for room {$room['room_number']}");
    } catch (Exception $e) {
        error_log("Failed to record activity: " . $e->getMessage());
    }

    $pdo->commit();

    sendJson([
        'success' => true,
        'message' => 'Booking request submitted! Waiting for admin approval.',
        'booking_id' => (int)$bookingId
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    sendError($e->getMessage());
}
