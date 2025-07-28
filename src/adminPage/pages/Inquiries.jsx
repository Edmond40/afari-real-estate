import { useState, useContext } from "react";
import { CheckCheck, Eye, MessageCircleMore, Trash2 } from "lucide-react";
import EditInquiriesModal from "./modals/inquiriesModal/EditInquiriesModal";
import { ShopContext } from '../../context/ShopContext';

function Inquiries(){
    const [showInquiriesModal, setShowInquiriesModal] = useState(false);
    const { inquiries, deleteInquiry, updateInquiryStatus } = useContext(ShopContext);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState([]);

    // Filter inquiries by property, user, or status
    const filteredInquiries = inquiries.filter(inquiry =>
        (inquiry.propertyName?.toLowerCase().includes(search.toLowerCase()) ||
         inquiry.user?.toLowerCase().includes(search.toLowerCase()) ||
         inquiry.agentStatus?.toLowerCase().includes(search.toLowerCase()))
    );

    // Bulk select logic
    const allSelected = filteredInquiries.length > 0 && selected.length === filteredInquiries.length;
    function handleSelectAll(e) {
        if (e.target.checked) {
            setSelected(filteredInquiries.map(i => i.id));
        } else {
            setSelected([]);
        }
    }
    function handleSelect(id) {
        setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    }
    // Bulk delete
    function handleBulkDelete() {
        if (window.confirm('Delete selected inquiries?')) {
            selected.forEach(id => deleteInquiry(id));
            setSelected([]);
        }
    }
    // Bulk status update
    function handleBulkStatus(status) {
        selected.forEach(id => updateInquiryStatus(id, status));
        setSelected([]);
    }
    // Export to CSV
    function handleExportCSV() {
        const headers = ["Property", "User", "Phone", "Message", "Agent Info", "Date", "Status"];
        const rows = filteredInquiries.map(i => [i.propertyName, i.user, i.phone, i.message, i.agentName, i.date, i.agentStatus]);
        let csvContent = headers.join(",") + "\n" + rows.map(r => r.map(field => `"${(field||'').toString().replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'inquiries.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    return(
        <div className="p-4 flex flex-col gap-3">
            <div className="bg-gray-100 flex justify-between gap-4 rounded-lg shadow-sm p-6">
                <div className='flex gap-1 items-center'>
                    <MessageCircleMore className='text-violet-400'/>
                    <h1 className="text-xl font-semibold text-gray-700">Inquiries Management</h1>
                </div>
            </div>
            {/* Search bar */}
            <div className="flex justify-end my-2">
                <input
                    type="text"
                    placeholder="Search by property, user, or status..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full max-w-xs focus:outline-blue-500"
                />
            </div>
            {/* Bulk actions and Export */}
            <div className="flex flex-wrap gap-2 mb-2 items-center">
                <button onClick={handleBulkDelete} disabled={selected.length === 0} className="bg-red-500 text-white px-3 py-1 rounded disabled:opacity-50">Delete Selected</button>
                <button onClick={() => handleBulkStatus('pending')} disabled={selected.length === 0} className="bg-yellow-500 text-white px-3 py-1 rounded disabled:opacity-50">Mark Pending</button>
                <button onClick={() => handleBulkStatus('resolved')} disabled={selected.length === 0} className="bg-green-500 text-white px-3 py-1 rounded disabled:opacity-50">Mark Resolved</button>
                <button onClick={() => handleBulkStatus('closed')} disabled={selected.length === 0} className="bg-gray-500 text-white px-3 py-1 rounded disabled:opacity-50">Mark Closed</button>
                <button onClick={handleExportCSV} className="bg-blue-500 text-white px-3 py-1 rounded">Export CSV</button>
            </div>
            {/* EditInquiriesModal */}
            { showInquiriesModal && selectedInquiry && <EditInquiriesModal inquiry={selectedInquiry} onClose={() => { setShowInquiriesModal(false); setSelectedInquiry(null); }}/>}            
            <div className="w-full overflow-x-auto h-[60vh] border rounded-md">
                <table className="w-full border ">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-100">
                            <th><input type="checkbox" checked={allSelected} onChange={handleSelectAll} /></th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Property</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">User</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Phone</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Message</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Agent Info</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Date</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Status</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            filteredInquiries.map((inquiry) => (
                                <tr key={inquiry.id} className="border-b border-gray-200">
                                    <td><input type="checkbox" checked={selected.includes(inquiry.id)} onChange={() => handleSelect(inquiry.id)} /></td>
                                    <td className="p-3">{inquiry.propertyName}</td>
                                    <td className="text-left py-3 px-4 font-medium text-gray-700 ">{inquiry.user}</td>
                                    <td className="text-left py-3 px-4 font-medium text-gray-700 ">{inquiry.phone}</td>
                                    <td className="text-left py-3 px-4 font-medium text-gray-700 ">{inquiry.message}</td>
                                    <td className="text-left py-3 px-4 font-medium text-gray-700 ">{inquiry.agentName}</td>
                                    <td className="text-left py-3 px-4 font-medium text-gray-700 ">{inquiry.date}</td>
                                    <td className="text-left py-3 px-4 font-medium text-gray-700 ">
                                        <select
                                            value={inquiry.agentStatus || 'pending'}
                                            onChange={e => updateInquiryStatus(inquiry.id, e.target.value)}
                                            className="border rounded-md px-2 py-1"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </td>
                                    <td>
                                        <div className="flex justify-center items-center gap-3">
                                            <Eye size={25} className="text-blue-500 hover:text-blue-600 hover:scale-110 duration-300 cursor-pointer" onClick={()=> { setSelectedInquiry(inquiry); setShowInquiriesModal(true); }}/>
                                            <CheckCheck size={25} className="text-green-500 hover:text-green-600 hover:scale-110 duration-300 cursor-pointer"/>    
                                            <Trash2 size={25} className="text-red-500 hover:text-red-600 hover:scale-110 duration-300 cursor-pointer" onClick={() => deleteInquiry(inquiry.id)} />
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
export default Inquiries;