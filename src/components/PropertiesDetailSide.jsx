import { formatCurrency } from '../lib/format';

function PropertiesDetailSide({ listing }){
    const property = listing;
    if (!property) return null;

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
                    <span className="font-medium">{property.type || property.propertyType}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium">{property.status || property.category}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{property.location || [property.city, property.state].filter(Boolean).join(', ')}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium">{formatCurrency(property.price)}</span>
                </div>
            </div>
        </div>
    )
}

export default PropertiesDetailSide;