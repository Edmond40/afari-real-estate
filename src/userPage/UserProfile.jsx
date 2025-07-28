import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

function UserProfile() {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      setLoading(true);
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setMessage('');
    try {
      await updateDoc(doc(db, 'users', user.uid), { name: profile.name });
      setEdit(false);
      setMessage('Profile updated!');
    } catch (err) {
        console.log(err);
      setMessage('Error updating profile.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in.</div>;
  if (!profile) return <div>No profile found.</div>;

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">User Profile</h2>
      <div className="mb-4">
        <label className="block text-sm">Email:</label>
        <div className="p-2 border rounded bg-gray-100">{profile.email}</div>
      </div>
      <div className="mb-4">
        <label className="block text-sm">Name:</label>
        {edit ? (
          <input
            className="p-2 border rounded w-full"
            name="name"
            value={profile.name || ''}
            onChange={handleChange}
          />
        ) : (
          <div className="p-2 border rounded bg-gray-100">{profile.name}</div>
        )}
      </div>
      {edit ? (
        <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Save</button>
      ) : (
        <button onClick={() => setEdit(true)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Edit</button>
      )}
      {message && <div className="mt-2 text-green-600">{message}</div>}
    </div>
  );
}

export default UserProfile;
