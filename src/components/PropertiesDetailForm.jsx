import { useContext, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useParams } from 'react-router-dom';

function PropertiesDetailForm({ property }){
    const { addInquiry, properties } = useContext(ShopContext);
    const { id } = useParams();
    const [form, setForm] = useState({
        user: '',
        phone: '',
        message: '',
        email: ''
    });
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Get property and agent info
    const prop = property || (properties && properties.find(p => p.id == id));
    const agentName = prop?.AgentName || '';
    const agentStatus = prop?.AgentStatus || '';
    const propertyName = prop?.title || prop?.name || '';

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!form.user || !form.phone || !form.message) {
            setError('All fields are required.');
            setSuccess('');
            return;
        }
        addInquiry({
            propertyName,
            user: form.user,
            phone: form.phone,
            message: form.message,
            agentName,
            agentStatus,
            date: new Date().toLocaleDateString(),
        });
        setSuccess('Inquiry sent successfully!');
        setError('');
        setForm({ user: '', phone: '', message: '', email: '' });
    }

    return(
        <div className="bg-white rounded-lg shadow-md p-6 mb-6  top-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Agent</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                    </label>
                    <input
                        type="text"
                        name="user"
                        value={form.user}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your name"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your phone number"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                    </label>
                    <textarea
                        name="message"
                        rows="4"
                        value={form.message}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="I'm interested in this property..."
                    ></textarea>
                </div>
                {error && <div className="text-red-500 text-sm">{error}</div>}
                {success && <div className="text-green-500 text-sm">{success}</div>}
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                    Send Message
                </button>
            </form>
        </div>
    )
}

export default PropertiesDetailForm;