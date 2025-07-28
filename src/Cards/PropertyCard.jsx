import { Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import {HeartIcon, Bath, BedDouble, MapPinHouse, RulerDimensionLine, ChevronDown } from 'lucide-react';
import { toast } from "react-toastify";
import { addFavorite } from '../lib/favorites';
import { addToViewingHistory } from '../lib/history';

function PropertyCard({ property }) {
    const { currency } = useContext(ShopContext);

    const [heartColor, setColor] = useState(false);

    const [isOpen, setIsOpen] = useState(false)

    // Default image if property doesn't have one
    const defaultImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80';

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-sm transition-shadow duration-300 group">
            {/* Property Image */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={property.image || defaultImage}
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        property.category === 'For Sale' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                    }`}>
                        {property.category}
                    </span>
                </div>
                <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {property.propertyType}
                    </span>
                </div>
            </div>

            {/* Property Details */}
            <div className="p-4">
                <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                        {property.name}
                    </h3>
                    <p className="text-gray-600 text-sm flex items-center">
                        <MapPinHouse className='w-4 h-4 mr-1'/>
                        {property.location}
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
                            {currency}{property.price?.toLocaleString()}
                        </p>
                        {property.category === 'For Rent' && (
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
                        <img src={property.AgentImage} alt="agent-name" className="w-16 h-16 object-cover rounded-full"/>
                        <div>
                            <h1>{property.AgentName}</h1>
                            <div>
                                <p>{property.AgentStatus}</p>
                                <p>{property.AgentEmail}</p>
                                <p>{property.AgentNumber}</p>
                            </div>
                        </div>
                    </div>
                    
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Link
                        to={`/properties-detail-page/${property.id}`}
                        className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
                        onClick={() => addToViewingHistory(property)}
                    >
                        View Details
                    </Link>
                    <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 cursor-pointer" onClick={()=> 
                        {   
                            setColor(true)
                            addFavorite(property);
                            toast.success('Property Saved to Favorite Successfully!')
                        }}>
                    <HeartIcon size={20} className={`text-gray-300 ${heartColor ? 'text-red-500 hover:scale-110 duration-300' : 'text-gray-300'}`}/>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PropertyCard;
