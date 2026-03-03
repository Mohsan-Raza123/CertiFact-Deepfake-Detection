import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaUsers, FaTrash, FaSearch, FaUserCircle, FaEnvelope, FaCalendarAlt } from 'react-icons/fa';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get('http://localhost:5000/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching users:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (userId) => {
        if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
        try {
            const token = localStorage.getItem('adminToken');
            await axios.delete(`http://localhost:5000/admin/delete-user/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Optimistic update
            setUsers(users.filter(u => u._id !== userId));
        } catch (err) {
            alert("Failed to delete user");
        }
    };

    // Filter Logic
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen bg-brand-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
                <p className="text-brand-blue text-xs uppercase tracking-widest animate-pulse">Loading User Registry...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-brand-black text-white pt-24 pb-12 px-6 selection:bg-brand-blue selection:text-white font-sans">
            
            {/* Background Decor */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none z-0" />

            <div className="container mx-auto max-w-7xl relative z-10">
                
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/10 pb-6">
                    <div>
                        <h2 className="text-brand-blue font-body tracking-[0.4em] text-xs uppercase font-bold mb-2 flex items-center gap-2">
                            <FaUsers /> Administration
                        </h2>
                        <h1 className="text-3xl md:text-5xl font-display font-bold uppercase tracking-widest leading-none">
                            User <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Management</span>
                        </h1>
                    </div>

                    {/* Search Bar */}
                    <div className="mt-6 md:mt-0 relative w-full md:w-64">
                        <input 
                            type="text" 
                            placeholder="SEARCH USERS..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/50 border border-white/20 px-4 py-2 pl-10 text-xs font-mono text-white focus:outline-none focus:border-brand-blue transition-colors uppercase placeholder-gray-600 rounded"
                        />
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
                    </div>
                </div>

                {/* --- USERS TABLE --- */}
                <div className="border border-white/10 bg-[#0c0c0c] rounded-lg overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                                    <th className="p-4 w-16 text-center">#</th>
                                    <th className="p-4">User Profile</th>
                                    <th className="p-4">Contact Info</th>
                                    <th className="p-4">Registration Date</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user, index) => (
                                        <motion.tr 
                                            key={user._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-white/[0.02] transition-colors group"
                                        >
                                            {/* Index Column */}
                                            <td className="p-4 text-center text-gray-600 font-mono text-xs">
                                                {(index + 1).toString().padStart(2, '0')}
                                            </td>

                                            {/* Profile Column */}
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue border border-brand-blue/20">
                                                        <FaUserCircle size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white">{user.name}</div>
                                                        <div className="text-[10px] text-gray-500 uppercase tracking-wide">Standard User</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Email Column */}
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <FaEnvelope className="text-[10px]" />
                                                    <span className="font-mono text-xs">{user.email}</span>
                                                </div>
                                            </td>

                                            {/* Date Column */}
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <FaCalendarAlt className="text-[10px]" />
                                                    <span className="text-xs">{new Date(user.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </td>

                                            {/* Actions Column */}
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => handleDelete(user._id)}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest group/btn"
                                                >
                                                    <FaTrash size={10} className="group-hover/btn:scale-110 transition-transform" />
                                                    Delete
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center text-gray-500 uppercase tracking-widest text-xs">
                                            No users found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Footer Stats */}
                    <div className="bg-white/5 border-t border-white/10 p-3 flex justify-between items-center px-6">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Total Users: {users.length}</span>
                        <div className="flex gap-2">
                             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                             <span className="text-[10px] text-green-500 uppercase tracking-widest">Directory Active</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminUsers;