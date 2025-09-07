import { Link } from 'react-router-dom';
import { useUserInteractions } from '../../lib/hooks/useUserInteractions';
import { formatCurrency } from '../../lib/format';
import { Trash2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { useState } from 'react';

function ViewingHistory(){
    const [page, setPage] = useState(1);
    const limit = 8; // Items per page
    
    const { useViewingHistory, removeFromViewingHistory, isRemovingFromHistory } = useUserInteractions();
    const { data: viewingData, isLoading } = useViewingHistory({ page, limit });
    
    const viewingHistory = viewingData?.properties || [];
    const totalItems = viewingData?.total || 0;
    const totalPages = viewingData?.totalPages || 1;

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleRemoveFromHistory = async (propertyId, e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (window.confirm('Are you sure you want to remove this property from your viewing history?')) {
            try {
                await removeFromViewingHistory(propertyId);
                // No need to call refetch() here as the cache is already updated by the mutation
            } catch (error) {
                console.error('Error removing from viewing history:', error);
                const errorMessage = error.response?.data?.message || error.message || 'Failed to remove from viewing history';
                toast.error(errorMessage);
            }
        }
    };

    if(isLoading) return <div className="text-center py-8">Loading viewing history...</div>

    return(
        <div className='min-h-screen bg-gray-50 p-4 sm:p-6'>
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Viewing History</h1>
                
                {viewingHistory.length === 0 ? (
                    <div className='text-center py-12'>
                        <div className="text-gray-400 text-6xl mb-4">👁️</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No viewing history</h3>
                        <p className="text-gray-600 mb-4">Start browsing properties to build your viewing history!</p>
                        <Link to="/properties" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
                            Browse Properties
                        </Link>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                        {viewingHistory.map((property) => {
                            // Normalize image path
                            const defaultImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80';
                            let normalizedImage = property.image || property.images?.[0] || defaultImage;
                            if (normalizedImage && !normalizedImage.startsWith('http') && !normalizedImage.startsWith('data:')) {
                                normalizedImage = normalizedImage.startsWith('/') ? normalizedImage : `/${normalizedImage}`;
                            }
                            
                            const title = property.title || property.name || 'Untitled Property';
                            const location = property.location || `${property.city || ''}, ${property.state || ''}`.replace(', ,', '').trim() || 'Location not specified';
                            const viewedAt = new Date(property.viewedAt || property.createdAt).toLocaleDateString();
                            
                            return (
                                <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group relative">
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
                                        <button
                                            onClick={(e) => handleRemoveFromHistory(property.id, e)}
                                            disabled={isRemovingFromHistory}
                                            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors duration-200"
                                            title="Remove from history"
                                        >
                                            {isRemovingFromHistory ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    <div className="p-4">
                                        <h3 className='text-lg font-semibold text-gray-900 mb-2'>{title}</h3>
                                        <p className='text-2xl font-bold text-green-600 mb-2'>{formatCurrency(property.price)}</p>
                                        <p className='text-gray-600 mb-2'>{location}</p>
                                        <p className='text-sm text-gray-500 mb-4'>Viewed on: {viewedAt}</p>
                                        
                                        <Link 
                                            to={`/properties-detail-page/${property.id}`} 
                                            className='w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors block'
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-700">
                            Showing <span className="font-medium">
                                {viewingHistory.length > 0 ? (page - 1) * limit + 1 : 0}
                            </span> to{' '}
                            <span className="font-medium">
                                {Math.min(page * limit, totalItems)}
                            </span>{' '}
                            of <span className="font-medium">{totalItems}</span> results
                        </div>
                        
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className="px-3 py-1.5 border rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-4 w-4 inline-block" />
                            </button>
                            
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (page <= 3) {
                                    pageNum = i + 1;
                                } else if (page >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = page - 2 + i;
                                }
                                
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`px-3 py-1.5 border rounded-md text-sm font-medium ${
                                            page === pageNum 
                                                ? 'bg-blue-600 text-white border-blue-600' 
                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 border rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="h-4 w-4 inline-block" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ViewingHistory;