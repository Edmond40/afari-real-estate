import { HeartIcon, Bath, BedDouble, MapPinHouse, RulerDimensionLine, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";

function ProductItem({ id, name, image, price, category, bestSeller, bedrooms,bathrooms, area, location, propertyType,AgentName,AgentImage,AgentStatus,AgentEmail,AgentNumber }){

    const { currency } = useContext(ShopContext);
    const [heartColor, setColor] = useState(false);
    const [ isOpen, setIsOpen] = useState(false)

    function handleInfo(){
        setIsOpen(
            prev => !prev
        )
    }

    return(
        <div className="bg-white shadow-sm rounded-md h-full relative overflow-hidden transition-shadow duration-300 group">
            <div className="overflow-hidden">
                <img src={image} alt={name} className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300"/>
            </div>
            <div className="flex flex-col items-center mt-2 mb-2">
                <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        category === 'For Sale' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                    }`}>
                        {category}
                    </span>
                </div>
                <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {propertyType}
                    </span>
                </div>
                {/* Property Details */}
                <div className="w-full p-5">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                            {name}
                        </h3>
                        <p className="text-gray-600 text-sm flex items-center">
                            <MapPinHouse className='w-4 h-4 mr-1'/>
                            {location}
                        </p>
                    </div>

                    {/* Property Features */}
                    <div className="flex items-center justify-between mb-3 text-sm text-gray-600 gap-2">
                        <div className="flex items-center">
                            <BedDouble className='w-4 h-4 mr-1'/>
                            <span>{bedrooms || 'N/A'} beds</span>
                        </div>
                        <div className="flex items-center">
                            <Bath className='w-4 h-4 mr-1'/>
                            <span>{bathrooms || 'N/A'} baths</span>
                        </div>
                        <div className="flex items-center">
                            <RulerDimensionLine className='w-4 h-4 mr-1'/>
                            <span>{area || 'N/A'} sqft</span>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {currency}{price?.toLocaleString()}
                            </p>
                            {category === 'For Rent' && (
                                <p className="text-sm text-gray-600">per month</p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 mb-5">
                        <div className="flex items-center gap-1 text-blue-500 font-semibold cursor-pointer" onClick={handleInfo}>
                            <ChevronDown size={20} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}/>
                            <p>Show Agent Info</p>
                        </div>
                        
                        <div className={`overflow-hidden transition-all duration-700 ${isOpen ? 'max-h-96 opacity-100 ' : 'max-h-0 opacity-0'} flex items-center gap-4 shadow-sm p-2 rounded-lg`} onClose={()=> setIsOpen(false)}>
                            <img src={AgentImage} alt="agent-name" className="w-16 h-16 object-cover rounded-full"/>
                            <div>
                                <h1>{AgentName}</h1>
                                <div>
                                    <p>{AgentStatus}</p>
                                    <p>{AgentEmail}</p>
                                    <p>{AgentNumber}</p>
                                </div>
                            </div>
                        </div>                    
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Link
                            to={`/properties-detail-page/${id}`}
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
        </div>
    )
}

export default ProductItem;