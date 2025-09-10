import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function AdminProfile() {
  const { user, updateProfile } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [displayName, setDisplayName] = useState(user?.displayName || user?.name || '');
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const result = await updateProfile({ 
        name: displayName,
        email,
        displayName 
      });
      if (result.success) {
        setMessage('Profile updated successfully!');
        setEditing(false);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while updating profile');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Admin Profile</h2>
        {message && <div className="text-green-600 text-center mb-2">{message}</div>}
        {error && <div className="text-red-500 text-center mb-2">{error}</div>}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email:</label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={!editing}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Display Name:</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              disabled={!editing}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">UID:</label>
            <span className="block text-gray-900 bg-gray-100 px-3 py-2 rounded">{user ? user.uid : 'N/A'}</span>
          </div>
          <div className="flex gap-2">
            {!editing ? (
              <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setEditing(true)}>
                Edit Profile
              </button>
            ) : (
              <>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
                <button type="button" className="px-4 py-2 bg-gray-400 text-white rounded" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </>
            )}
            <button type="button" className="px-4 py-2 bg-yellow-500 text-white rounded" onClick={() => setShowPasswordForm(v => !v)}>
              Change Password
            </button>
          </div>
        </form>
        {showPasswordForm && <PasswordChangeForm onClose={() => setShowPasswordForm(false)} />}
        <div className="mt-4">
          <Link to="/admin/settings" className="text-blue-600 hover:underline">Go to Settings</Link>
        </div>
      </div>
    </div>
  );
}

function PasswordChangeForm({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    try {
      // This is a placeholder for the actual password update API call
      // In a real implementation, you would call your backend API here
      // Example:
      // const response = await fetch('/api/auth/change-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ currentPassword, newPassword }),
      //   credentials: 'include'
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.message || 'Failed to update password');
      
      setMessage('Password update functionality needs to be implemented in the backend');
      // Uncomment this when implementing the actual API call
      // setMessage('Password updated successfully');
      // onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while updating password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 bg-gray-50 p-4 rounded shadow">
      <h3 className="font-semibold text-center">Change Password</h3>
      {message && <div className="text-green-600 text-center">{message}</div>}
      {error && <div className="text-red-500 text-center">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
        <input
          type="password"
          className="w-full px-3 py-2 border rounded"
          placeholder="Current Password"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
        <input
          type="password"
          className="w-full px-3 py-2 border rounded"
          placeholder="New Password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          minLength={8}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
        <input
          type="password"
          className="w-full px-3 py-2 border rounded"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          minLength={8}
          required
        />
      </div>
      <div className="flex gap-2">
        <button 
          type="submit" 
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors" 
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Password'}
        </button>
        <button 
          type="button" 
          className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors" 
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
