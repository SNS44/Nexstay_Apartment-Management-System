<?php

ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once __DIR__ . '/helpers.php';

requireMethod('GET');

$id = $_GET['id'] ?? null;

if (!$id) {
    ob_clean();
    sendJson(['success' => false, 'message' => 'Room ID required'], 400);
}

try {
    $pdo = getDb();
    
    // Check what columns exist
    $stmt = $pdo->query("SHOW COLUMNS FROM rooms");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $hasFloorId = in_array('floor_id', $columns);
    $hasFloorNumber = in_array('floor_number', $columns);
    $hasRent = in_array('rent', $columns);
    $hasMonthlyPrice = in_array('monthly_price', $columns);
    $hasBasePrice = in_array('base_price_per_night', $columns);
    $hasImageUrl = in_array('image_url', $columns);
    $hasImagePath = in_array('image_path', $columns);
    $hasDescription = in_array('description', $columns);
    
    // Build query based on schema
    if ($hasFloorId && $hasRent) {
        // Your actual schema
        $floorTableCheck = $pdo->query("SHOW TABLES LIKE 'floors'");
        if ($floorTableCheck->rowCount() > 0) {
            $query = 'SELECT r.id, f.floor_number, r.room_number, r.status, r.rent as base_price_per_night, r.rent as monthly_price, r.image_url, r.description
                      FROM rooms r 
                      JOIN floors f ON r.floor_id = f.id 
                      WHERE r.id = ?';
        } else {
            $query = 'SELECT r.id, r.floor_id as floor_number, r.room_number, r.status, r.rent as base_price_per_night, r.rent as monthly_price, r.image_url, r.description
                      FROM rooms r 
                      WHERE r.id = ?';
        }
    } else {
        // Fallback schema
        $selectCols = ['r.id', 'r.room_number', 'r.status'];
        if ($hasFloorNumber) $selectCols[] = 'r.floor_number';
        if ($hasBasePrice) $selectCols[] = 'r.base_price_per_night';
        if ($hasMonthlyPrice) $selectCols[] = 'r.monthly_price';
        if ($hasImagePath) $selectCols[] = 'r.image_path';
        if ($hasImageUrl) $selectCols[] = 'r.image_url';
        if ($hasDescription) $selectCols[] = 'r.description';
        
        $query = 'SELECT ' . implode(', ', $selectCols) . ' FROM rooms r WHERE r.id = ?';
    }
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([$id]);
    $room = $stmt->fetch();
    
    if (!$room) {
        ob_clean();
        sendJson(['success' => false, 'message' => 'Room not found'], 404);
    }
    
    // Normalize data
    $room['base_price_per_night'] = (float)($room['base_price_per_night'] ?? $room['monthly_price'] ?? $room['rent'] ?? 0);
    $room['monthly_price'] = (float)($room['monthly_price'] ?? $room['rent'] ?? $room['base_price_per_night'] ?? 0);
    $room['floor_number'] = (int)($room['floor_number'] ?? 0);
    $room['image_url'] = $room['image_url'] ?? $room['image_path'] ?? '/Upload/room.jpg';
    $room['image_path'] = $room['image_url'] ?? $room['image_path'] ?? '/Upload/room.jpg';
    $room['description'] = $room['description'] ?? 'Comfortable room with modern amenities. Perfect for long-term stays.';
    
    // Default amenities
    $room['amenities'] = 'WiFi, TV, AC, Bathroom, Security, Parking';
    
    ob_clean();
    sendJson([
        'success' => true,
        'room' => $room
    ]);
    
} catch (PDOException $e) {
    ob_clean();
    error_log('Room get error: ' . $e->getMessage());
    sendJson(['success' => false, 'message' => 'Database error'], 500);
} catch (Exception $e) {
    ob_clean();
    sendJson(['success' => false, 'message' => $e->getMessage()], 500);
}

