import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api';

function UserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
  });
  const [preferences, setPreferences] = useState({
    emailUpdates: false,
    darkMode: false,
    city: '',
    minBudget: '',
    maxBudget: '',
    propertyTypes: [],
  });
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/auth/me');
        const me = data?.data?.user || data?.user || data;
        setProfile({ name: me?.name || '', email: me?.email || '' });
        const prefs = me?.preferences || {};
        setPreferences({
          emailUpdates: !!prefs.emailUpdates,
          darkMode: !!prefs.darkMode,
          city: prefs.city || '',
          minBudget: prefs.minBudget ?? '',
          maxBudget: prefs.maxBudget ?? '',
          propertyTypes: Array.isArray(prefs.propertyTypes) ? prefs.propertyTypes : [],
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        setMessage('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePrefChange = (e) => {
    const { name, type, checked, value } = e.target;
    setPreferences((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePropertyTypesChange = (e) => {
    const val = e.target.value;
    const arr = val
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    setPreferences((prev) => ({ ...prev, propertyTypes: arr }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      await api.patch('/users/update-me', {
        name: profile.name,
        preferences: {
          ...preferences,
          // Ensure numeric fields are numbers or null
          minBudget: preferences.minBudget === '' ? null : Number(preferences.minBudget),
          maxBudget: preferences.maxBudget === '' ? null : Number(preferences.maxBudget),
        },
      });
      setMessage('Profile updated successfully!');
      setEdit(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in.</div>;
  if (!profile) return <div>No profile found.</div>;

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">User Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm">Email:</label>
          <div className="p-2 border rounded bg-gray-100">{profile.email}</div>
        </div>
        <div className="mb-4">
          <label className="block text-sm">Name:</label>
          {edit ? (
            <input
              className="p-2 border rounded w-full mb-2"
              name="name"
              value={profile.name || ''}
              onChange={handleChange}
            />
          ) : (
            <div className="p-2 border rounded bg-gray-100">{profile.name}</div>
          )}
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-2">Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="emailUpdates"
              checked={preferences.emailUpdates}
              onChange={handlePrefChange}
              disabled={!edit}
            />
            <span>Email updates</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="darkMode"
              checked={preferences.darkMode}
              onChange={handlePrefChange}
              disabled={!edit}
            />
            <span>Dark mode</span>
          </label>
          <div>
            <label className="block text-sm mb-1">City</label>
            <input
              className="p-2 border rounded w-full"
              name="city"
              value={preferences.city}
              onChange={handlePrefChange}
              disabled={!edit}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Min Budget</label>
            <input
              className="p-2 border rounded w-full"
              type="number"
              name="minBudget"
              value={preferences.minBudget}
              onChange={handlePrefChange}
              disabled={!edit}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Max Budget</label>
            <input
              className="p-2 border rounded w-full"
              type="number"
              name="maxBudget"
              value={preferences.maxBudget}
              onChange={handlePrefChange}
              disabled={!edit}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Property Types (comma-separated)</label>
            <input
              className="p-2 border rounded w-full"
              name="propertyTypesInput"
              value={preferences.propertyTypes.join(', ')}
              onChange={handlePropertyTypesChange}
              disabled={!edit}
            />
          </div>
        </div>
        <div className="flex gap-2">
          {edit ? (
            <>
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Save
              </button>
              <button 
                type="button" 
                onClick={() => setEdit(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </>
          ) : (
            <button 
              type="button"
              onClick={() => setEdit(true)} 
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Edit Profile
            </button>
          )}
        </div>
        {message && <div className={`mt-2 ${message.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </div>}
      </form>
    </div>
  );
}

export default UserProfile;
