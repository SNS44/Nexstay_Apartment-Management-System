// Mock data for NexStay Admin Dashboard - Aligned with database.sql

// Status Constants
export const RoomStatus = {
    AVAILABLE: 'Available',
    OCCUPIED: 'Occupied',
    BOOKED: 'Booked',
    MAINTENANCE: 'Maintenance',
    CLEANING: 'Cleaning'
};

export const BookingStatus = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    ACTIVE: 'Active',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled'
};

export const ServiceStatus = {
    PENDING: 'Pending',
    ASSIGNED: 'Assigned',
    IN_PROGRESS: 'In_Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled'
};

// Rooms Data - Aligned with database.sql (15 rooms, 3 per floor)
// Floor 1 = Ground Floor (101-103)
// Floor 2 = First Floor (201-203)
// Floor 3 = Second Floor (301-303)
// Floor 4 = Third Floor (401-403)
// Floor 5 = Fourth Floor (501-503)

export const mockRooms = [
    // Floor 1: Ground Floor
    { id: '101', roomNumber: '101', floor: 1, floorName: 'Ground Floor', status: RoomStatus.AVAILABLE, monthlyPrice: 15000, amenities: 'WiFi, AC, TV, Attached Bathroom', currentResident: null },
    { id: '102', roomNumber: '102', floor: 1, floorName: 'Ground Floor', status: RoomStatus.AVAILABLE, monthlyPrice: 15000, amenities: 'WiFi, AC, TV, Attached Bathroom', currentResident: null },
    { id: '103', roomNumber: '103', floor: 1, floorName: 'Ground Floor', status: RoomStatus.AVAILABLE, monthlyPrice: 15000, amenities: 'WiFi, AC, TV, Attached Bathroom', currentResident: null },

    // Floor 2: First Floor
    { id: '201', roomNumber: '201', floor: 2, floorName: 'First Floor', status: RoomStatus.AVAILABLE, monthlyPrice: 15000, amenities: 'WiFi, AC, TV, Attached Bathroom', currentResident: null },
    { id: '202', roomNumber: '202', floor: 2, floorName: 'First Floor', status: RoomStatus.AVAILABLE, monthlyPrice: 15000, amenities: 'WiFi, AC, TV, Attached Bathroom', currentResident: null },
    { id: '203', roomNumber: '203', floor: 2, floorName: 'First Floor', status: RoomStatus.AVAILABLE, monthlyPrice: 15000, amenities: 'WiFi, AC, TV, Attached Bathroom', currentResident: null },

    // Floor 3: Second Floor
    { id: '301', roomNumber: '301', floor: 3, floorName: 'Second Floor', status: RoomStatus.AVAILABLE, monthlyPrice: 15000, amenities: 'WiFi, AC, TV, Attached Bathroom', currentResident: null },
    { id: '302', roomNumber: '302', floor: 3, floorName: 'Second Floor', status: RoomStatus.AVAILABLE, monthlyPrice: 15000, amenities: 'WiFi, AC, TV, Attached Bathroom', currentResident: null },
    { id: '303', roomNumber: '303', floor: 3, floorName: 'Second Floor', status: RoomStatus.AVAILABLE, monthlyPrice: 15000, amenities: 'WiFi, AC, TV, Attached Bathroom', currentResident: null },

    // Floor 4: Third Floor
    { id: '401', roomNumber: '401', floor: 4, floorName: 'Third Floor', status: RoomStatus.AVAILABLE, monthlyPrice: 15000, amenities: 'WiFi, AC, TV, Attached Bathroom', currentResident: null },
    { id: '402', roomNumber: '402', floor: 4, floorName: 'Third Floor', status: RoomStatus.AVAILABLE, monthlyPrice: 15000, amenities: 'WiFi, AC, TV, Attached Bathroom', currentResident: null },
    { id: '403', roomNumber: '403', floor: 4, floorName: 'Third Floor', status: RoomStatus.AVAILABLE, monthlyPrice: 15000, amenities: 'WiFi, AC, TV, Attached Bathroom', currentResident: null },

    // Floor 5: Fourth Floor
    { id: '501', roomNumber: '501', floor: 5, floorName: 'Fourth Floor', status: RoomStatus.AVAILABLE, monthlyPrice: 15000, amenities: 'WiFi, AC, TV, Attached Bathroom', currentResident: null },
    { id: '502', roomNumber: '502', floor: 5, floorName: 'Fourth Floor', status: RoomStatus.AVAILABLE, monthlyPrice: 15000, amenities: 'WiFi, AC, TV, Attached Bathroom', currentResident: null },
    { id: '503', roomNumber: '503', floor: 5, floorName: 'Fourth Floor', status: RoomStatus.AVAILABLE, monthlyPrice: 15000, amenities: 'WiFi, AC, TV, Attached Bathroom', currentResident: null },
];

// Bookings Data - Empty initially
export const mockBookings = [];

// Residents Data - Empty initially
export const mockResidents = [];

// Service Requests Data - Empty initially
export const mockServiceRequests = [];

// Activity Logs Data - Start with system initialization log
export const mockActivityLogs = [
    {
        id: 'log1',
        type: 'admin',
        action: 'System Initialized',
        details: 'NexStay Admin Dashboard initialized successfully',
        user: 'System',
        timestamp: new Date().toISOString(),
    },
];
