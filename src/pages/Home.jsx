import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import ProductItem from '../components/ProductItem';
import HeroSection from '../components/HeroSection';


function Home(){

    const { properties, currency } = useContext(ShopContext);

    const [ propertiesCard, setPropertiesCard] = useState([])
    const [filteredProperties, setFilteredProperties] = useState([])

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

    // Handle search submission - filter featured properties on home page
    function handleSearch(e) {
        e.preventDefault();
        
        let filtered = properties; 

        // Filter by location
        if (searchForm.location) {
            filtered = filtered.filter(property => 
                property.location.toLowerCase().includes(searchForm.location.toLowerCase())
            );
        }

        // Filter by property type
        if (searchForm.propertyType !== 'AllTypes') {
            filtered = filtered.filter(property => 
                property.propertyType === searchForm.propertyType
            );
        }

        if(searchForm.category !== 'Any'){
            filtered = filtered.filter(property => 
                property.category === searchForm.category
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
                    priceRanges[searchForm.priceRange](property.price)
                );
            }
        }

        setPropertiesCard(filtered);
    }

    useEffect(() => {
        const bestProperty = properties.filter((item) => (item.propertyType))
        setPropertiesCard(bestProperty.slice(0, 8)) // Show only 8 featured properties
        setFilteredProperties(properties)
    },[properties])

    const navigate = useNavigate()

    return(
        <div className=''>
            <div>
                <HeroSection/>
                {/* Search area */}
                <form onSubmit={handleSearch} className='lg:grid lg:grid-cols-4 md:grid md:grid-cols-2 bg-gray-50 shadow-lg flex flex-col justify-between md:items-end p-6 rounded-md m-10 mx-10 gap-5'>
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


                <div className='flex flex-col gap-4 m-5 p-5'>
                    <div className='flex items-center gap-2'>
                        <h2 className='text-sm md:text-xl font-semibold text-gray-700'>Featured Properties</h2>
                        <div className='w-16 h-[3px] bg-yellow-400'></div>
                    </div>
                    <div className='lg:grid lg:grid-cols-4 md:grid md:grid-cols-2 flex flex-col justify-between md:items-end rounded-md gap-5'>
                        {
                            propertiesCard.map((item, index) => (
                                <ProductItem key={index} {...item}/>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;