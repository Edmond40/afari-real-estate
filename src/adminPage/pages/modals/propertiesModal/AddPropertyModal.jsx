import { UserPlus, X } from "lucide-react";
import { motion } from 'framer-motion'
import { useState } from 'react';

function AddPropertyModal({onClose, onAddProperty}){
    const [form, setForm] = useState({
        title: '',
        location: '',
        image: '',
        price: '',
        propertyType: '',
        category: '',
        bedrooms: '',
        bathrooms: '',
        area: '',
        AgentName: '',
        AgentImage: '',
        AgentStatus: '',
        AgentEmail: '',
        AgentNumber: ''
    });
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [agentImagePreview, setAgentImagePreview] = useState('');

    function handleOnChange(event){
        const { name, type, files } = event.target;
        if (type === 'file' && files && files[0]) {
            const file = files[0];
            if (!file.type.startsWith('image/')) {
                setError('Only image files are allowed.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                if (name === 'image') {
                    setForm(prev => ({ ...prev, image: reader.result }));
                    setImagePreview(reader.result);
                } else if (name === 'AgentImage') {
                    setForm(prev => ({ ...prev, AgentImage: reader.result }));
                    setAgentImagePreview(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    }

    function SubmitForms(event){
        event.preventDefault();
        // Validation: all fields required
        for (const key in form) {
            if (!form[key]) {
                setError('All fields are required.');
                return;
            }
        }
        // Image validation: must be a valid data URL (from file upload)
        if (!/^data:image\/.+;base64,/.test(form.image)) {
            setError('Please upload a valid property image file.');
            return;
        }
        if (!/^data:image\/.+;base64,/.test(form.AgentImage)) {
            setError('Please upload a valid agent image file.');
            return;
        }
        setError('');
        onAddProperty({
            ...form,
            price: Number(form.price),
            bedrooms: Number(form.bedrooms),
            bathrooms: Number(form.bathrooms),
            area: Number(form.area)
        });
    }

    return(
        <div className="fixed inset-0 backdrop-brightness-50 flex items-center justify-center z-50 overflow-auto top-0 bottom-0 pt-52" onClick={onClose}>
            <motion.div className="bg-white shadow p-8 w-full md:w-1/2 mx-auto rounded-lg p-4 text-gray-900 mt-52 mb-5" 
                initial={{ scale: 0, x: -100 }}
                animate={{ scale: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                onClick={(e) => e.stopPropagation()}>
                <div className="relative">
                    <X size={20} className="text-gray-700 absolute right-5 -top-6 cursor-pointer " onClick={onClose}/>
                    <form onSubmit={SubmitForms} className="flex flex-col gap-4">
                        <div className=" md:grid md:grid-cols-2 flex flex-col gap-4">
                            <input type="text" name="title" placeholder="Title*" value={form.title} onChange={handleOnChange} className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"/>
                            <input type="text" name="location" placeholder="Location*" value={form.location} onChange={handleOnChange} className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"/>
                            {/* Property Image upload only */}
                            <div className="flex flex-col gap-2">
                                <input type="file" name="image" accept="image/*" onChange={handleOnChange} className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"/>
                                {imagePreview && <img src={imagePreview} alt="Preview" className="w-32 h-24 object-cover rounded-md border mt-2" />}
                            </div>
                            <input type="number" name="price" placeholder="Price*" value={form.price} onChange={handleOnChange} className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"/>
                            <select name="propertyType" value={form.propertyType} onChange={handleOnChange} className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300">
                                <option value="">Property Type*</option>
                                <option value="For Sale">For Sale</option>
                                <option value="For Rent">For Rent</option>
                                <option value="Sold">Sold</option>
                                <option value="Rented">Rented</option>
                                <option value="Under Offer">Under Offer</option>
                                <option value="Apartment">Apartment</option>
                                <option value="House">House</option>
                                <option value="Land">Land</option>
                            </select>
                            <select name="category" value={form.category} onChange={handleOnChange} className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300">
                                <option value="">Category*</option>
                                <option value="For Sale">For Sale</option>
                                <option value="For Rent">For Rent</option>
                            </select>
                            <input type="number" name="bedrooms" placeholder="Bedrooms*" value={form.bedrooms} onChange={handleOnChange} className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"/>
                            <input type="number" name="bathrooms" placeholder="Bathrooms*" value={form.bathrooms} onChange={handleOnChange} className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"/>
                        </div>
                        <input type="number" name="area" placeholder="Area*" value={form.area} onChange={handleOnChange} className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"/>
                        <input type="text" name="AgentName" placeholder="Agent Name*" value={form.AgentName} onChange={handleOnChange} className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"/>
                        {/* Agent Image upload only */}
                        <div className="flex flex-col gap-2">
                            <input type="file" name="AgentImage" accept="image/*" onChange={handleOnChange} className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"/>
                            {agentImagePreview && <img src={agentImagePreview} alt="Agent Preview" className="w-32 h-24 object-cover rounded-md border mt-2" />}
                        </div>
                        <input type="text" name="AgentStatus" placeholder="Agent Status*" value={form.AgentStatus} onChange={handleOnChange} className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"/>
                        <input type="email" name="AgentEmail" placeholder="Agent Email*" value={form.AgentEmail} onChange={handleOnChange} className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"/>
                        <input type="text" name="AgentNumber" placeholder="Agent Phone*" value={form.AgentNumber} onChange={handleOnChange} className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"/>
                        {error && <div className="text-red-500 text-sm">{error}</div>}
                        <button type="submit" className="flex w-52 mx-auto justify-center items-center gap-1 bg-blue-500 text-white p-2 rounded-md hover:scale-110 duration-300 cursor-pointer">
                            <UserPlus/>
                            <span>Add New Property</span>
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}

export default AddPropertyModal;