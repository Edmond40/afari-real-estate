import { Mail, MapPin, PhoneCall, Star } from "lucide-react";
import { Link } from "react-router-dom";



function AgentItem({id, AgentName, AgentImage, AgentStatus, AgentEmail, Location,
    AgentNumber, AgentProperties}){


    return(
        <div className="bg-white w-full w-full flex flex-col gap-4 shadow-sm rounded-md h-full relative overflow-hidden p-4 hover:-translate-y-4 duration-500" data-aos="fade-right">
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                    <img src={AgentImage} alt={AgentName} className="w-20 h-20 rounded-full object-cover"/>
                    <div className="text-gray-600">
                        <h1 className="font-semibold text-gray-800">{AgentName}</h1>
                        <p>{AgentStatus}</p>
                        <div className="flex items-center gap-2">
                            <Star size={20} className="text-yellow-400"/>
                            <p>{AgentProperties} properties</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2 text-gray-600">
                    <div className="flex items-center gap-2">
                        <MapPin size={20}/>
                        <p>{Location}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <PhoneCall size={20}/>
                        <p>{AgentNumber}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Mail size={20}/>
                        <p>{AgentEmail}</p>
                    </div>
                </div>
            </div>
            <Link to={`/agent-detail-page/${id}`} className=" bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium">View Profile</Link>
        </div>
    )
}

export default AgentItem;