import { SquarePen, Trash2, UserPlus, Users } from "lucide-react";
import { useState, useMemo } from "react";
import AddUserModal from "./modals/AddUserModal";
import EditUserModal from "./modals/EditUserModal";
import { useUsers } from '../../lib/hooks/useUsers';

function User(){
    const [search, setSearch] = useState("");
    const { users, loading, create, update, remove } = useUsers({ page: 1, limit: 50, search });
    const [showModal, setShowModal] = useState(false);
    const [editModal, setShowEditModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null);

    // Filtered users
    const filteredUsers = useMemo(() => {
        const list = Array.isArray(users) ? users : [];
        if (!search) return list;
        const q = search.toLowerCase();
        return list.filter(user =>
            (user.name || '').toLowerCase().includes(q) ||
            (user.email || '').toLowerCase().includes(q) ||
            (user.role || '').toLowerCase().includes(q)
        );
    }, [users, search]);

    // Export users as CSV
    const handleExportCSV = () => {
        const headers = ["Name", "Email", "Joined", "Role"];
        const rows = filteredUsers.map(user => [user.name, user.email, (user.joined || user.createdAt || ''), user.role]);
        let csvContent = headers.join(",") + "\n" + rows.map(r => r.map(field => `"${field.replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'users.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return(
        <div className="p-4 flex flex-col gap-3">
            <div className="bg-gray-100 flex justify-between gap-4 rounded-lg shadow-sm p-6">
                <div className='flex gap-1 items-center'>
                    <Users className="text-indigo-400"/>
                    <h1 className="text-xl font-semibold text-gray-700">User Management</h1>
                </div>
                <div className="flex items-center gap-1 bg-blue-500 text-white p-2 rounded-md hover:scale-110 duration-300 cursor-pointer" onClick={() => setShowModal(true)}>
                    <UserPlus />
                    <span>Add User</span>
                </div>
            </div>
            {/* Search bar and Export button */}
            <div className="flex justify-between items-center my-2 gap-2 flex-wrap">
                <input
                    type="text"
                    placeholder="Search by name, email, or role..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full max-w-xs focus:outline-blue-500"
                />
                <button
                    onClick={handleExportCSV}
                    className="ml-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 duration-200"
                >
                    Export CSV
                </button>
            </div>
            {/* AddUserModal */}
            { showModal && <AddUserModal onClose={() => setShowModal(false)} onAddUser={async (payload) => {
                await create(payload);
            }}/>}
            { editModal && selectedUser && (
                <EditUserModal
                    onClose={() => { setShowEditModal(false); setSelectedUser(null); }}
                    user={selectedUser}
                    onEditUser={async (updates) => {
                        await update({ id: updates.id, name: updates.name, email: updates.email, role: updates.role });
                    }}
                />
            )}
            <div className="w-full overflow-x-auto py-6 h-[60vh] border rounded-md">
                <table className="w-full border">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-100">
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Name</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Email</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Joined</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Role</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            (loading ? [] : filteredUsers).map((user) => (
                                <tr key={user.id} className="border-b border-gray-200">
                                    <td className="py-3 px-4">{user.name}</td>
                                    <td className="py-3 px-4">{user.email}</td>
                                    <td className="py-3 px-4">{user.joined || new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="py-3 px-4">{user.role}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <SquarePen size={25} className="text-blue-500 hover:text-blue-600 hover:scale-110 duration-300 cursor-pointer" onClick={()=> { setSelectedUser(user); setShowEditModal(true); }}/>
                                            <Trash2 size={25} className="text-red-500 hover:text-red-600 hover:scale-110 duration-300 cursor-pointer" onClick={() => remove(user.id)} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default User;