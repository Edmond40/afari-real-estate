import { Mail, MapPin, PhoneCall, Star } from "lucide-react";
import { Link } from "react-router-dom";



function AgentItem({id, name, image, status, email, address, phone, propertyCount, about}){


    return(
        <div className="bg-white w-full flex flex-col gap-4 shadow-sm rounded-md h-full relative overflow-hidden p-4 hover:-translate-y-4 duration-500" data-aos="fade-right">
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                    {image ? (
                        <img src={image} alt={name} className="w-20 h-20 rounded-full object-cover"/>
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-600 font-semibold text-lg">{name?.charAt(0)}</span>
                        </div>
                    )}
                    <div className="text-gray-600">
                        <h1 className="font-semibold text-gray-800">{name}</h1>
                        <p className="capitalize">{status?.toLowerCase()}</p>
                        <div className="flex items-center gap-2">
                            <Star size={20} className="text-yellow-400"/>
                            <p>{propertyCount || 0} properties</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2 text-gray-600">
                    <div className="flex items-center gap-2">
                        <MapPin size={20}/>
                        <p>{address || 'Location not specified'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <PhoneCall size={20}/>
                        <p>{phone || 'Phone not provided'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Mail size={20}/>
                        <p>{email}</p>
                    </div>
                    {about && (
                        <div className="mt-1">
                            <p className="font-medium text-gray-800">About:</p>
                            <p className="text-sm line-clamp-2">{about}</p>
                        </div>
                    )}
                </div>
            </div>
            <Link to={`/agent-detail-page/${id}`} className=" bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium">View Profile</Link>
        </div>
    )
}

export default AgentItem;