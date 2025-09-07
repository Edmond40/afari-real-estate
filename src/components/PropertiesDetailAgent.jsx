import { MapPin } from 'lucide-react';

function PropertiesDetailAgent({ listing }){
    const property = listing;
    if (!property) return null;

    const user = property.user || {};
    // Prefer denormalized agent fields edited from Admin: agentImage, agentName, agentAddress
    const avatar = property.agentImage || property.AgentImage || user.avatar || 'https://i.pravatar.cc/100';
    const name = property.agentName || property.AgentName || user.name || 'Listing Agent';
    const address = property.agentAddress || property.AgentAddress || '';

    return(
        <div>
            <div className='flex items-center gap-5 p-4 bg-white shadow-md rounded-lg md:w-5/6 lg:w/full mb-5'>
                <img src={avatar} alt="Agent" className='md:w-28 w-16 h-16 md:h-28 rounded-full object-cover'/>
                <div>
                    <div>
                        <h1 className='text-gray-800 font-semibold'>{name}</h1>
                        {address && (
                            <div className='flex items-center gap-1 text-gray-600'>
                                <MapPin size={18} />
                                <p>{address}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PropertiesDetailAgent;