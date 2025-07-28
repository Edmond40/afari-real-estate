import { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import PropertyCard from '../Cards/PropertyCard';

function PropertiesPage(){
    const { getFilteredProperties } = useContext(ShopContext);
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
    // If filtered, use the filtered properties as the base, else use all
    const baseProperties = isFiltered ? location.state.filteredProperties : undefined;
    // Get the filtered and sorted properties
    const displayProperties = getFilteredProperties({ ...filters, baseProperties });

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
            category: 'any'
        });
    };

    useEffect(() => {
        setFilters(filters)
    },[filters])

    return(
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {isFiltered ? 'Search Results' : 'All Properties'}
                    </h1>
                    <p className="text-gray-600">
                        {isFiltered 
                            ? `Found ${displayProperties.length} properties matching your search`
                            : `Browse through ${displayProperties.length} available properties`
                        }
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                {displayProperties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {displayProperties.map((property, index) => (
                            <PropertyCard key={property.id || index} property={property} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">🏠</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
                        <p className="text-gray-600 mb-4">
                            Try adjusting your search criteria or browse all properties
                        </p>
                        <button
                            onClick={clearFilters}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            View All Properties
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PropertiesPage;