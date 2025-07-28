import { Mail, PhoneCall } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';

function PropertiesDetailAgent(){
    const { id } = useParams()
    const { properties, currency } = useContext(ShopContext);
    const [property, setProperty] = useState(null);

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
        <div>
            <div key={property.id} className='flex items-center gap-5 p-4 bg-white shadow-md rounded-lg md:w-5/6 lg:w-full mb-5'>
                <img src={property.AgentImage} alt="" className='md:w-28 w-16 h-16 md:h-28 rounded-full object-cover'/>
                <div>
                    <div>
                        <h1 className='text-gray-800 font-semibold'>{property.AgentName}</h1>
                        <p className='text-gray-600'>{property.AgentStatus}</p>
                    </div>
                    <div className='text-gray-600'>
                        <div className='flex items-center gap-1'>
                            <Mail size={20}/>
                            <p>{property.AgentEmail}</p>
                        </div>
                        <div className='flex items-center gap-1'>
                            <PhoneCall size={20}/>
                            <p>{property.AgentNumber}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PropertiesDetailAgent;