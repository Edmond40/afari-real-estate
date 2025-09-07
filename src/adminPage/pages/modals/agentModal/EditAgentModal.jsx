import { SquarePen, X } from "lucide-react";
import { useState } from 'react';
import { motion } from 'framer-motion'
import { toast } from 'react-toastify';
import { useAgents } from '../../../../lib/hooks/useAgents';

function EditAgentModal({onClose, agent}){
    const { update } = useAgents();
    const [formData, setFormData] = useState({
        name: agent?.name || '',
        email: agent?.email || '',
        phone: agent?.phone || '',
        address: agent?.address || '',
        description: agent?.description || '',
        about: agent?.about || agent?.description || '', // Map description to about for backward compatibility
        specialization: Array.isArray(agent?.specialization) ? agent.specialization : [],
        status: agent?.status || 'ACTIVE',
        propertyCount: agent?.propertyCount || 0,
        image: agent?.image || null
    });

    const specializationOptions = [
        'Residential Sales',
        'Commercial Sales',
        'Property Management',
        'Real Estate Investment',
        'Luxury Properties',
        'First-Time Buyers',
        'Rental Properties',
        'Land Development',
        'Property Valuation',
        'Real Estate Law'
    ];
    const [imagePreview, setImagePreview] = useState(agent?.image || null);

    async function SubmitForms(event){
        event.preventDefault();
        try {
            // Convert image to base64 if provided
            let imageData = formData.image;
            if (formData.image && typeof formData.image !== 'string') {
                const reader = new FileReader();
                imageData = await new Promise((resolve) => {
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(formData.image);
                });
            }

            const agentData = {
                id: agent.id,
                name: formData.name,
                email: formData.email,
                phone: formData.phone || null,
                address: formData.address || null,
                propertyCount: Number(formData.propertyCount) || 0,
                description: formData.about || formData.description || '', // Map about to description
                specialization: Array.isArray(formData.specialization) ? formData.specialization : [],
                status: formData.status || 'ACTIVE'
            };

            // Only include image if it was changed
            if (imageData && imageData !== agent?.image) {
                agentData.image = imageData;
            }

            await update(agentData);
            toast.success('Agent updated successfully');
            onClose();
        } catch {
            toast.error('Failed to update agent');
        }
    }

    function handleOnChange(event){
        const { name, value, files, type, checked } = event.target;
        if (name === 'image' && files[0]) {
            setFormData(prev => ({ ...prev, image: files[0] }));
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(files[0]);
        } else if (type === 'checkbox' && name === 'specialization') {
            setFormData(prev => {
                const currentSpecs = Array.isArray(prev.specialization) ? prev.specialization : [];
                const newSpecs = checked
                    ? [...currentSpecs, value]
                    : currentSpecs.filter(spec => spec !== value);
                return {
                    ...prev,
                    specialization: newSpecs
                };
            });
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    }

    return(
        <div className="fixed inset-0 backdrop-brightness-50 flex items-center justify-center z-50 overflow-auto top-0 bottom-0 py-10 h-screen" onClick={onClose}>
            <motion.div className="bg-white shadow w-full md:w-4/6 p-10 mt-52 mx-auto rounded-lg text-gray-900"
                initial={{ scale: 0, x: -100 }}
                animate={{ scale: 1, x: 0 }}
                // exit={{ scale: 0, x: 50 }}
                transition={{ duration: 0.6 }}
                onClick={(e) => e.stopPropagation()}>
                <div className="relative">
                    <X size={20} className="text-gray-700 absolute right-5 -top-6 cursor-pointer " onClick={onClose}/>
                    <form onSubmit={SubmitForms} className="flex flex-col gap-4">
                        <div className=" flex flex-col gap-4">
                            <div className="flex justify-between gap-4">
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={formData.name}
                                    onChange={handleOnChange}
                                    placeholder="Name*" 
                                    className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300 w-full"
                                    required
                                />

                                <input 
                                    type="email" 
                                    name="email" 
                                    value={formData.email}
                                    onChange={handleOnChange}
                                    placeholder="Email*" 
                                    className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300 w-full"
                                    required
                                />
                            </div>

                            <div className="flex justify-between gap-4">
                                <input 
                                    type="text" 
                                    name="phone" 
                                    value={formData.phone}
                                    onChange={handleOnChange}
                                    placeholder="Phone Number" 
                                    className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300 w-full"
                                />

                                <input 
                                    type="text" 
                                    name="address" 
                                    value={formData.address}
                                    onChange={handleOnChange}
                                    placeholder="Address/Location"
                                    className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300 w-full"
                                />
                            </div>
                            
                            <div className="flex justify-between gap-4">
                                <input
                                    type="number"
                                    name="propertyCount"
                                    value={formData.propertyCount || 0}
                                    onChange={handleOnChange}
                                    placeholder="Number of Properties"
                                    min="0"
                                    className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300 w-full"
                                />
                            </div>
                            
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
                                    <textarea 
                                        name="about" 
                                        value={formData.about}
                                        onChange={handleOnChange}
                                        placeholder="Tell us about the agent..." 
                                        rows={3}
                                        className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300 resize-none w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Short Bio)</label>
                                    <textarea 
                                        name="description" 
                                        value={formData.description}
                                        onChange={handleOnChange}
                                        placeholder="Short description for listings..." 
                                        rows={2}
                                        maxLength={160}
                                        className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300 resize-none w-full"
                                    />
                                    <p className="text-xs text-gray-500 text-right">{formData.description?.length || 0}/160 characters</p>
                                </div>
                            </div>

                            {/* Specialization Checkboxes */}
                            <div className="border-2 border-gray-700 rounded-md p-3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Specializations
                                </label>
                                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                                    {specializationOptions.map(option => (
                                        <label key={option} className="flex items-center space-x-2 text-sm">
                                            <input
                                                type="checkbox"
                                                name="specialization"
                                                value={option}
                                                checked={formData.specialization.includes(option)}
                                                onChange={handleOnChange}
                                                className="rounded"
                                            />
                                            <span>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <select 
                                name="status" 
                                value={formData.status}
                                onChange={handleOnChange}
                                className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="PENDING">Pending</option>
                                <option value="SUSPENDED">Suspended</option>
                                <option value="ON_LEAVE">On Leave</option>
                            </select>

                            {/* Image Upload */}
                            <div className="border-2 border-gray-700 rounded-md p-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Agent Photo
                                </label>
                                <input 
                                    type="file" 
                                    name="image" 
                                    accept="image/*"
                                    onChange={handleOnChange}
                                    className="w-full"
                                />
                                {imagePreview && (
                                    <div className="mt-2">
                                        <img 
                                            src={imagePreview} 
                                            alt="Preview" 
                                            className="w-20 h-20 object-cover rounded-full mx-auto"
                                        />
                                    </div>
                                )}
                            </div>

                            <button 
                                type="submit"
                                className="flex w-52 mx-auto justify-center items-center gap-1 bg-blue-500 text-white p-2 rounded-md hover:scale-110 duration-300 cursor-pointer"
                            >
                                <SquarePen/>
                                <span>Edit Agent</span>
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}


export default EditAgentModal;