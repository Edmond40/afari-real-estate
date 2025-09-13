import { useState, useEffect } from 'react';
import { X, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../../../lib/api';

function AddAppointmentModal({ onClose }) {
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [listingsLoading, setListingsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    userId: '',
    listingId: '',
    scheduledAt: '',
    status: 'SCHEDULED',
    notes: '',
    agentNotes: '',
    internalNotes: ''
  });
  
  const [loading, setLoading] = useState(false);

  // Fetch users and listings on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setUsersLoading(true);
        setListingsLoading(true);
        
        const [usersResponse, listingsResponse] = await Promise.all([
          api.get('/users?limit=100'),
          api.get('/listings?limit=100')
        ]);
        
        setUsers(usersResponse.data?.data || []);
        setListings(listingsResponse.data?.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load users and listings');
      } finally {
        setUsersLoading(false);
        setListingsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.listingId || !formData.scheduledAt) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const appointmentData = {
        userId: parseInt(formData.userId),
        listingId: parseInt(formData.listingId),
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        status: formData.status,
        notes: formData.notes,
        agentNotes: formData.agentNotes,
        internalNotes: formData.internalNotes
      };

      await api.post('/appointments', appointmentData);
      toast.success('Appointment created successfully');
      onClose();
    } catch (error) {
      console.error('Error creating appointment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create appointment';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-brightness-50 flex items-center justify-center z-50 overflow-auto top-0 bottom-0 py-10 h-screen" onClick={onClose}>
      <motion.div 
        className="bg-white shadow w-full md:w-4/6 p-10 mt-20 mx-auto overflow-auto h-screen rounded-lg text-gray-900"
        initial={{ scale: 0, x: -100 }}
        animate={{ scale: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <X 
            size={20} 
            className="text-gray-700 absolute right-5 -top-6 cursor-pointer" 
            onClick={onClose}
          />
          
          <h2 className="text-2xl font-bold mb-6 text-center">New Appointment</h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex justify-between gap-4">
              <div className="flex-1">
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                  User *
                </label>
                <select
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300 w-full"
                  required
                  disabled={usersLoading}
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                {usersLoading && <p className="text-sm text-gray-500 mt-1">Loading users...</p>}
              </div>

              <div className="flex-1">
                <label htmlFor="listingId" className="block text-sm font-medium text-gray-700 mb-1">
                  Property *
                </label>
                <select
                  id="listingId"
                  name="listingId"
                  value={formData.listingId}
                  onChange={handleInputChange}
                  className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300 w-full"
                  required
                  disabled={listingsLoading}
                >
                  <option value="">Select a property</option>
                  {listings.map((listing) => (
                    <option key={listing.id} value={listing.id}>
                      {listing.title} - {listing.address}
                    </option>
                  ))}
                </select>
                {listingsLoading && <p className="text-sm text-gray-500 mt-1">Loading properties...</p>}
              </div>
            </div>

            <div className="flex justify-between gap-4">
              <div className="flex-1">
                <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700 mb-1">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  id="scheduledAt"
                  name="scheduledAt"
                  value={formData.scheduledAt}
                  onChange={handleInputChange}
                  className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300 w-full"
                  required
                />
              </div>

              <div className="flex-1">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300 w-full"
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="NO_SHOW">No Show</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Add any notes about the appointment..."
                rows={3}
                className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300 resize-none w-full"
              />
            </div>

            <div>
              <label htmlFor="agentNotes" className="block text-sm font-medium text-gray-700 mb-1">
                Agent Notes (Internal)
              </label>
              <textarea
                id="agentNotes"
                name="agentNotes"
                value={formData.agentNotes}
                onChange={handleInputChange}
                placeholder="Add internal notes for agents..."
                rows={3}
                className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300 resize-none w-full"
              />
            </div>

            <div>
              <label htmlFor="internalNotes" className="block text-sm font-medium text-gray-700 mb-1">
                Internal Notes (Admin Only)
              </label>
              <textarea
                id="internalNotes"
                name="internalNotes"
                value={formData.internalNotes}
                onChange={handleInputChange}
                placeholder="Add admin-only notes..."
                rows={3}
                className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300 resize-none w-full"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-52 mx-auto justify-center items-center gap-1 bg-blue-500 text-white p-2 rounded-md hover:scale-110 duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus />
              <span>{loading ? 'Creating...' : 'Create Appointment'}</span>
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default AddAppointmentModal;
