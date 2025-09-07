import { Link } from 'react-router-dom';
import { useState } from 'react';
import {HeartIcon, Bath, BedDouble, MapPinHouse, RulerDimensionLine, ChevronDown, BookmarkIcon } from 'lucide-react';
import { toast } from "react-toastify";
import { formatCurrency } from '../lib/format';
import { useUserInteractions } from '../lib/hooks/useUserInteractions';

function PropertyCard({ property }) {
    const { toggleLike, toggleSave, recordView, likedProperties, savedProperties, isLiking, isSaving } = useUserInteractions();
    const [isOpen, setIsOpen] = useState(false);
    
    // Check if property is liked or saved
    const isLiked = likedProperties.some(p => p.id === property.id);
    const isSaved = savedProperties.some(p => p.id === property.id);

    // Default image if property doesn't have one
    const defaultImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80';
    // Image source: handle array, JSON string array, object with url/src, or relative path under public/
    let normalizedImages = property.images;
    if (typeof normalizedImages === 'string') {
        try { normalizedImages = JSON.parse(normalizedImages); } catch { /* keep as string */ }
    }
    const firstImg = Array.isArray(normalizedImages) ? normalizedImages[0] : (property.image || normalizedImages || null);
    let image = defaultImage;
    if (firstImg) {
        const raw = typeof firstImg === 'string' ? firstImg : (firstImg?.url || firstImg?.src || '');
        if (raw) {
            if (/^https?:\/\//i.test(raw) || raw.startsWith('data:image')) {
                image = raw;
            } else {
                image = raw.startsWith('/') ? raw : `/${raw}`;
            }
        }
    }
    const title = property.title || property.name || 'Property';
    const locationText = property.location || [property.city, property.state].filter(Boolean).join(', ');
    const category = property.status || property.category;
    const pType = property.type || property.propertyType;

    // Agent fields (support backend-lowercase + legacy PascalCase) + normalize image
    const rawAgentImage = property.agentImage || property.AgentImage || '';
    let agentImage = defaultImage;
    if (rawAgentImage) {
        if (/^https?:\/\//i.test(rawAgentImage) || String(rawAgentImage).startsWith('data:image')) {
            agentImage = rawAgentImage;
        } else {
            agentImage = String(rawAgentImage).startsWith('/') ? rawAgentImage : `/${rawAgentImage}`;
        }
    }
    const agentName = property.agentName || property.AgentName || 'N/A';
    const agentAddress = property.agentAddress || property.AgentAddress || '';
    const agentEmail = property.agentEmail || property.AgentEmail || '';
    const agentNumber = property.agentNumber || property.AgentNumber || '';
    const agentStatus = property.agentStatus || property.AgentStatus || '';

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-sm transition-shadow duration-300 group" data-aos="zoom-in">
            {/* Property Image */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={image || defaultImage}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        property.category === 'For Sale' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                    }`}>
                        {category}
                    </span>
                </div>
                <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {pType}
                    </span>
                </div>
            </div>

            {/* Property Details */}
            <div className="p-4">
                <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{title}</h3>
                    <p className="text-gray-600 text-sm flex items-center">
                        <MapPinHouse className='w-4 h-4 mr-1'/>
                        {locationText}
                    </p>
                </div>

                {/* Property Features */}
                <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
                    <div className="flex items-center">
                        <BedDouble className='w-4 h-4 mr-1'/>
                        <span>{property.bedrooms || 'N/A'} beds</span>
                    </div>
                    <div className="flex items-center">
                        <Bath className='w-4 h-4 mr-1'/>
                        <span>{property.bathrooms || 'N/A'} baths</span>
                    </div>
                    <div className="flex items-center">
                        <RulerDimensionLine className='w-4 h-4 mr-1'/>
                        <span>{property.area || 'N/A'} sqft</span>
                    </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(property.price)}
                        </p>
                        {category === 'For Rent' && (
                            <p className="text-sm text-gray-600">per month</p>
                        )}
                    </div>
                </div>

                {/* Agent Info */}
                <div className="flex flex-col gap-2 mb-5">
                    <div className="flex items-center gap-1 text-blue-500 font-semibold cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                        <ChevronDown size={20} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}/>
                        <p>Show Agent Info</p>
                    </div>
                    
                    <div className={`overflow-hidden transition-all duration-700 ${isOpen ? 'max-h-96 opacity-100 ' : 'max-h-0 opacity-0'} flex items-center gap-4 shadow-sm p-2 rounded-lg`} onClose={()=> setIsOpen(false)}>
                        <img src={agentImage} alt="agent" className="w-16 h-16 object-cover rounded-full"/>
                        <div className="text-sm">
                            <h1 className="font-semibold text-gray-800">{agentName}</h1>
                            {agentAddress && <p className="text-gray-600">{agentAddress}</p>}
                            <div className="text-gray-600">
                                {agentStatus && <p>{agentStatus}</p>}
                                {agentEmail && <p>{agentEmail}</p>}
                                {agentNumber && <p>{agentNumber}</p>}
                            </div>
                        </div>
                    </div>
                    
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Link
                        to={`/properties-detail-page/${property.id}`}
                        className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
                        onClick={() => recordView(property.id).catch(() => {})}
                    >
                        View Details
                    </Link>
                    <button 
                        className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 cursor-pointer" 
                        onClick={async () => {
                            try {
                                await toggleLike({ 
                                    listingId: property.id, 
                                    action: isLiked ? 'unlike' : 'like' 
                                });
                                toast.success(isLiked ? 'Property unliked!' : 'Property liked!');
                            } catch {
                                toast.error('Failed to update like status');
                            }
                        }}
                        disabled={isLiking}
                    >
                        <HeartIcon size={20} className={`transition-all duration-300 ${
                            isLiked ? 'text-red-500 fill-red-500 hover:scale-110' : 'text-gray-400 hover:text-red-400'
                        }`}/>
                    </button>
                    <button 
                        className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 cursor-pointer" 
                        onClick={async () => {
                            try {
                                await toggleSave({ 
                                    listingId: property.id, 
                                    action: isSaved ? 'unsave' : 'save' 
                                });
                                toast.success(isSaved ? 'Property removed from saved!' : 'Property saved!');
                            } catch {
                                toast.error('Failed to update save status');
                            }
                        }}
                        disabled={isSaving}
                    >
                        <BookmarkIcon size={20} className={`transition-all duration-300 ${
                            isSaved ? 'text-blue-500 fill-blue-500 hover:scale-110' : 'text-gray-400 hover:text-blue-400'
                        }`}/>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PropertyCard;
