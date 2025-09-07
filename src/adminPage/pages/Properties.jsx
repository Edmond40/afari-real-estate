import { useState } from 'react';
import { HousePlus, SquarePen, Trash2, UserPlus } from "lucide-react";
import { toast } from "react-toastify";
import { Link } from 'react-router-dom';
import { useListings } from '../../lib/hooks/useListings';
import ConfirmationModal from '../components/ConfirmationModal';

function Properties(){
    const { listings, remove, loading } = useListings();
    const [propertyToDelete, setPropertyToDelete] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    // Inline SVG placeholders to guarantee we always render a valid image
    const PROPERTY_FALLBACK = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="%23e5e7eb"><path d="M12 3l9 8h-3v10h-5v-6H11v6H6V11H3z"/></svg>';
    const AGENT_FALLBACK = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="%23e5e7eb"><circle cx="12" cy="8" r="4"/><path d="M4 22c0-4 4-7 8-7s8 3 8 7"/></svg>';

    // Delete property handler
    const handleDeleteClick = (id) => {
        setPropertyToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!propertyToDelete) return;
        
        try {
            await remove(propertyToDelete);
            toast.success('Property deleted successfully');
            setPropertyToDelete(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete property');
        }
    };

    return(
        <div className="p-4 flex flex-col gap-3">
            <div className="bg-gray-100 flex justify-between gap-4 rounded-lg shadow-sm p-6">
                <div className='flex gap-1 items-center'>
                    <HousePlus className='text-green-400'/>
                    <h1 className="text-xl font-semibold text-gray-700">Property Management</h1>
                </div>
                <Link to="/admin/add-property" className="flex items-center gap-1 bg-blue-500 text-white p-2 rounded-md hover:scale-110 duration-300 cursor-pointer">
                    <UserPlus/>
                    <span>Add New Property</span>
                </Link>
            </div>
            
            <ConfirmationModal
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Property"
                message="Are you sure you want to delete this property? This action cannot be undone."
                confirmText="Delete"
                confirmColor="error"
            />
            
            <div className="w-full overflow-x-auto h-[60vh] border rounded-md">
                <table className="w-full border ">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-100">
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Title</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Location</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Address</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Image</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Price</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Property Type</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Status</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Bedrooms</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Bathrooms</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Area</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Agent Image</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Agent Name</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            (loading ? [] : listings).map((property, idx) => {
                                // Normalize property image: supports JSON string arrays, 'image', and 'propertyImage'
                                let normalizedImages = property.images || property.Images || property.propertyImages;
                                if (typeof normalizedImages === 'string') {
                                    // Try JSON first
                                    try { normalizedImages = JSON.parse(normalizedImages); } catch {
                                        // Fallback: comma-separated list
                                        normalizedImages = normalizedImages.split(',').map(s => s.trim()).filter(Boolean);
                                    }
                                }
                                const propertyImgCandidate = property.propertyImage || property.image || (Array.isArray(normalizedImages) ? normalizedImages[0] : normalizedImages);
                                let image = '';
                                if (propertyImgCandidate) {
                                    const raw = typeof propertyImgCandidate === 'string' ? propertyImgCandidate : (propertyImgCandidate?.url || propertyImgCandidate?.src || '');
                                    if (raw) {
                                        if (/^https?:\/\//i.test(raw) || raw.startsWith('data:image')) {
                                            image = raw;
                                        } else {
                                            image = raw.startsWith('/') ? raw : `/${raw}`;
                                        }
                                    }
                                }

                                // Normalize agent image for display beside agent name
                                const rawAgentImage = property.agentImage || property.AgentImage || property.agent?.image || property.agent?.photo || property.agent?.avatar || property.user?.avatar || '';
                                let agentImage = '';
                                if (rawAgentImage) {
                                    if (/^https?:\/\//i.test(rawAgentImage) || String(rawAgentImage).startsWith('data:image')) {
                                        agentImage = rawAgentImage;
                                    } else {
                                        agentImage = String(rawAgentImage).startsWith('/') ? rawAgentImage : `/${rawAgentImage}`;
                                    }
                                }
                                const city = property.city || property.City || property.location?.city;
                                const state = property.state || property.State || property.location?.state;
                                const location = [city, state].filter(Boolean).join(', ');
                                const address = property.address || property.Address || property.location?.address || property.streetAddress || [property.street, city, state, property.zipCode || property.zip].filter(Boolean).join(', ');
                                const agentName = property.agentName || property.AgentName || property.agent?.name || property.user?.name;
                                const rowKey = property.id ?? `${property.title ?? 'row'}-${idx}`;
                                return (
                                    <tr key={rowKey} className="border-b border-gray-200">
                                        <td className="text-left py-3 px-4 font-medium text-gray-700 ">{property.title || property.Title || '—'}</td>
                                        <td className="text-left py-3 px-4 font-medium text-gray-700 ">{location || '—'}</td>
                                        <td className="text-left py-3 px-4 font-medium text-gray-700 ">{address || '—'}</td>
                                        <td>{
                                            (image || PROPERTY_FALLBACK) ? (
                                                <img
                                                    src={image || PROPERTY_FALLBACK}
                                                    alt="image"
                                                    className='w-14 h-14 m-1 object-cover rounded-full'
                                                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PROPERTY_FALLBACK; }}
                                                />
                                            ) : <span className='text-gray-400'>—</span>
                                        }</td>
                                        <td className="text-left py-3 px-4 font-medium text-gray-700 ">{property.price}</td>
                                        <td className="text-left py-3 px-4 font-medium text-gray-700 ">{property.type}</td>
                                        <td className="text-left py-3 px-4 font-medium text-gray-700 ">{property.status}</td>
                                        <td className="text-left py-3 px-4 font-medium text-gray-700 ">{property.bedrooms}</td>
                                        <td className="text-left py-3 px-4 font-medium text-gray-700 ">{property.bathrooms}</td>
                                        <td className="text-left py-3 px-4 font-medium text-gray-700 ">{property.area}</td>
                                        <td>{
                                            (agentImage || AGENT_FALLBACK) ? (
                                                <img
                                                    src={agentImage || AGENT_FALLBACK}
                                                    alt="agent"
                                                    className='w-10 h-10 m-1 object-cover rounded-full'
                                                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = AGENT_FALLBACK; }}
                                                />
                                            ) : <span className='text-gray-400'>—</span>
                                        }</td>
                                        <td className="text-left py-3 px-4 font-medium text-gray-700 ">{agentName || '—'}</td>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <Link to={`/admin/edit-property/${property.id}`}>
                                                    <SquarePen size={25} className="text-blue-500 hover:text-blue-600 hover:scale-110 duration-300 cursor-pointer" />
                                                </Link>
                                                <Trash2 
                                                  size={25} 
                                                  className="text-red-500 hover:text-red-600 hover:scale-110 duration-300 cursor-pointer" 
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteClick(property.id);
                                                  }} 
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Properties;