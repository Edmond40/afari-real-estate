import { useState } from 'react';
import { getAuth, updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { Link } from 'react-router-dom';

export default function AdminProfile() {
  const auth = getAuth();
  const user = auth.currentUser;
  const [email, setEmail] = useState(user ? user.email : '');
  const [displayName, setDisplayName] = useState(user ? user.displayName || '' : '');
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      if (user.displayName !== displayName) {
        await updateProfile(user, { displayName });
      }
      if (user.email !== email) {
        await updateEmail(user, email);
      }
      setMessage('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      setError(err.message);
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
        {showPasswordForm && <PasswordChangeForm user={user} onClose={() => setShowPasswordForm(false)} />}
        <div className="mt-4">
          <Link to="/admin/settings" className="text-blue-600 hover:underline">Go to Settings</Link>
        </div>
      </div>
    </div>
  );
}

function PasswordChangeForm({ user, onClose }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await updatePassword(user, password);
      setMessage('Password updated successfully!');
      setPassword('');
      setConfirm('');
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleChange} className="mt-4 space-y-3 bg-gray-50 p-4 rounded shadow">
      <h3 className="font-semibold text-center">Change Password</h3>
      {message && <div className="text-green-600 text-center">{message}</div>}
      {error && <div className="text-red-500 text-center">{error}</div>}
      <input
        type="password"
        className="w-full px-3 py-2 border rounded"
        placeholder="New Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <input
        type="password"
        className="w-full px-3 py-2 border rounded"
        placeholder="Confirm Password"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        required
      />
      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded" disabled={loading}>
          {loading ? 'Saving...' : 'Save Password'}
        </button>
        <button type="button" className="px-4 py-2 bg-gray-400 text-white rounded" onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
}
