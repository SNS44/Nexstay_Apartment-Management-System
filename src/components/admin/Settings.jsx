import { Building2, Calendar, Wrench, Shield, Save, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export function Settings() {
    const [apartmentName, setApartmentName] = useState('NexStay Apartments');
    const [totalFloors, setTotalFloors] = useState(5);
    const [roomsPerFloor, setRoomsPerFloor] = useState(3);
    const [minPasswordLength, setMinPasswordLength] = useState(8);
    const [sessionTimeout, setSessionTimeout] = useState(30);

    const [enableDaysBooking, setEnableDaysBooking] = useState(true);
    const [enableWeeksBooking, setEnableWeeksBooking] = useState(true);
    const [enableMonthsBooking, setEnableMonthsBooking] = useState(true);

    const [enableHousekeeping, setEnableHousekeeping] = useState(true);
    const [enableMaintenance, setEnableMaintenance] = useState(true);
    const [enableLaundry, setEnableLaundry] = useState(true);
    const [enableRoomService, setEnableRoomService] = useState(true);

    return (
        <div className="space-y-6">
            {/* System Info Card */}
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-violet-200/50 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-violet-900">Apartment Information</h3>
                        <p className="text-violet-600 text-sm">Basic building configuration</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-violet-700 text-sm mb-2">Apartment Name</label>
                        <input
                            type="text"
                            value={apartmentName}
                            onChange={(e) => setApartmentName(e.target.value)}
                            className="w-full px-4 py-2 bg-white/50 border border-violet-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-violet-700 text-sm mb-2">Total Floors</label>
                            <input
                                type="number"
                                value={totalFloors}
                                onChange={(e) => setTotalFloors(parseInt(e.target.value))}
                                className="w-full px-4 py-2 bg-white/50 border border-violet-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                            />
                        </div>

                        <div>
                            <label className="block text-violet-700 text-sm mb-2">Rooms per Floor</label>
                            <input
                                type="number"
                                value={roomsPerFloor}
                                onChange={(e) => setRoomsPerFloor(parseInt(e.target.value))}
                                className="w-full px-4 py-2 bg-white/50 border border-violet-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-violet-50 rounded-lg border border-violet-200">
                        <p className="text-violet-700 text-sm">
                            Total Rooms: <span className="text-violet-900">{totalFloors * roomsPerFloor}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Booking Settings */}
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-violet-200/50 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-violet-900">Booking Duration Options</h3>
                        <p className="text-violet-600 text-sm">Configure available booking periods</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-violet-200/30 cursor-pointer hover:bg-white/70 transition-colors">
                        <span className="text-violet-900">Enable Daily Bookings</span>
                        <input
                            type="checkbox"
                            checked={enableDaysBooking}
                            onChange={(e) => setEnableDaysBooking(e.target.checked)}
                            className="w-5 h-5 text-violet-600 rounded focus:ring-violet-400"
                        />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-violet-200/30 cursor-pointer hover:bg-white/70 transition-colors">
                        <span className="text-violet-900">Enable Weekly Bookings</span>
                        <input
                            type="checkbox"
                            checked={enableWeeksBooking}
                            onChange={(e) => setEnableWeeksBooking(e.target.checked)}
                            className="w-5 h-5 text-violet-600 rounded focus:ring-violet-400"
                        />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-violet-200/30 cursor-pointer hover:bg-white/70 transition-colors">
                        <span className="text-violet-900">Enable Monthly Bookings</span>
                        <input
                            type="checkbox"
                            checked={enableMonthsBooking}
                            onChange={(e) => setEnableMonthsBooking(e.target.checked)}
                            className="w-5 h-5 text-violet-600 rounded focus:ring-violet-400"
                        />
                    </label>
                </div>
            </div>

            {/* Service Settings */}
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-violet-200/50 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Wrench className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-violet-900">Service Availability</h3>
                        <p className="text-violet-600 text-sm">Enable or disable service types</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-violet-200/30 cursor-pointer hover:bg-white/70 transition-colors">
                        <div>
                            <div className="text-violet-900">Housekeeping Service</div>
                            <div className="text-violet-600 text-sm">Room cleaning and tidying</div>
                        </div>
                        <input
                            type="checkbox"
                            checked={enableHousekeeping}
                            onChange={(e) => setEnableHousekeeping(e.target.checked)}
                            className="w-5 h-5 text-violet-600 rounded focus:ring-violet-400"
                        />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-violet-200/30 cursor-pointer hover:bg-white/70 transition-colors">
                        <div>
                            <div className="text-violet-900">Maintenance Service</div>
                            <div className="text-violet-600 text-sm">Repairs and technical support</div>
                        </div>
                        <input
                            type="checkbox"
                            checked={enableMaintenance}
                            onChange={(e) => setEnableMaintenance(e.target.checked)}
                            className="w-5 h-5 text-violet-600 rounded focus:ring-violet-400"
                        />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-violet-200/30 cursor-pointer hover:bg-white/70 transition-colors">
                        <div>
                            <div className="text-violet-900">Laundry Service</div>
                            <div className="text-violet-600 text-sm">Washing and cleaning clothes</div>
                        </div>
                        <input
                            type="checkbox"
                            checked={enableLaundry}
                            onChange={(e) => setEnableLaundry(e.target.checked)}
                            className="w-5 h-5 text-violet-600 rounded focus:ring-violet-400"
                        />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-violet-200/30 cursor-pointer hover:bg-white/70 transition-colors">
                        <div>
                            <div className="text-violet-900">Room Service</div>
                            <div className="text-violet-600 text-sm">Amenities and supplies delivery</div>
                        </div>
                        <input
                            type="checkbox"
                            checked={enableRoomService}
                            onChange={(e) => setEnableRoomService(e.target.checked)}
                            className="w-5 h-5 text-violet-600 rounded focus:ring-violet-400"
                        />
                    </label>
                </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-violet-200/50 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-violet-900">Security & Authentication</h3>
                        <p className="text-violet-600 text-sm">Password and session management</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-violet-700 text-sm mb-2">Minimum Password Length</label>
                        <input
                            type="number"
                            value={minPasswordLength}
                            onChange={(e) => setMinPasswordLength(parseInt(e.target.value))}
                            min="6"
                            max="20"
                            className="w-full px-4 py-2 bg-white/50 border border-violet-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                        />
                        <p className="text-violet-600 text-xs mt-1">Passwords must be at least {minPasswordLength} characters long</p>
                    </div>

                    <div>
                        <label className="block text-violet-700 text-sm mb-2">Session Timeout (minutes)</label>
                        <input
                            type="number"
                            value={sessionTimeout}
                            onChange={(e) => setSessionTimeout(parseInt(e.target.value))}
                            min="5"
                            max="120"
                            className="w-full px-4 py-2 bg-white/50 border border-violet-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                        />
                        <p className="text-violet-600 text-xs mt-1">Auto-logout after {sessionTimeout} minutes of inactivity</p>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-start gap-2">
                            <Shield className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-orange-900 text-sm">Security Best Practices</p>
                                <ul className="text-orange-700 text-xs mt-2 space-y-1 list-disc list-inside">
                                    <li>All passwords are hashed and never stored in plain text</li>
                                    <li>Admin login is separate from user login</li>
                                    <li>Role-based access control is enforced</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <button className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-shadow flex items-center justify-center gap-2">
                    <Save className="w-5 h-5" />
                    Save Settings
                </button>
                <button className="px-6 py-3 bg-white/70 hover:bg-white border border-violet-200 text-violet-700 rounded-xl transition-colors flex items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    Reset to Defaults
                </button>
            </div>
        </div>
    );
}
