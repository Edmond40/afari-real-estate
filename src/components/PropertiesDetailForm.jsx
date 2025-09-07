import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useInquiries } from '../lib/hooks/useInquiries';
import { toast } from 'react-toastify';

function PropertiesDetailForm({ property }){
    const { create: createInquiry } = useInquiries();
    const { id } = useParams();
    const [form, setForm] = useState({
        name: '',
        phone: '',
        message: '',
        email: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get property info
    const propertyTitle = property?.title || '';
    const agentId = property?.agentId || null;

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) {
            toast.error('Name, email, and message are required.');
            return;
        }
        
        setIsSubmitting(true);
        try {
            await createInquiry({
                name: form.name,
                email: form.email,
                phone: form.phone,
                message: form.message,
                propertyId: parseInt(id),
                agentId: agentId,
                type: 'PROPERTY_INQUIRY'
            });
            toast.success('Inquiry sent successfully!');
            setForm({ name: '', phone: '', message: '', email: '' });
        } catch {
            toast.error('Failed to send inquiry. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return(
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 top-8" data-aos="fade-down">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Agent</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your name"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your email address"
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
                        required
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="I'm interested in this property..."
                    ></textarea>
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
            </form>
        </div>
    )
}

export default PropertiesDetailForm;