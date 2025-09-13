import { UserPlus, X } from "lucide-react";
// import { motion } from 'framer-motion' // Not currently used
import { useState } from 'react';
import { useListings } from '../../../../lib/hooks/useListings';
import { useAgents } from '../../../../lib/hooks/useAgents';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function AddPropertyModal(){
    const { create } = useListings();
    const { agents } = useAgents();
    const navigate = useNavigate();

    // Add property handler
    const handleAddProperty = async (payload) => {
        await create(payload);
        toast.success('Property Successfully Added!');
    };

    const [form, setForm] = useState({
        title: '',
        description: '',
        price: '',
        // Address breakdown per schema
        address: '',
        city: '',
        state: '',
        zipCode: '',
        // Listing fields
        type: '',
        status: '',
        bedrooms: '',
        bathrooms: '',
        area: '',
        // Agent fields
        agentId: '',
        agentName: '',
        agentAddress: '',
        agentImage: ''
    });
    const [error, setError] = useState('');
    const [images, setImages] = useState(['', '', '', '']);
    const [imagePreviews, setImagePreviews] = useState(['', '', '', '']);
    const [agentImagePreview, setAgentImagePreview] = useState('');
    
    // Handle agent selection
    const handleAgentSelect = (agentId) => {
        const selectedAgent = agents.find(agent => agent.id === parseInt(agentId));
        if (selectedAgent) {
            setForm(prev => ({
                ...prev,
                agentId,
                agentName: selectedAgent.name,
                agentAddress: selectedAgent.address || '',
                agentImage: selectedAgent.image || ''
            }));
            setAgentImagePreview(selectedAgent.image || '');
        }
    };
    

    function handleOnChange(event){
        const { name, type, files, value } = event.target;
        if (type === 'file' && files && files[0]) {
            const file = files[0];
            if (!file.type.startsWith('image/')) {
                setError('Only image files are allowed.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                if (name.startsWith('image')) {
                    const index = parseInt(name.replace('image', ''), 10) - 1;
                    if (!Number.isNaN(index) && index >= 0 && index < 4) {
                        setImages(prev => {
                            const next = [...prev];
                            next[index] = reader.result;
                            return next;
                        });
                        setImagePreviews(prev => {
                            const next = [...prev];
                            next[index] = reader.result;
                            return next;
                        });
                    }
                } else if (name === 'agentImage') {
                    setForm(prev => ({ ...prev, agentImage: reader.result }));
                    setAgentImagePreview(reader.result);
                }
            };
            reader.readAsDataURL(file);
        } else if (name === 'agentId') {
            handleAgentSelect(value);
        } else {
            // Non-file inputs: update form state
            setForm(prev => ({ ...prev, [name]: value }));
        }
    }

    function SubmitForms(event){
        event.preventDefault();
        // Validation: required fields per schema
        const required = ['title','description','price','address','city','state','zipCode','type','status','bedrooms','bathrooms','area','agentName','agentAddress'];
        for (const key of required) {
            if (!String(form[key] ?? '').trim()) {
                setError('Please complete all required fields.');
                return;
            }
        }
        // At least one property image required
        const pickedImages = images.filter(Boolean);
        if (pickedImages.length === 0) {
            setError('Please upload at least one property image.');
            return;
        }
        // Agent image required
        if (!/^data:image\/.+;base64,/.test(form.agentImage)) {
            setError('Please upload a valid agent image file.');
            return;
        }
        setError('');
        // Map UI values to backend enums when needed
        const statusMap = {
            'FOR_SALE': 'FOR_SALE',
            'FOR_RENT': 'FOR_RENT',
            'SOLD': 'SOLD',
            'PENDING': 'PENDING',
            'DRAFT': 'DRAFT',
            'For Sale': 'FOR_SALE',
            'For Rent': 'FOR_RENT',
        };
        const payload = {
            title: form.title,
            description: form.description,
            price: Number(form.price),
            bedrooms: Number(form.bedrooms),
            bathrooms: Number(form.bathrooms),
            area: Number(form.area),
            address: form.address,
            city: form.city,
            state: form.state,
            zipCode: form.zipCode,
            type: form.type,
            status: statusMap[form.status] || form.status,
            images: pickedImages,
            features: [],
            agentName: form.agentName,
            agentAddress: form.agentAddress,
            agentImage: form.agentImage,
        };
        handleAddProperty(payload)
            .then(() => navigate('/admin/properties'))
            .catch(() => setError('Failed to add property. Please try again.'));
    }

    return(
        <div className="flex items-center justify-center min-h-screen">
            <div className="relative">
                <form onSubmit={SubmitForms} className="flex flex-col gap-4">
                    <div className=" md:grid md:grid-cols-2 flex flex-col gap-4">
                        <input type="text" name="title" placeholder="Title*" value={form.title} onChange={handleOnChange} className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"/>
                        <input type="text" name="description" placeholder="Description*" value={form.description} onChange={handleOnChange} className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"/>
                        {/* Property Images upload (4 slots) */}
                        <div className="grid grid-cols-2 gap-4 col-span-2">
                            {[0,1,2,3].map((idx) => (
                                <div key={idx} className="flex flex-col gap-2">
                                    <label className="text-sm text-gray-600">Image {idx+1}</label>
                                    <input
                                        type="file"
                                        name={`image${idx+1}`}
                                        accept="image/*"
                                        onChange={handleOnChange}
                                        className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"
                                    />
                                    {imagePreviews[idx] && (
                                        <img src={imagePreviews[idx]} alt={`Preview ${idx+1}`} className="w-32 h-24 object-cover rounded-md border mt-2" />
                                    )}
                                </div>
                            ))}
                        </div>
                        <input type="number" name="price" placeholder="Price*" value={form.price} onChange={handleOnChange} className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"/>
                        {/* Listing status and type */}
                        <select name="status" value={form.status} onChange={handleOnChange} className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300">
                            <option value="">Status*</option>
                            <option value="FOR_SALE">For Sale</option>
                            <option value="FOR_RENT">For Rent</option>
                            <option value="SOLD">Sold</option>
                            <option value="PENDING">Pending</option>
                            <option value="DRAFT">Draft</option>
                        </select>
                        <select name="type" value={form.type} onChange={handleOnChange} className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300">
                            <option value="">Type*</option>
                            <option value="Apartment">Apartment</option>
                            <option value="House">House</option>
                            <option value="Townhouse">Townhouse</option>
                            <option value="Villa">Villa</option>
                            <option value="Land">Land</option>
                        </select>
                        <input type="number" name="bedrooms" placeholder="Bedrooms*" value={form.bedrooms} onChange={handleOnChange} className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"/>
                        <input type="number" name="bathrooms" placeholder="Bathrooms*" value={form.bathrooms} onChange={handleOnChange} className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"/>
                    </div>
                    {/* Address details */}
                    <input type="text" name="address" placeholder="Street Address*" value={form.address} onChange={handleOnChange} className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"/>
                    <div className="grid grid-cols-3 gap-4">
                        <input type="text" name="city" placeholder="City*" value={form.city} onChange={handleOnChange} className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"/>
                        <input type="text" name="state" placeholder="State*" value={form.state} onChange={handleOnChange} className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"/>
                        <input type="text" name="zipCode" placeholder="Zip Code*" value={form.zipCode} onChange={handleOnChange} className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"/>
                    </div>
                    <input type="number" name="area" placeholder="Area (sqft)*" value={form.area} onChange={handleOnChange} className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"/>
                    {/* Agent Selection */}
                    <div className="col-span-2">
                        <label className="text-sm text-gray-600 block mb-2">Select Agent*</label>
                        <select 
                            name="agentId" 
                            value={form.agentId} 
                            onChange={handleOnChange} 
                            className="w-full border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"
                            required
                        >
                            <option value="">Choose an agent...</option>
                            {agents.map(agent => (
                                <option key={agent.id} value={agent.id}>
                                    {agent.name} - {agent.status}
                                </option>
                            ))}
                        </select>
                        {form.agentId && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                <div className="flex items-center gap-3">
                                    {agentImagePreview && (
                                        <img 
                                            src={agentImagePreview} 
                                            alt="Selected Agent" 
                                            className="w-16 h-16 object-cover rounded-full"
                                        />
                                    )}
                                    <div>
                                        <p className="font-medium">{form.agentName}</p>
                                        <p className="text-sm text-gray-600">{form.agentAddress}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    <button type="submit" className="flex w-52 mx-auto justify-center items-center gap-1 bg-blue-500 text-white p-2 rounded-md hover:scale-110 duration-300 cursor-pointer">
                        <UserPlus/>
                        <span>Add New Property</span>
                    </button>
                </form>
            </div>
        </div>
    )
}

export default AddPropertyModal;