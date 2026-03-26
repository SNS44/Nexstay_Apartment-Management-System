import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children, user, refreshUser }) => {
    const [rooms, setRooms] = useState([]);
    const [roomsByFloor, setRoomsByFloor] = useState({});
    const [bookings, setBookings] = useState([]);
    const [residents, setResidents] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [requests, setRequests] = useState([]);
    const [activities, setActivities] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchRooms = async () => {
        try {
            const res = await fetch('/api/rooms.php');
            const text = await res.text();

            if (!res.ok) {
                console.error("Rooms API error:", res.status, text.substring(0, 200));
                setRoomsByFloor({});
                setRooms([]);
                setStats(null);
                return;
            }

            try {
                const data = JSON.parse(text);
                if (data.success) {
                    setRoomsByFloor(data.roomsByFloor || {});
                    setStats(data.summary || null);

                    // Flatten rooms for easier admin management
                    const flatRooms = [];
                    if (data.roomsByFloor) {
                        Object.values(data.roomsByFloor).forEach(floorRooms => {
                            flatRooms.push(...floorRooms);
                        });
                    }
                    setRooms(flatRooms);
                } else {
                    console.warn("Rooms API returned success=false:", data.message);
                    setRoomsByFloor({});
                    setRooms([]);
                }
            } catch (e) {
                console.error("Failed to parse JSON from /api/rooms.php", e, "Response:", text.substring(0, 200));
                setRoomsByFloor({});
                setRooms([]);
                setStats(null);
            }
        } catch (err) {
            console.error("Failed to fetch rooms:", err);
            setRoomsByFloor({});
            setRooms([]);
            setStats(null);
        }
    };

    const fetchBookings = async () => {
        if (!user) return;
        try {
            const endpoint = user.role?.toLowerCase() === 'admin' ? '/api/bookings_admin.php' : '/api/bookings_user.php';
            const res = await fetch(endpoint);

            // Check for authentication errors
            if (res.status === 401) {
                console.warn('Session expired while fetching bookings');
                return;
            }

            if (!res.ok) return;

            const data = await res.json().catch(() => ({ success: false }));
            console.log(`Fetched bookings (${endpoint}):`, data.bookings?.length || 0);
            if (data.success) {
                setBookings(data.bookings || []);
            }
        } catch (err) {
            console.error("Failed to fetch bookings:", err);
        }
    };

    const fetchRequests = async () => {
        if (!user) return;
        try {
            const endpoint = user.role?.toLowerCase() === 'admin' ? '/api/services_admin.php' : '/api/services_user.php';
            const res = await fetch(endpoint);

            // Check for authentication errors
            if (res.status === 401) {
                console.warn('Session expired while fetching services');
                return;
            }

            if (!res.ok) return;

            const data = await res.json().catch(() => ({ success: false }));
            console.log(`Fetched services (${endpoint}):`, data.requests?.length || 0);
            if (data.success) {
                setRequests(data.requests || []);
            }
        } catch (err) {
            console.error("Failed to fetch services:", err);
        }
    };

    const fetchResidents = async () => {
        if (!user || user.role?.toLowerCase() !== 'admin') return;
        try {
            const res = await fetch('/api/residents_admin.php');
            if (!res.ok) return;
            const data = await res.json().catch(() => ({ success: false }));
            if (data.success) {
                setResidents(data.residents || []);
            }
        } catch (err) {
            console.error("Failed to fetch residents:", err);
        }
    };

    const fetchUsersList = async () => {
        if (!user || user.role?.toLowerCase() !== 'admin') return;
        try {
            const res = await fetch('/api/users_admin.php');
            if (!res.ok) return;
            const data = await res.json().catch(() => ({ success: false }));
            console.log('Fetched users list:', data.users?.length || 0);
            if (data.success) {
                setUsersList(data.users || []);
            }
        } catch (err) {
            console.error("Failed to fetch users:", err);
        }
    };

    const fetchActivities = async () => {
        if (!user || user.role?.toLowerCase() !== 'admin') return;
        try {
            const res = await fetch('/api/activity_admin.php');
            if (!res.ok) return;
            const data = await res.json().catch(() => ({ success: false }));
            if (data.success) {
                setActivities(data.activities || []);
            }
        } catch (err) {
            console.error("Failed to fetch activities:", err);
        }
    };

    const refreshAll = async () => {
        setLoading(true);
        await Promise.all([
            fetchRooms(),
            user ? fetchBookings() : Promise.resolve(),
            user ? fetchRequests() : Promise.resolve(),
            (user && user.role?.toLowerCase() === 'admin') ? fetchResidents() : Promise.resolve(),
            (user && user.role?.toLowerCase() === 'admin') ? fetchUsersList() : Promise.resolve(),
            (user && user.role?.toLowerCase() === 'admin') ? fetchActivities() : Promise.resolve()
        ]);
        setLoading(false);
    };

    // Initial Load Only (Polling Disabled to Prevent Form Interruption)
    useEffect(() => {
        refreshAll();

        // Note: Auto-refresh disabled to prevent clearing forms while users are typing
        // Data will refresh on user actions (submit, approve, etc.)
    }, [user]);

    // Actions
    const addRoom = async (roomData) => {
        const res = await fetch('/api/room_create.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(roomData)
        });
        const json = await res.json();
        if (json.success) {
            await refreshAll(); // Global sync
            return true;
        }
        throw new Error(json.message);
    };

    const updateRoom = async (roomData) => {
        const res = await fetch('/api/room_update.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(roomData)
        });
        const json = await res.json();
        if (json.success) {
            await refreshAll();
            return true;
        }
        throw new Error(json.message);
    };

    const deleteRoom = async (id) => {
        const res = await fetch('/api/room_delete.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const json = await res.json();
        if (json.success) {
            await refreshAll();
            return true;
        }
        throw new Error(json.message);
    };

    const updateBookingStatus = async (id, status) => {
        const res = await fetch('/api/booking_update.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        });
        const json = await res.json();
        if (json.success) {
            await refreshAll();
            return true;
        }
        throw new Error(json.message);
    };

    const value = {
        rooms,
        roomsByFloor,
        bookings,
        residents,
        usersList,
        requests,
        activities,
        stats,
        loading,
        refreshRooms: fetchRooms,
        refreshBookings: fetchBookings,
        refreshServices: fetchRequests,
        refreshAdminData: async () => {
            await Promise.all([fetchUsersList(), fetchResidents(), fetchActivities()]);
        },
        refreshAll,
        refreshUser,
        addRoom,
        updateRoom,
        deleteRoom,
        updateBookingStatus,
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
