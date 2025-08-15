import { HousePlus, SquarePen, Trash2, UserPlus } from "lucide-react";
import { useContext, useState } from "react";
import { toast } from "react-toastify";
import { ShopContext } from '../../context/ShopContext';
import { Link } from 'react-router-dom';

function Properties(){
    const { properties, deleteProperty } = useContext(ShopContext);

    // Delete property handler
    const handleDeleteProperty = (id) => {
        if(window.confirm('Are you sure you want to delete this property?')) {
            deleteProperty(id);
            toast.success('Property Deleted!');
        }
    };

    return(
        <div className="p-4 flex flex-col gap-3">
            <div className="bg-gray-100 flex justify-between gap-4 rounded-lg shadow-sm p-6">
                <div className='flex gap-1 items-center'>
                    <HousePlus className='text-green-400'/>
                    <h1 className="text-xl font-semibold text-gray-700">Property Management</h1>
                </div>
                <Link to="/admin/add-property" className="flex items-center gap-1 bg-blue-500 text-white p-2 rounded-md hover:scale-110 duration-300 cursor-pointer">
                    <UserPlus/>
                    <span>Add New Property</span>
                </Link>
            </div>
            
            
            <div className="w-full overflow-x-auto h-[60vh] border rounded-md">
                <table className="w-full border ">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-100">
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Title</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Location</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Image</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Price</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Property Type</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Purpose/Type</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Bedrooms</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Bathrooms</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Area</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Agent Name</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Agent Image</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Status</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Email</th>                           
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Number</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            properties.map((property) => (
                                <tr key={property.id} className="border-b border-gray-200">
                                    <td className="text-left py-3 px-4 font-medium text-gray-700 ">{property.title || property.name}</td>
                                    <td className="text-left py-3 px-4 font-medium text-gray-700 ">{property.location}</td>
                                    <td><img src={property.image} alt="image" className='w-22 h-18 p-2 object-cover rounded-full'/></td>
                                    <td className="text-left py-3 px-4 font-medium text-gray-700 ">{property.price}</td>
                                    <td className="text-left py-3 px-4 font-medium text-gray-700 ">{property.propertyType}</td>
                                    <td className="text-left py-3 px-4 font-medium text-gray-700 ">{property.purpose || property.category}</td>
                                    <td className="text-left py-3 px-4 font-medium text-gray-700 ">{property.bedrooms}</td>
                                    <td className="text-left py-3 px-4 font-medium text-gray-700 ">{property.bathrooms}</td>
                                    <td className="text-left py-3 px-4 font-medium text-gray-700 ">{property.area}</td>
                                    <td className="p-3">{property.AgentName || property.name}</td>
                                    <td><img src={property.AgentImage || property.agentImage} alt="image" className='w-22 h-18 p-2 object-cover rounded-full'/></td>
                                    <td className="text-left py-3 px-4 font-medium text-gray-700 ">{property.AgentStatus || property.agentStatus}</td>
                                    <td className="text-left py-3 px-4 font-medium text-gray-700 ">{property.AgentEmail || property.email}</td>
                                    <td className="text-left py-3 px-4 font-medium text-gray-700 ">{property.AgentNumber || property.number}</td>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <Link to={`/admin/edit-property/${property.id}`}>
                                                <SquarePen size={25} className="text-blue-500 hover:text-blue-600 hover:scale-110 duration-300 cursor-pointer" />
                                            </Link>
                                            <Trash2 size={25} className="text-red-500 hover:text-red-600 hover:scale-110 duration-300 cursor-pointer" onClick={() => handleDeleteProperty(property.id)} />
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

export default Properties;