import { useState } from 'react';
import { User, Mail, Phone, Calendar, Eye, UserX, Search, Shield, X, MapPin, Clock } from 'lucide-react';
import { useData } from '../../context/DataContext';

export function UsersManagement() {
    const { usersList, loading, refreshAdminData } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const [viewUser, setViewUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleView = (u) => {
        setViewUser(u);
        setIsModalOpen(true);
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            const res = await fetch('/api/user_manage.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId, action: 'delete' })
            });

            const data = await res.json();
            if (data.success) {
                alert('User deleted successfully');
                refreshAdminData();
            } else {
                alert(data.message || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        }
    };

    const filteredUsers = (usersList || []).filter(u => {
        if (roleFilter !== 'all' && u.role?.toLowerCase() !== roleFilter.toLowerCase()) return false;
        if (searchQuery && !u.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !u.email?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-violet-200/50 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-violet-600 text-sm">Total Users</p>
                            <h3 className="text-violet-900 mt-1">{usersList.length}</h3>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-violet-200/50 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-violet-600 text-sm">Administrators</p>
                            <h3 className="text-violet-900 mt-1">{usersList.filter(u => u.role?.toLowerCase() === 'admin').length}</h3>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-violet-200/50 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-violet-600 text-sm">Residents</p>
                            <h3 className="text-violet-900 mt-1">{usersList.filter(u => u.account_status === 'Active').length}</h3>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-4 border border-violet-200/50 shadow-lg">
                <div className="flex gap-4 items-center flex-wrap">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white/50 border border-violet-200/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                        />
                    </div>

                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2 bg-white/50 border border-violet-200/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                    >
                        <option value="all">All Roles</option>
                        <option value="user">Users</option>
                        <option value="admin">Admins</option>
                        <option value="staff">Staff</option>
                    </select>

                    <div className="text-sm text-violet-600 ml-auto">
                        {filteredUsers.length} of {usersList.length} users
                    </div>
                </div>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredUsers.map((u) => (
                    <div
                        key={u.id}
                        className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-violet-200/50 shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <div className="flex items-start gap-4">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${u.role?.toLowerCase() === 'admin' ? 'from-indigo-500 to-violet-600' : 'from-violet-400 to-purple-500'
                                }`}>
                                <User className="w-7 h-7 text-white" />
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h4 className="text-violet-900 font-bold">{u.name}</h4>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${u.role?.toLowerCase() === 'admin'
                                        ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                                        : 'bg-violet-100 text-violet-700 border-violet-200'
                                        }`}>
                                        {u.role}
                                    </span>
                                    {u.account_status === 'Active' && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 border border-green-200">
                                            Resident
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1.5 text-sm">
                                    <div className="flex items-center gap-2 text-violet-600">
                                        <Mail className="w-3.5 h-3.5" />
                                        <span className="truncate">{u.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-violet-600">
                                        <Phone className="w-3.5 h-3.5" />
                                        <span>{u.phone || 'No phone'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-violet-400 text-xs mt-2 pt-2 border-t border-violet-100/50">
                                        <Calendar className="w-3 h-3" />
                                        <span>Joined {formatDate(u.created_at)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => handleView(u)}
                                    className="p-2 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-lg transition-colors border border-violet-100"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(u.id)}
                                    className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors border border-red-100"
                                >
                                    <UserX className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-12 border border-violet-200/50 shadow-lg text-center">
                    <User className="w-12 h-12 text-violet-400 mx-auto mb-4" />
                    <p className="text-violet-600 text-lg font-medium">No users found</p>
                    <p className="text-violet-400 text-sm mt-1">Try adjusting your search or filters</p>
                </div>
            )}

            {/* User Profile Modal */}
            {isModalOpen && viewUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    />
                    <div className="bg-white rounded-[40px] w-full max-w-md relative z-10 shadow-2xl overflow-hidden border border-violet-100">
                        {/* Header/Banner */}
                        <div className="h-24 bg-gradient-to-r from-violet-600 to-indigo-600 relative">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all backdrop-blur-md"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Avatar Section */}
                        <div className="px-8 pb-8 -mt-12 relative">
                            <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-xl mb-4">
                                <div className="w-full h-full rounded-[20px] bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white">
                                    <User className="w-12 h-12" />
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">{viewUser.name}</h3>
                                <div className="flex gap-2 mt-2">
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${viewUser.role?.toLowerCase() === 'admin'
                                            ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                            : 'bg-violet-50 text-violet-600 border-violet-100'
                                        }`}>
                                        {viewUser.role}
                                    </span>
                                    {viewUser.account_status === 'Active' && (
                                        <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-green-50 text-green-600 border border-green-100">
                                            Trusted Resident
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-gray-50/50 p-4 rounded-3xl border border-gray-100 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-violet-600 shadow-sm">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</p>
                                            <p className="text-sm font-bold text-gray-900">{viewUser.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-violet-600 shadow-sm">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</p>
                                            <p className="text-sm font-bold text-gray-900">{viewUser.phone || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-violet-50/50 p-4 rounded-3xl border border-violet-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Calendar className="w-3.5 h-3.5 text-violet-600" />
                                            <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest">Join Date</p>
                                        </div>
                                        <p className="text-xs font-black text-violet-900">{formatDate(viewUser.created_at)}</p>
                                    </div>
                                    <div className="bg-indigo-50/50 p-4 rounded-3xl border border-indigo-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Shield className="w-3.5 h-3.5 text-indigo-600" />
                                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Account ID</p>
                                        </div>
                                        <p className="text-xs font-black text-indigo-900">#USER_{viewUser.id}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-full mt-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-gray-200"
                            >
                                Close Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
