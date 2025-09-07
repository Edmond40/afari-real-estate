import { Contact, RefreshCw, SquarePen, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import AddAgentModal from "./modals/agentModal/AddAgentModal";
import EditAgentModal from "./modals/agentModal/EditAgentModal";
import ConfirmDeleteModal from "./modals/agentModal/ConfirmDeleteModal";
import { useAgents } from '../../lib/hooks/useAgents';

function Agent() {
    const { 
        agents, 
        loading, 
        error, 
        remove, 
        removing,
        refetch: refresh
    } = useAgents({ page: 1, limit: 50 });
    
    const [showModal, setShowModal] = useState(false);
    const [editModal, setShowEditModal] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [agentToDelete, setAgentToDelete] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Inline SVG fallback for agent images
    const AGENT_FALLBACK = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="%23e5e7eb"><circle cx="12" cy="8" r="4"/><path d="M4 22c0-4 4-7 8-7s8 3 8 7"/></svg>';

    // Delete agent handler
    const handleDeleteAgent = async (id, name) => {
        setAgentToDelete({ id, name });
        setConfirmDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!agentToDelete) return;
        
        try {
            await remove(agentToDelete.id);
            toast.success('Agent deleted successfully');
        } catch (error) {
            console.error('Failed to delete agent:', error);
            toast.error(error.message || 'Failed to delete agent');
        } finally {
            setConfirmDeleteModal(false);
            setAgentToDelete(null);
        }
    };

    const handleRefresh = async () => {
        try {
            setIsRefreshing(true);
            await refresh();
        } catch (error) {
            console.error('Failed to refresh agents:', error);
            toast.error('Failed to refresh agents');
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleCancelDelete = () => {
        setConfirmDeleteModal(false);
        setAgentToDelete(null);
    };

    const renderAgentRow = (agent) => {
        const agentImage = agent.image || AGENT_FALLBACK;
        const displayImage = agentImage.startsWith('http') || agentImage.startsWith('data:') 
            ? agentImage 
            : agentImage.startsWith('/') ? agentImage : `/${agentImage}`;
            
        const propertyCount = agent.propertyCount || agent._count?.listings || 0;
        
        return (
            <tr key={agent.id} className="border-b border-gray-200">
                <td className="p-3">{agent.name}</td>
                <td>
                    <img 
                        src={displayImage} 
                        alt="agent" 
                        className='w-16 h-16 p-2 object-cover rounded-full'
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = AGENT_FALLBACK; }}
                    />
                </td>
                <td className="text-left py-3 px-4 font-medium text-gray-700">{agent.email}</td>
                <td className="text-left py-3 px-4 font-medium text-gray-700">{agent.phone || '—'}</td>
                <td className="text-left py-3 px-4 font-medium text-gray-700 w-full hidden">
                    {Array.isArray(agent.specialization) ? 
                        agent.specialization.join(', ') : 
                        (agent.specialization || '—')}
                </td>
                <td className="text-left py-3 px-4 font-medium">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                        agent.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        agent.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                        agent.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        agent.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                    }`}>
                        {agent.status?.replace('_', ' ') || 'UNKNOWN'}
                    </span>
                </td>
                <td className="text-left py-3 px-4 font-medium text-gray-700">{propertyCount}</td>
                <td className="text-left py-3 px-4 font-medium text-gray-700">
                    {agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : '—'}
                </td>
                <td className="text-left py-3 px-4 font-medium text-gray-700 max-w-xs">
                    <div className="line-clamp-2" title={agent.about || agent.description || ''}>
                        {agent.about || agent.description || '—'}
                    </div>
                </td>
                <td>
                    <div className="flex items-center gap-3">
                        <SquarePen 
                            size={25} 
                            className="text-blue-500 hover:text-blue-600 hover:scale-110 duration-300 cursor-pointer" 
                            onClick={() => { setSelectedAgent(agent); setShowEditModal(true); }}
                        />
                        <button 
                            disabled={removing}
                            onClick={() => handleDeleteAgent(agent.id, agent.name)}
                            className="text-red-500 hover:text-red-600 hover:scale-110 duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Trash2 size={25} />
                        </button>
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <div className="p-4 flex flex-col gap-3">
            <div className="bg-gray-100 flex justify-between items-center gap-4 rounded-lg shadow-sm p-4">
                <div className='flex gap-3 items-center'>
                    <Contact className='text-orange-400' size={24} />
                    <h1 className="text-xl font-semibold text-gray-700">Agent Management</h1>
                    {loading && <span className="text-sm text-gray-500 ml-2">Loading...</span>}
                    {error && <span className="text-sm text-red-500 ml-2">{error}</span>}
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                    >
                        <UserPlus size={16} />
                        <span>Add New Agent</span>
                    </button>
                </div>
            </div>

            {/* Modals */}
            {showModal && (
                <AddAgentModal 
                    onClose={() => {
                        setShowModal(false);
                    }} 
                />
            )}
            {editModal && selectedAgent && (
                <EditAgentModal 
                    agent={selectedAgent} 
                    onClose={() => { 
                        setShowEditModal(false); 
                        setSelectedAgent(null);
                    }}
                />
            )}
            {confirmDeleteModal && agentToDelete && (
                <ConfirmDeleteModal
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                    agentName={agentToDelete.name}
                />
            )}
            
            <div className="w-full overflow-x-auto border rounded-md bg-white">
                {loading && !agents?.length ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="p-4 text-red-500 text-center">
                        Failed to load agents. <button onClick={handleRefresh} className="text-blue-500 hover:underline">Try again</button>
                    </div>
                ) : !agents?.length ? (
                    <div className="p-8 text-center text-gray-500">
                        No agents found. <button onClick={() => setShowModal(true)} className="text-blue-500 hover:underline">Add your first agent</button>
                    </div>
                ) : (
                    <table className="min-w-6xl divide-y divide-gray-200">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-100">
                                <th className="text-left py-3 px-4 font-semibold text-gray-600">Name</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-600">Image</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-600">Phone</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-600 hidden">Specialization</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-600">Properties</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-600">Date Added</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-600">About</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {agents.map(renderAgentRow)}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Agent;
