import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useUserInteractions } from '../../lib/hooks/useUserInteractions';
import { formatCurrency } from '../../lib/format';

function SavedProperties(){
    const { savedProperties, savedLoading, toggleSave } = useUserInteractions();
    const [error, setError] = useState(null);

    // Delete handler to remove property by id
    async function handleDelete(id) {
        try {
            await toggleSave({ listingId: id, action: 'unsave' });
            toast.success("Property removed from saved!");
        } catch {
            toast.error("Failed to remove property");
        }
    }

    if(savedLoading) return <div className="text-center py-8">Loading saved properties...</div>
    if(error) return <div className="text-red-500 text-center py-8">{error}</div>

    return(
        <div className='min-h-screen bg-gray-50 p-6'>
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Saved Properties</h1>
                
                {savedProperties.length === 0 ? (
                    <div className='text-center py-12'>
                        <div className="text-gray-400 text-6xl mb-4">🏠</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved properties</h3>
                        <p className="text-gray-600 mb-4">Start browsing properties and save your favorites!</p>
                        <Link to="/properties" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
                            Browse Properties
                        </Link>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                        {savedProperties.map((property) => {
                            // Normalize image path
                            const defaultImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80';
                            let normalizedImage = property.image || property.images?.[0] || defaultImage;
                            if (normalizedImage && !normalizedImage.startsWith('http') && !normalizedImage.startsWith('data:')) {
                                normalizedImage = normalizedImage.startsWith('/') ? normalizedImage : `/${normalizedImage}`;
                            }
                            
                            const title = property.title || property.name || 'Untitled Property';
                            const location = property.location || `${property.city || ''}, ${property.state || ''}`.replace(', ,', '').trim() || 'Location not specified';
                            
                            return (
                                <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                    <div className="relative h-48 overflow-hidden">
                                        <img src={normalizedImage} alt={title} className='w-full h-full object-cover hover:scale-105 transition-transform duration-300'/>
                                        <div className="absolute top-3 left-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                property.category === 'For Sale' || property.status === 'FOR_SALE'
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {property.category || (property.status === 'FOR_RENT' ? 'For Rent' : 'For Sale')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className='text-lg font-semibold text-gray-900 mb-2'>{title}</h3>
                                        <p className='text-2xl font-bold text-green-600 mb-2'>{formatCurrency(property.price)}</p>
                                        <p className='text-gray-600 mb-4'>{location}</p>
                                        
                                        <div className='flex justify-between items-center'>
                                            <Link 
                                                to={`/properties-detail-page/${property.id}`} 
                                                className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors'
                                            >
                                                View Details
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(property.id)}
                                                className='p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors'
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default SavedProperties;