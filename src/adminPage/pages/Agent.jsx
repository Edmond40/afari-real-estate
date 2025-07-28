
import { Contact, SquarePen, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import Team1 from '../../assets/images/team1.jpg'
import Team2 from '../../assets/images/team2.jpeg'
import AddAgentModal from "./modals/agentModal/AddAgentModal";
import EditAgentModal from "./modals/agentModal/EditAgentModal";

function Agent(){


    const [showModal, setShowModal] = useState(false);
    const [editModal, setShowEditModal] = useState(false)

    return(
        <div className="p-4 flex flex-col gap-3">
            
            <div className="bg-gray-100 flex justify-between gap-4 rounded-lg shadow-sm p-6">
                <div className='flex gap-1 items-center'>
                    <Contact className='text-orange-400'/>
                    <h1 className="text-xl font-semibold text-gray-700">Agent Management</h1>
                </div>
                <div className="flex items-center gap-1 bg-blue-500 text-white p-2 rounded-md hover:scale-110 duration-300 cursor-pointer" onClick={()=> setShowModal(true)}>
                    <UserPlus/>
                    <span>Add New Agent</span>
                </div>
            </div>

            {/* AddPropertyModal */}
            { showModal && <AddAgentModal onClose={()=> setShowModal(false)}/>}
            { editModal && <EditAgentModal onClose={() => setShowEditModal(false)}/>}
            
            <div className="w-full overflow-x-auto h-[60vh] border rounded-md">
                <table className="w-full border ">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-100">
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Agent Name</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Agent Image</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Email</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Number</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Status</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Properties</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Date</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            AgentsCard.map((property) => (
                                <tr key={property.id} className="border-b border-gray-200">
                                    <td className="p-3">{property.name}</td>
                                    <td><img src={property.agentImage} alt="image" className='w-22 h-22 p-2 object-cover rounded-full'/></td>
                                    <td className="text-left py-3 px-4 font-medium text-gray-700 ">{property.email}</td>
                                    <td className="text-left py-3 px-4 font-medium text-gray-700 ">{property.number}</td>
                                    <td className="text-left py-3 px-4 font-medium text-gray-700 ">{property.agentStatus}</td>
                                    <td className="text-left py-3 px-4 font-medium text-gray-700 ">{property.properties}</td>
                                    <td className="text-left py-3 px-4 font-medium text-gray-700 ">{property.data}</td>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <SquarePen size={25} className="text-blue-500 hover:text-blue-600 hover:scale-110 duration-300 cursor-pointer" onClick={()=> setShowEditModal(true)}/>
                                            <Trash2 size={25} className="text-red-500 hover:text-red-600 hover:scale-110 duration-300 cursor-pointer" />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}


export default Agent;


const AgentsCard = [
    {id:1, name: "Edmond Osei", agentImage: Team1, agentStatus: "On Leave", email: "yhoungpromise@gmail.com", properties: 28, data: "21/07/2025",  number: "0209732250"},
    {id:2, name: "Edmond Osei", agentImage: Team2, agentStatus: "On Leave", email: "yhoungpromise@gmail.com", properties: 10, data: "2/07/2025",  number: "0553050084"},   
]