import { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { Star, MapPin, MessageSquare, PhoneCall, } from "lucide-react";
import AgentGallery from "../components/AgentGallery";

function AgentDetailPage(){
    const { id } = useParams()
    const {agentInfo} = useContext(ShopContext);
    const [agent, setAgent] = useState(null)

    function handleSubmit(e){
        e.target.name
    }

    useEffect(() => {
        if(agentInfo.length > 0){
            const foundAgent = agentInfo.find(agent => agent.id == id);
            setAgent(foundAgent);
        }

    },[id, agentInfo])

    if (!agent) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600 text-lg">{agentInfo.length === 0 ? "Loading..." : "Agent not found."}</div>
            </div>
        );
    }

    return(
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-8xl mx-auto px-7 py-8">
                <nav className="mb-8">
                    <ol className="flex items-center space-x-2 text-sm text-gray-600">
                        <li><Link to="/" className="hover:text-blue-600">Home</Link></li>
                        <li>/</li>
                        <li><Link to="/agents-page" className="hover:text-blue-600">Agents</Link></li>
                        <li>/</li>
                        <li className="text-gray-900">{agent.AgentName}</li>
                    </ol>
                </nav>

                <div className="md:grid md:grid-cols-1 lg:grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 md:col-span-1 flex flex-col gap-10">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex gap-3 items-center mb-6">
                                <img src={agent.AgentImage} alt={agent.AgentName} className="w-32 h-32 rounded-full object-cover" />
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{agent.AgentName}</h2>
                                    <p className="text-gray-600">{agent.AgentStatus}</p>
                                    <p className="flex items-center gap-1 text-gray-600">
                                        <Star size={20} className="text-yellow-400"/>
                                        <span>{agent.AgentProperties} properties</span>
                                    </p>
                                </div>
                            </div>

                            <div className="text-gray-600">
                                <h3 className="text-lg font-semibold text-gray-900">About Me</h3>
                                <p className="">{agent.AgentDescription}</p>
                                <h1 className="text-lg font-semibold text-gray-900">Specializtion</h1>
                                <p className="font-semibold">{agent.AgentSpecialization}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-5">
                            <h1 className="md:text-xl text-base font-semibold">Current Listings</h1>
                            <div>
                                <AgentGallery/>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-md shadow-md p-5 flex flex-col gap-3 lg:col-span-1 lg:h-[85%]">
                        <h1 className="md:text-xl font-semibold text-base">Contact Agent</h1>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4 ">
                            <div>
                                <label htmlFor="name">Name</label>
                                <input type="text" name="name" id="" className="mt-1 px-2 py-2 duration-500 block w-full rounded-md focus:outline-blue-500 outline-blue-100 duration-500 p-2 shadow-sm focus:border-blue-500"/>
                            </div>
                            <div>
                                <label htmlFor="email">Email</label>
                                <input type="text" name="email" id="" className="mt-1 px-2 py-2 duration-500 block w-full rounded-md focus:outline-blue-500 outline-blue-100 duration-500 p-2 shadow-sm focus:border-blue-500"/>
                            </div>
                            <div>
                                <label htmlFor="phone">Phone</label>
                                <input type="text" name="phone" id="" className="mt-1 px-2 py-2 duration-500 block w-full rounded-md border-gray-300 focus:outline-blue-500 outline-blue-100 duration-500 p-2 shadow-sm focus:border-blue-500"/>
                            </div>
                            <div>
                                <label htmlFor="message">Message</label>
                                <textarea name="" id="" rows="4" className="mt-1 block w-full rounded-md border-gray-300 focus:outline-blue-500 outline-blue-100 duration-500 px-2 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 duration-300">Send Message</button>
                        </form>
                        <h1 className="md:text-xl font-semibold text-base">Agent Info</h1>
                        <div className="flex flex-col gap-2 text-gray-600">
                            <div className="flex items-center gap-2">
                                <MapPin size={20}/>
                                <p>{agent.Location}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <PhoneCall size={20}/>
                                <p>{agent.AgentNumber}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <MessageSquare size={20}/>
                                <p>{agent.AgentEmail}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AgentDetailPage;