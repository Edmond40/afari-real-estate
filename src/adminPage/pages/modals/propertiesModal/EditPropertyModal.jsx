import { SquarePen, X } from "lucide-react";
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react';
import { useListings } from '../../../../lib/hooks/useListings';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from "react-toastify";

function EditPropertyModal(){
    const { id } = useParams();
    const navigate = useNavigate();
    const { listings, update } = useListings();
    const property = (listings || []).find(p => String(p.id) === String(id));

    // Edit handler (backend): only update fields provided; here we focus on agentImage
    const handleEditProperty = async (payload) => {
        await update({ id, payload });
        toast.success('Property Edited Successfully!');
    };

    
    const [form, setForm] = useState({
        title: '',
        location: '',
        price: '',
        propertyType: '',
        category: '',
        bedrooms: '',
        bathrooms: '',
        area: '',
        AgentName: '',
        AgentAddress: '',
        AgentImage: ''
    });
    const [error, setError] = useState('');
    const [images, setImages] = useState(['', '', '', '']);
    const [imagePreviews, setImagePreviews] = useState(['', '', '', '']);
    const [agentImagePreview, setAgentImagePreview] = useState('');

    useEffect(() => {
        if (property) {
            setForm({
                title: property.title || property.name || '',
                location: property.location || '',
                price: property.price || '',
                propertyType: property.propertyType || '',
                category: property.category || property.purpose || '',
                bedrooms: property.bedrooms || '',
                bathrooms: property.bathrooms || '',
                area: property.area || '',
                AgentName: property.AgentName || property.name || '',
                AgentAddress: property.AgentAddress || property.agentAddress || '',
                AgentImage: property.AgentImage || property.agentImage || ''
            });
            // Initialize images from property.images or fallback to single image
            const existing = Array.isArray(property.images) ? property.images : (property.image ? [property.image] : []);
            const firstFour = [...existing].slice(0, 4);
            const padded = [...firstFour, '', '', '', ''].slice(0, 4);
            setImages(padded);
            setImagePreviews(padded);
            setAgentImagePreview(property.AgentImage || property.agentImage || '');
        }
    }, [property]);

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
                } else if (name === 'AgentImage') {
                    setForm(prev => ({ ...prev, AgentImage: reader.result }));
                    setAgentImagePreview(reader.result);
                }
            };
            reader.readAsDataURL(file);
        } else {
            // Non-file inputs: update form state
            setForm(prev => ({ ...prev, [name]: value }));
        }
    }

    async function SubmitForms(event){
        event.preventDefault();
        // Build payload with any provided fields mapped to backend schema
        const payload = {};

        // Core listing fields
        if (form.title) payload.title = form.title;
        if (form.price !== '' && form.price !== null) payload.price = Number(form.price);
        if (form.bedrooms !== '' && form.bedrooms !== null) payload.bedrooms = Number(form.bedrooms);
        if (form.bathrooms !== '' && form.bathrooms !== null) payload.bathrooms = Number(form.bathrooms);
        if (form.area !== '' && form.area !== null) payload.area = Number(form.area);

        // Images (only include if user selected any; keep existing otherwise)
        const pickedImages = (images || []).filter(Boolean);
        if (pickedImages.length > 0) payload.images = pickedImages;

        // Agent fields (denormalized)
        if (form.AgentName) payload.agentName = form.AgentName;
        if (form.AgentAddress) payload.agentAddress = form.AgentAddress;
        if (form.AgentImage) {
            if (!/^data:image\/.+;base64,/.test(form.AgentImage)) {
                setError('Please upload a valid agent image file.');
                return;
            }
            payload.agentImage = form.AgentImage;
        }

        if (Object.keys(payload).length === 0) {
            setError('No changes to update. Modify some fields and try again.');
            return;
        }

        setError('');
        await handleEditProperty(payload);
        navigate('/admin/properties');
    }

    return(
        <div className="flex items-center justify-center">           
            <div className="relative">
                <form onSubmit={SubmitForms} className="flex flex-col gap-4">
                    <div className=" md:grid md:grid-cols-2 flex flex-col gap-4">
                        <input type="text" name="title" placeholder="Title*" value={form.title} onChange={handleOnChange} className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"/>
                        <input type="text" name="location" placeholder="Location*" value={form.location} onChange={handleOnChange} className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"/>
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
                    <input type="text" name="AgentAddress" placeholder="Agent Address*" value={form.AgentAddress} onChange={handleOnChange} className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"/>
                    {/* Agent Image upload */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm text-gray-600">Agent Image</label>
                        <input type="file" name="AgentImage" accept="image/*" onChange={handleOnChange} className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"/>
                        {agentImagePreview && <img src={agentImagePreview} alt="Agent Preview" className="w-32 h-24 object-cover rounded-md border mt-2" />}
                    </div>
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    <button type="submit" className="flex w-52 mx-auto justify-center items-center gap-1 bg-blue-500 text-white p-2 rounded-md hover:scale-110 duration-300 cursor-pointer">
                        <SquarePen/>
                        <span>Edit Property</span>
                    </button>
                </form>
            </div>
        </div>
    )
}

export default EditPropertyModal;