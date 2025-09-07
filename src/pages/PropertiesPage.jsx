import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PropertyCard from '../Cards/PropertyCard';
import { useListings } from '../lib/hooks/useListings';

function PropertiesPage(){
    const [queryParams, setQueryParams] = useState({ page: 1, limit: 12 });
    const { listings, loading, meta, params } = useListings(queryParams);
    const location = useLocation();
    const [filters, setFilters] = useState({
        location: '',
        propertyType: 'AllTypes',
        priceRange: 'AnyPrice',
        sortBy: 'default',
        category: 'Any'
    });
    // If coming from search, pre-populate filtered results
    const isFiltered = Boolean(location.state?.filteredProperties);
    const baseProperties = isFiltered ? location.state.filteredProperties : listings;

    const displayProperties = useMemo(() => {
        let result = Array.isArray(baseProperties) ? [...baseProperties] : [];

        // normalize fields for filtering
        const norm = (p) => ({
            city: (p.city || '').toLowerCase(),
            state: (p.state || '').toLowerCase(),
            location: (p.location || `${p.city || ''}, ${p.state || ''}`).toLowerCase(),
            type: (p.type || p.propertyType || '').toLowerCase(),
            status: (p.status || p.category || '').toLowerCase(),
            price: typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0,
        });

        // Apply client-side filters when not using search results
        if (!isFiltered) {
            // Location filter
            if (filters.location && filters.location.trim()) {
                const searchLocation = filters.location.toLowerCase().trim();
                result = result.filter((p) => {
                    const normalized = norm(p);
                    return normalized.city.includes(searchLocation) || 
                           normalized.state.includes(searchLocation) ||
                           normalized.location.includes(searchLocation);
                });
            }

            // Property type filter
            if (filters.propertyType && filters.propertyType !== 'AllTypes') {
                const searchType = filters.propertyType.toLowerCase();
                result = result.filter((p) => norm(p).type === searchType);
            }

            // Category filter
            if (filters.category && filters.category !== 'Any') {
                const searchCategory = filters.category.toLowerCase();
                result = result.filter((p) => {
                    const normalized = norm(p);
                    return normalized.status === searchCategory || 
                           normalized.status === searchCategory.replace(' ', '_');
                });
            }
        }

        // Price range filter (always apply client-side)
        if (filters.priceRange && filters.priceRange !== 'AnyPrice') {
            result = result.filter((p) => {
                const price = norm(p).price;
                switch (filters.priceRange) {
                    case '$100,000':
                        return price <= 100000;
                    case '$100,000-200,000':
                        return price >= 100000 && price <= 200000;
                    case '$400000-500000':
                        return price >= 400000 && price <= 500000;
                    default:
                        return true;
                }
            });
        }

        // Sorting
        if (filters.sortBy === 'price-low') {
            result.sort((a, b) => (norm(a).price - norm(b).price));
        } else if (filters.sortBy === 'price-high') {
            result.sort((a, b) => (norm(b).price - norm(a).price));
        } else if (filters.sortBy === 'name') {
            result.sort((a, b) => ((a.title || a.name || '').localeCompare(b.title || b.name || '')));
        }

        return result;
    }, [baseProperties, filters, isFiltered]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            location: '',
            propertyType: 'AllTypes',
            priceRange: 'AnyPrice',
            sortBy: 'default',
            category: 'Any'
        });
        // Reset server params
        setQueryParams({ page: 1, limit: queryParams.limit, city: undefined, type: undefined, status: undefined });
    };

    // Push applicable filters to server when not using search-derived results
    useEffect(() => {
        if (isFiltered) return; // keep client-only for search results
        const next = { page: 1, limit: params.limit };
        if (filters.location) {
            // Use city as simple field to match backend; location/state not supported server-side generically
            next.city = filters.location;
        } else {
            next.city = undefined;
        }
        if (filters.propertyType !== 'AllTypes') {
            next.type = filters.propertyType;
        } else {
            next.type = undefined;
        }
        if (filters.category !== 'Any') {
            next.status = filters.category; // backend uses status on some models; controller allows generic where
        } else {
            next.status = undefined;
        }
        setQueryParams(next);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.location, filters.propertyType, filters.category, isFiltered]);

    return(
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 md:w-72">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 w-52" data-aos="fade-left">
                        {isFiltered ? 'Search Results' : 'All Properties'}
                    </h1>
                    <p className="text-gray-600" data-aos="fade-right">
                        {loading ? 'Loading properties...' : isFiltered 
                            ? `Found ${displayProperties.length} properties matching your search`
                            : `Browse through ${displayProperties.length} available properties`}
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4" data-aos="flip-up">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Location
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={filters.location}
                                onChange={handleFilterChange}
                                placeholder="Enter location"
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Property Type
                            </label>
                            <select
                                name="propertyType"
                                value={filters.propertyType}
                                onChange={handleFilterChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="AllTypes">All Types</option>
                                <option value="Apartment">Apartment</option>
                                <option value="House">House</option>
                                <option value="Land">Land</option>
                            </select>
                        </div>

                        <div>
                        <p className='font-medium text-gray-700'>Category</p>
                        <select 
                            name="category" 
                            value={filters.category} 
                            onChange={handleFilterChange} 
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Any">Any</option>
                                <option value="For Sale">For Sale</option>
                                <option value="For Rent">For Rent</option>
                        </select>
                    </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price Range
                            </label>
                            <select
                                name="priceRange"
                                value={filters.priceRange}
                                onChange={handleFilterChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="AnyPrice">Any Price</option>
                                <option value="$100,000">$100,000</option>
                                <option value="$100,000-200,000">$100,000-200,000</option>
                                <option value="$400000-500000">$400,000-500,000</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sort By
                            </label>
                            <select
                                name="sortBy"
                                value={filters.sortBy}
                                onChange={handleFilterChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="default">Default</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="name">Name: A to Z</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={clearFilters}
                                className="w-full p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : displayProperties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {displayProperties.map((property, index) => (
                            <PropertyCard key={property.id || index} property={property} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4" data-aos="zoom-in">🏠</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
                        <p className="text-gray-600 mb-4">
                            Try adjusting your search criteria or browse all properties
                        </p>
                        <button
                            onClick={clearFilters}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors" data-aos="fade-up">
                            View All Properties
                        </button>
                    </div>
                )}

                {/* Pagination Controls (server-backed when not search-derived) */}
                {!isFiltered && (
                    <div className="flex items-center justify-between mt-8">
                        <div className="flex items-center gap-2">
                            <button
                                disabled={loading || (meta?.currentPage ?? 1) <= 1}
                                onClick={() => setQueryParams(prev => ({ ...prev, page: Math.max(1, (meta?.currentPage ?? 1) - 1) }))}
                                className="px-3 py-2 border rounded disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                disabled={loading || (meta?.currentPage ?? 1) >= (meta?.totalPages ?? 1)}
                                onClick={() => setQueryParams(prev => ({ ...prev, page: Math.min((meta?.totalPages ?? 1), (meta?.currentPage ?? 1) + 1) }))}
                                className="px-3 py-2 border rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        <div className="text-sm text-gray-600">
                            Page {meta?.currentPage ?? 1} of {meta?.totalPages ?? 1}
                        </div>
                        <div>
                            <select
                                value={queryParams.limit}
                                onChange={(e) => setQueryParams(prev => ({ ...prev, page: 1, limit: parseInt(e.target.value) }))}
                                className="border rounded px-2 py-2"
                            >
                                <option value={8}>8 per page</option>
                                <option value={12}>12 per page</option>
                                <option value={16}>16 per page</option>
                                <option value={24}>24 per page</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PropertiesPage;