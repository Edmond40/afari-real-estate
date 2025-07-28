import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState } from 'react';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import UserCards from "../user-data/UserCards";

function UserDashboard() {
    const [user, loadingAuth] = useAuthState(auth);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        const fetchProfile = async () => {
            try {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProfile(docSnap.data());
                } else {
                    setError('User profile not found.');
                }
            } catch (err) {
                console.log(err);
                setError('Failed to fetch user profile.');
            }
            setLoading(false);
        };
        fetchProfile();
    }, [user]);

    if (loadingAuth || loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!profile) return null;

    return (
        <div>
            <div className="bg-gray-100 shadow-md p-5 flex flex-col gap-4 rounded-md">
                <h1 className="text-lg font-semibold">Profile Information</h1>
                <div>
                    <p className="tex-gray-500">Name: <span className="text-gray-700 font-semibold">{profile.name}</span></p>
                    <p className="tex-gray-500">Email: <span className="text-gray-700 font-semibold">{profile.email}</span></p>
                </div>
                <UserCards />
            </div>
        </div>
    );
}

export default UserDashboard;