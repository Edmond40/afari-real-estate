import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductItem from '../components/ProductItem';
import HeroSection from '../components/HeroSection';
import { useListings } from '../lib/hooks/useListings';

function Home(){
    // Fetch real listings from API
    const { listings, loading } = useListings({ page: 1, limit: 24 });

    const [ propertiesCard, setPropertiesCard] = useState([]);
    const [filteredProperties, setFilteredProperties] = useState([]);

    // Search form state
    const [searchForm, setSearchForm] = useState({
        location: '',
        propertyType: 'AllTypes',
        priceRange: 'AnyPrice',
        category: 'Any'
    })

    // Handle input changes
    function handleInputChange(e) {
        const { name, value } = e.target;
        setSearchForm(prev => ({
            ...prev,
            [name]: value
        }));
    }

    // Handle search submission - navigate to Properties page with filtered results
    function handleSearch(e) {
        e.preventDefault();
        
        let filtered = listings; 

        // Filter by location
        if (searchForm.location) {
            filtered = filtered.filter(property => 
                `${property.city || ''} ${property.state || ''}`.toLowerCase().includes(searchForm.location.toLowerCase())
            );
        }

        // Filter by property type
        if (searchForm.propertyType !== 'AllTypes') {
            filtered = filtered.filter(property => 
                (property.type || '').toLowerCase() === searchForm.propertyType.toLowerCase()
            );
        }

        if(searchForm.category !== 'Any'){
            filtered = filtered.filter(property => 
                (property.category || (property.status === 'FOR_RENT' ? 'For Rent' : 'For Sale')) === searchForm.category
            )
        }

        // Filter by price range
        if (searchForm.priceRange !== 'AnyPrice') {
            const priceRanges = {
                '$100,000': (price) => price <= 100000,
                '$100,000-200,000': (price) => price >= 100000 && price <= 200000,
                '$400000-500000': (price) => price >= 400000 && price <= 500000
            };
            
            if (priceRanges[searchForm.priceRange]) {
                filtered = filtered.filter(property => 
                    priceRanges[searchForm.priceRange](Number(property.price) || 0)
                );
            }
        }

        // Navigate to Properties page with filtered results
        navigate('/properties', { 
            state: { 
                filteredProperties: filtered,
                searchCriteria: searchForm
            } 
        });
    }

    // When listings update, show top properties
    useEffect(() => {
        if (!loading) {
            const normalized = (listings || []).map(it => {
                // Handle images properly
                let propertyImage = '';
                if (Array.isArray(it.images) && it.images.length > 0) {
                    propertyImage = it.images[0];
                } else if (typeof it.images === 'string') {
                    try {
                        const parsed = JSON.parse(it.images);
                        propertyImage = Array.isArray(parsed) ? parsed[0] : it.images;
                    } catch {
                        propertyImage = it.images;
                    }
                } else if (it.image) {
                    propertyImage = it.image;
                }
                
                // Normalize agent image
                let agentImg = it.agentImage || it.AgentImage || '';
                if (agentImg && !agentImg.startsWith('http') && !agentImg.startsWith('data:')) {
                    agentImg = agentImg.startsWith('/') ? agentImg : `/${agentImg}`;
                }
                
                return {
                    id: it.id,
                    name: it.title || it.name || 'Untitled Property',
                    image: propertyImage,
                    price: it.price,
                    category: it.category || (it.status === 'FOR_RENT' ? 'For Rent' : 'For Sale'),
                    propertyType: it.type || 'Property',
                    bedrooms: it.bedrooms || 0,
                    bathrooms: it.bathrooms || 0,
                    area: it.area || 0,
                    location: `${it.city || ''}, ${it.state || ''}`.replace(', ,', '').trim() || 'Location not specified',
                    AgentName: it.agentName || it.AgentName || 'N/A',
                    AgentImage: agentImg,
                    AgentStatus: it.agentAddress || it.AgentAddress || '',
                    AgentEmail: it.agentEmail || it.AgentEmail || '',
                    AgentNumber: it.agentPhone || it.AgentNumber || '',
                };
            });
            setPropertiesCard(normalized.slice(0, 8));
            setFilteredProperties(normalized);
        }
    }, [listings, loading]);

    const navigate = useNavigate()

    return(
        <div className=''>
            <div>
                <HeroSection/>
                {/* Search area */}
                <form onSubmit={handleSearch} className='lg:grid lg:grid-cols-4 md:grid md:grid-cols-2 bg-gray-50 shadow-lg flex flex-col justify-between md:items-end p-6 rounded-md m-10 mx-10 gap-5' data-aos="zoom-in">
                    <div>
                        <p className='font-medium text-gray-700'>Location</p>
                        <input 
                            type="text" 
                            name="location" 
                            placeholder='Enter Location' 
                            value={searchForm.location}
                            onChange={handleInputChange}
                            className='mt-1 p-2 duration-500 w-full rounded-md border-gray-300 outline-gray-100  shadow-sm focus:outline-blue-500 focus:border-blue-500'
                        />
                    </div>

                    <div>
                        <p className='font-medium text-gray-700'>Property Type</p>
                        <select 
                            name="propertyType" 
                            value={searchForm.propertyType}
                            onChange={handleInputChange}
                            className='mt-1 p-2 duration-500 w-full rounded-md border-gray-300 outline-gray-100  shadow-sm focus:outline-blue-500 focus:border-blue-500' 
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
                            value={searchForm.category} 
                            onChange={handleInputChange} 
                            className='mt-1 p-2 duration-500 w-full rounded-md border-gray-300 outline-gray-100  shadow-sm focus:outline-blue-500 focus:border-blue-500'
                            >
                                <option value="Any">Any</option>
                                <option value="For Sale">For Sale</option>
                                <option value="For Rent">For Rent</option>
                        </select>
                    </div>

                    <div>
                        <p className='font-medium text-gray-700'>Price Range</p>
                        <select 
                            name="priceRange" 
                            value={searchForm.priceRange}
                            onChange={handleInputChange}
                            className='mt-1 p-2 duration-500 w-full rounded-md border-gray-300 outline-gray-100  shadow-sm focus:outline-blue-500 focus:border-blue-500'
                        >
                            <option value="AnyPrice">Any Price</option>
                            <option value="$100,000">$100,000</option>
                            <option value="$100,000-200,000">$100,000-200,000</option>
                            <option value="$400000-500000">$400000-500000</option>
                        </select>
                    </div>

                    <button type='submit' className='w-full p-2 text-base font-medium rounded-md text-gray-100 bg-blue-500 hover:bg-blue-600'>Search</button>
                </form>

                <div className='flex flex-col gap-6 m-5 p-5'>
                    <div className='flex items-center gap-2'>
                        <h2 className='text-2xl md:text-3xl font-bold text-gray-800' data-aos="fade-right">Featured Properties</h2>
                        <div className='w-20 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full' data-aos="fade-left"></div>
                    </div>
                    
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-96">
                                    <div className="h-48 bg-gray-300 rounded-t-lg"></div>
                                    <div className="p-4 space-y-3">
                                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                                        <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                            { propertiesCard.map((item) => (
                                <ProductItem key={item.id} {...item} />
                            )) }
                        </div>
                    )}
                    
                    {!loading && propertiesCard.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">🏠</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
                            <p className="text-gray-600">Try adjusting your search criteria</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Home;