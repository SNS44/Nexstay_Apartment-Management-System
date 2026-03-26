import { motion } from 'motion/react';
import { useInView } from '../../hooks/useInView';
import { Building } from 'lucide-react';
import { useData } from '../../context/DataContext';

export function BuildingOverview() {
    const [ref, isInView] = useInView({ threshold: 0.2 });
    const { roomsByFloor } = useData();

    // Define standard floor order
    const floorOrder = ['Fourth Floor', 'Third Floor', 'Second Floor', 'First Floor', 'Ground Floor'];
    
    // Color palette
    const colors = [
        { bg: '#F5EFFF', border: '#E5D9F2', icon: '#CDC1FF', accent: '#A294F9' }, // Fourth Floor
        { bg: '#E5D9F2', border: '#CDC1FF', icon: '#A294F9', accent: '#A294F9' }, // Third Floor
        { bg: '#CDC1FF', border: '#A294F9', icon: '#A294F9', accent: '#A294F9' }, // Second Floor
        { bg: '#E5D9F2', border: '#CDC1FF', icon: '#A294F9', accent: '#A294F9' }, // First Floor
        { bg: '#F5EFFF', border: '#E5D9F2', icon: '#CDC1FF', accent: '#A294F9' }, // Ground Floor
    ];

    const floors = floorOrder.map((floorName, idx) => {
        // Map display name to DB key (numeric floor number)
        let dbKey = '';
        if (floorName.includes('Fourth')) dbKey = 4;
        else if (floorName.includes('Third')) dbKey = 3;
        else if (floorName.includes('Second')) dbKey = 2;
        else if (floorName.includes('First')) dbKey = 1;
        else if (floorName.includes('Ground')) dbKey = 0;

        // Get rooms for this floor - check both numeric key and string key
        const roomsOnFloor = roomsByFloor[dbKey] || roomsByFloor[String(dbKey)] || [];

        const total = roomsOnFloor.length;
        // Check for available rooms (case-insensitive)
        const available = roomsOnFloor.filter(r => {
            const status = (r.status || '').toLowerCase();
            return status === 'available';
        }).length;
        
        // Calculate occupied rooms
        const occupied = roomsOnFloor.filter(r => {
            const status = (r.status || '').toLowerCase();
            return status === 'occupied' || status === 'booked';
        }).length;

        // Determine floor status: if no rooms or all occupied/booked, show "Occupied"
        const isOccupied = total === 0 || available === 0;
        const statusText = isOccupied ? 'Occupied' : `${available} Available`;

        return { 
            name: floorName, 
            rooms: total, 
            available, 
            occupied,
            isOccupied,
            statusText,
            color: colors[idx]
        };
    });

    return (
        <section ref={ref} className="py-24 px-6" style={{ backgroundColor: '#F5EFFF' }}>
            <div className="max-w-6xl mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-5xl text-center mb-4 text-[#A294F9]"
                >
                    Building Overview
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-lg text-gray-600 text-center mb-16"
                >
                    5 floors of thoughtfully designed living spaces
                </motion.p>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {floors.map((floor, index) => (
                        <motion.div
                            key={floor.name}
                            initial={{ opacity: 0, y: 50 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{
                                scale: 1.05,
                                y: -10,
                                boxShadow: `0 15px 30px rgba(162, 148, 249, 0.3)`
                            }}
                            className="relative rounded-2xl p-6 border-2 transition-all shadow-lg"
                            style={{
                                backgroundColor: floor.color.bg,
                                borderColor: floor.color.border,
                            }}
                        >
                            <div className="flex flex-col items-center gap-4">
                                <motion.div
                                    whileHover={{ rotate: 15 }}
                                    className="w-16 h-16 rounded-xl flex items-center justify-center"
                                    style={{
                                        backgroundColor: floor.color.icon,
                                    }}
                                >
                                    <Building className="w-8 h-8 text-white" />
                                </motion.div>

                                <div className="text-center">
                                    <h3 className="mb-2 text-gray-800 font-semibold">{floor.name}</h3>
                                    <p className="text-sm text-gray-600 mb-3">{floor.rooms} Rooms</p>

                                    <div 
                                        className="px-3 py-1 rounded-full text-sm font-medium"
                                        style={{
                                            backgroundColor: floor.isOccupied ? '#E5D9F2' : '#CDC1FF',
                                            color: floor.isOccupied ? '#6B5B95' : '#4A3C6F',
                                        }}
                                    >
                                        {floor.statusText}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
