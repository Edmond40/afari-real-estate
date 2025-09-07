import { useState } from 'react';
import { toast } from 'react-toastify';
import { useInquiries } from '../lib/hooks/useInquiries';

function ContactForm({ listingId, agentId, userId }) {
    const { createInquiry, isCreating } = useInquiries();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [errors, setErrors] = useState({});

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        
        // Basic validation
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.message.trim()) newErrors.message = 'Message is required';
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const inquiryData = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim() || null,
                subject: formData.subject.trim() || 'General Inquiry',
                message: formData.message.trim(),
                status: 'PENDING',
                ...(listingId && { listingId: parseInt(listingId) }),
                ...(agentId && { agentId: parseInt(agentId) }),
                ...(userId && { userId: parseInt(userId) })
            };

            await createInquiry(inquiryData);
            
            toast.success('Message sent successfully! We will get back to you soon.', {
                position: 'top-center',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
            
            // Reset form
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
            setErrors({});
            
        } catch (error) {
            console.error('Error submitting inquiry:', error);
            toast.error(error.message || 'Failed to send message. Please try again.');
        }
    }

    return (
        <div className="p-4 bg-gray-100 shadow-sm rounded-lg" data-aos="fade-right">
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-3">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                        {errors.name && <span className="text-red-500 text-xs ml-2">{errors.name}</span>}
                    </label>
                    <input 
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Your name"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                        {errors.email && <span className="text-red-500 text-xs ml-2">{errors.email}</span>}
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="your.email@example.com"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="(123) 456-7890"
                    />
                </div>

                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                    </label>
                    <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Subject of your message"
                    />
                </div>

                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message *
                        {errors.message && <span className="text-red-500 text-xs ml-2">{errors.message}</span>}
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.message ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Your message here..."
                        required
                    ></textarea>
                </div>

                <button
                    type="submit"
                    disabled={isCreating}
                    className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        isCreating ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                >
                    {isCreating ? 'Sending...' : 'Send Message'}
                </button>
            </form>
        </div>
    );
}

export default ContactForm;
