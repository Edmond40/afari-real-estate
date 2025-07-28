import { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

function PropertiesDetailRelated(){
    const {id} = useParams()
    const [property, setProperty] = useState(null)
    const { properties, currency } = useContext(ShopContext)

    const [relatedProperties, setRelatedProperties] = useState([]);

    useEffect(() =>{
        if(properties.length > 0){
            const foundProperty = properties.find(p => p.id == id);
            setProperty(foundProperty)

            // Get related properties (same type or location)
            if (foundProperty) {
                const related = properties
                    .filter(p => p.id !== foundProperty.id)
                    .filter(p => p.propertyType === foundProperty.propertyType || p.location === foundProperty.location)
                    .slice(0, 4);
                setRelatedProperties(related);
            }
        }
    },[id, properties])

    if(!properties || properties.length === 0){
        return <div>Loading...</div>;
    }

    if(property === null){
        return <div>Loading property details...</div>;
    }

    if(!property){
        return <div>Property not found.</div>
    }

    
    return(
        <div>
            {relatedProperties.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Similar Properties</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {relatedProperties.map((relatedProperty, index) => (
                            <Link
                                key={relatedProperty.id || index}
                                to={`/properties-detail-page/${relatedProperty.id}`}
                                className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <img
                                        src={relatedProperty.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'}
                                        alt={relatedProperty.name}
                                        className="w-16 h-16 rounded-md object-cover"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{relatedProperty.name}</h3>
                                        <p className="text-sm text-gray-600">{relatedProperty.location}</p>
                                        <p className="text-sm font-semibold text-blue-600">
                                            {currency}{relatedProperty.price?.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default PropertiesDetailRelated;