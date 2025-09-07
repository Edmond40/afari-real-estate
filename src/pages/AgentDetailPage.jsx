import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, MapPin, MessageSquare, PhoneCall, } from "lucide-react";
import { useAgents } from "../lib/hooks/useAgents";
import { useListings } from "../lib/hooks/useListings";
import { useInquiries } from "../lib/hooks/useInquiries";
import { toast } from "react-toastify";
import PropertyCard from "../Cards/PropertyCard";

function AgentDetailPage(){
    const { id } = useParams();
    const { agents, loading: agentsLoading } = useAgents({ limit: 100 });
    const { listings, loading: listingsLoading } = useListings({ limit: 100 });
    const { create: createInquiry } = useInquiries();
    const [agent, setAgent] = useState(null);
    const [agentListings, setAgentListings] = useState([]);
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });

    async function handleSubmit(e){
        e.preventDefault();
        try {
            await createInquiry({
                name: contactForm.name,
                email: contactForm.email,
                phone: contactForm.phone,
                message: contactForm.message,
                agentId: parseInt(id),
                type: 'AGENT_CONTACT'
            });
            toast.success('Message sent successfully!');
            setContactForm({ name: '', email: '', phone: '', message: '' });
        } catch {
            toast.error('Failed to send message');
        }
    }

    function handleInputChange(e) {
        const { name, value } = e.target;
        setContactForm(prev => ({ ...prev, [name]: value }));
    }

    useEffect(() => {
        if(agents && agents.length > 0){
            const foundAgent = agents.find(agent => agent.id == id);
            setAgent(foundAgent);
        }
    },[id, agents]);

    useEffect(() => {
        if(listings && agent){
            // Filter by agentId or agentName to handle different data structures
            const filtered = listings.filter(listing => {
                return listing.agentId == id || 
                       listing.agentName === agent.name ||
                       listing.AgentName === agent.name;
            });
            console.log('Agent listings found:', filtered.length, 'for agent:', agent.name);
            setAgentListings(filtered);
        }
    },[listings, agent, id]);

    if (agentsLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600 text-lg">Loading agent details...</div>
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600 text-lg">Agent not found.</div>
            </div>
        );
    }

    return(
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-8xl mx-auto px-7 py-8">
                <nav className="mb-8" data-aos="zoom-in">
                    <ol className="flex items-center space-x-2 text-sm text-gray-600">
                        <li><Link to="/" className="hover:text-blue-600">Home</Link></li>
                        <li>/</li>
                        <li><Link to="/agents-page" className="hover:text-blue-600">Agents</Link></li>
                        <li>/</li>
                        <li className="text-gray-900">{agent.name}</li>
                    </ol>
                </nav>

                <div className="md:grid md:grid-cols-1 lg:grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 md:col-span-1 flex flex-col gap-10">
                        <div className="bg-white rounded-lg shadow-md p-6" data-aos="fade-right">
                            <div className="flex gap-3 items-center mb-6">
                                {agent.image ? (
                                    <img src={agent.image} alt={agent.name} className="w-32 h-32 rounded-full object-cover" />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center">
                                        <span className="text-gray-600 font-semibold text-2xl">{agent.name?.charAt(0)}</span>
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{agent.name}</h2>
                                    <p className="text-gray-600 capitalize">{agent.status?.toLowerCase()}</p>
                                    <p className="flex items-center gap-1 text-gray-600">
                                        <Star size={20} className="text-yellow-400"/>
                                        <span>{agent.propertyCount || 0} properties</span>
                                    </p>
                                </div>
                            </div>

                            <div className="text-gray-600">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">About Me</h3>
                                <p className="mb-4">{agent.description || 'No description available.'}</p>
                                <h1 className="text-lg font-semibold text-gray-900 mb-2">Specialization</h1>
                                {agent.specialization && agent.specialization.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {agent.specialization.map((spec, index) => (
                                            <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                                {spec}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="font-semibold">No specializations listed.</p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-5" data-aos="fade-up">
                            <h1 className="md:text-xl text-base font-semibold">Current Listings</h1>
                            {listingsLoading ? (
                                <div className="text-gray-500">Loading listings...</div>
                            ) : agentListings.length > 0 ? (
                                <div className="grid md:grid-cols-2 gap-6">
                                    {agentListings.map(listing => (
                                        <PropertyCard key={listing.id} property={listing} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-500">No current listings available.</div>
                            )}
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-md shadow-md p-5 flex flex-col gap-3 lg:col-span-1 lg:h-[85%]">
                        <h1 className="md:text-xl font-semibold text-base">Contact Agent</h1>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4" data-aos="fade-up">
                            <div>
                                <label htmlFor="name">Name</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={contactForm.name}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 px-2 py-2 block w-full rounded-md focus:outline-blue-500 outline-blue-100 transition-all duration-500 p-2 shadow-sm focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="email">Email</label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={contactForm.email}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 px-2 py-2 block w-full rounded-md focus:outline-blue-500 outline-blue-100 transition-all duration-500 p-2 shadow-sm focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="phone">Phone</label>
                                <input 
                                    type="text" 
                                    name="phone" 
                                    value={contactForm.phone}
                                    onChange={handleInputChange}
                                    className="mt-1 px-2 py-2 block w-full rounded-md border-gray-300 focus:outline-blue-500 outline-blue-100 transition-all duration-500 p-2 shadow-sm focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="message">Message</label>
                                <textarea 
                                    name="message" 
                                    value={contactForm.message}
                                    onChange={handleInputChange}
                                    rows="4" 
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 focus:outline-blue-500 outline-blue-100 transition-all duration-500 px-2 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                ></textarea>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 duration-300">Send Message</button>
                        </form>

                        <h1 className="md:text-xl font-semibold text-base">Agent Info</h1>
                        <div className="flex flex-col gap-2 text-gray-600 md:w-72 w-52" data-aos="fade-left">
                            <div className="flex items-center gap-2">
                                <MapPin size={20}/>
                                <p>{agent.address || 'Location not specified'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <PhoneCall size={20}/>
                                <p>{agent.phone || 'Phone not provided'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <MessageSquare size={20}/>
                                <p>{agent.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AgentDetailPage;