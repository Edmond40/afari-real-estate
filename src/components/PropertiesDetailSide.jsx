import { useContext,useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";


function PropertiesDetailSide(){

    const { id } = useParams()
    const [ property, setProperty] = useState(null)
    const { properties, currency } = useContext(ShopContext)

    useEffect(() => {
        if (properties.length > 0) {
            const foundProperty = properties.find(p => p.id == id);
            setProperty(foundProperty);
        }
    }, [id, properties]);


    if (!properties || properties.length === 0) {
        return <div>Loading...</div>;
    }

    if (property === null) {
        return <div>Loading property details...</div>;
    }

    if (!property) {
        return <div>Property not found.</div>;
    }

    return(
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Property Details</h3>
            <div className="space-y-3">
                <div className="flex justify-between">
                    <span className="text-gray-600">Property ID:</span>
                    <span className="font-medium">{property.id}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{property.propertyType}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium">{property.category}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{property.location}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium">{currency}{property.price?.toLocaleString()}</span>
                </div>
            </div>
        </div>
    )
}


export default PropertiesDetailSide;