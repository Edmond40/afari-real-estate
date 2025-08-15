import { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import PropertiesDetailForm from '../components/PropertiesDetailForm';
import PropertiesDetailAgent from '../components/PropertiesDetailAgent';
import PropertiesDetailSide from '../components/PropertiesDetailSide';
import PropertiesDetailFeatures from '../components/PropertiesDetailFeatures';
import PropertiesDetailRelated from '../components/PropertiesDetailRelated';
import PropertiesImage from '../components/PropertiesImage';
import PropertiesDetailHeader from '../components/PropertiesDetailHeader';

function PropertiesDetailPage() {
    const { id } = useParams();
    const { properties, currency } = useContext(ShopContext);
    const [property, setProperty] = useState(null);

    useEffect(() => {
        if (properties.length > 0) {
            const foundProperty = properties.find(p => p.id == id);
            setProperty(foundProperty);
        }
    }, [id, properties]);

    if (!property) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4" data-aos="zoom-in">🏠</div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Property Not Found</h2>
                    <p className="text-gray-600 mb-4">The property you're looking for doesn't exist.</p>
                    <Link to="/properties" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700" data-aos="fade-up">
                        Back to Properties
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <nav className="mb-8">
                    <ol className="flex items-center space-x-2 text-sm text-gray-600 w-58" data-aos="fade-left">
                        <li><Link to="/" className="hover:text-blue-600">Home</Link></li>
                        <li>/</li>
                        <li><Link to="/properties" className="hover:text-blue-600">Properties</Link></li>
                        <li>/</li>
                        <li className="text-gray-900">{property.name}</li>
                    </ol>
                </nav>

                {/* Property Header */}
                <PropertiesDetailHeader/>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Image Gallery */}
                        <PropertiesImage/>

                        {/* Property Features */}
                        <PropertiesDetailFeatures/>

                        {/* Related Properties */}
                        <PropertiesDetailRelated/>                     
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        {/* Contact Form */}
                        <PropertiesDetailForm />

                        <div className='md:grid md:grid-cols-2 lg:grid lg:grid-cols-1' data-aos="fade-up">
                            {/* Agent Info */}
                            <PropertiesDetailAgent/>

                            {/* Property Details */}
                            <PropertiesDetailSide/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PropertiesDetailPage;