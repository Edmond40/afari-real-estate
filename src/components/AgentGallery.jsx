import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Bath, BedDouble, HeartIcon, MapPinHouse, RulerDimensionLine } from "lucide-react";
import { toast } from "react-toastify";
import { formatCurrency } from '../lib/format';
import { useListings } from '../lib/hooks/useListings';
import { useAgents } from '../lib/hooks/useAgents';

function AgentGallery(){
    const { id } = useParams();
    const { listings, loading: listingsLoading } = useListings({ limit: 100 });
    const { agents, loading: agentsLoading } = useAgents({ limit: 100 });
    const [agentGallery, setAgentGallery] = useState([]);
    const [heartColor, setColor] = useState(false);
 
    useEffect(() => {
        if (listings && agents && id) {
            // Filter listings by agent ID
            const filteredProperties = listings.filter(
                (listing) => listing.agentId == id
            );
            setAgentGallery(filteredProperties);
        }
    }, [id, listings, agents]);

    if(listingsLoading || agentsLoading){
        return <div>Loading agent properties...</div>
    }

    if(!agentGallery || agentGallery.length === 0) {
        return <div>No properties found for this agent.</div>
    } 

    return(
        <div>
            <div>
                <div className="lg:grid lg:grid-cols-3 sm:grid-cols-2 md:grid-cols-1 gap-5">
                    {
                        agentGallery.map((property, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group mb-5">
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={property.images?.[0] || '/placeholder-image.jpg'} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute top-3 left-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            property.status === 'FOR_SALE' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {property.status === 'FOR_SALE' ? 'For Sale' : property.status === 'FOR_RENT' ? 'For Rent' : property.status}
                                        </span>
                                    </div>
                                    <div className="absolute top-3 right-3">
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                            {property.type}
                                        </span>
                                    </div>
                                </div>

                                {/* Property Details */}
                                <div className="p-4">
                                    <div className="mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                                            {property.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm flex items-center">
                                            <MapPinHouse className='w-4 h-4 mr-1'/>
                                            {property.city}, {property.state}
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
                                            {property.status === 'FOR_RENT' && (
                                                <p className="text-sm text-gray-600">per month</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <Link
                                            to={`/properties-detail-page/${property.id}`}
                                            className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
                                        >
                                            View Details
                                        </Link>
                                        <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 cursor-pointer" onClick={()=> 
                                            {   
                                                setColor(prev => !prev)
                                                toast.success('Property Saved to Favorite Successfully!')
                                            }}>
                                            <HeartIcon size={20} className={`text-gray-300 ${heartColor ? 'text-red-500 hover:scale-110 duration-300' : 'text-gray-300'}`}/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default AgentGallery;