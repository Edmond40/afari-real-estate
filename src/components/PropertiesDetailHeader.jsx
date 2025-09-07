import { useParams } from "react-router-dom";
import { useListing } from "../lib/hooks/useListing";
import { formatCurrency } from '../lib/format';

function PropertiesDetailHeader({ listing }){
    const { id } = useParams();
    const { listing: fetched, loading } = useListing(listing ? null : id);
    const property = listing || fetched;

    if (!listing && loading) return <div>Loading property details...</div>;
    if (!property) return <div>Property not found</div>;

    return(
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title || property.name}</h1>
                    <p className="text-gray-600 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {property.location || [property.city, property.state].filter(Boolean).join(', ')}
                    </p>
                </div>
                <div className="mt-4 lg:mt-0">
                    <div className="text-3xl font-bold text-gray-900">
                        {formatCurrency(property.price)}
                    </div>
                    {(property.status || property.category) === 'For Rent' && (
                        <div className="text-sm text-gray-600">per month</div>
                    )}
                </div>
            </div>

            {/* Property Tags */}
            <div className="flex flex-wrap gap-2 w-52" data-aos="fade-right">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    (property.status || property.category) === 'For Sale' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                }`}>
                    {property.status || property.category}
                </span>
                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    {property.type || property.propertyType}
                </span>
            </div>
        </div>
    )
} 

export default PropertiesDetailHeader;