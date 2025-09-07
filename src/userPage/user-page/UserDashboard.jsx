import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/auth';
import UserCards from "../user-data/UserCards";
import api from '../../lib/api';

function UserDashboard() {
    const { user, loading: loadingAuth } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/auth/me');
                const me = data?.data?.user || data?.user || data;
                setProfile(me);
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    if (loadingAuth || loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    // If no profile (not logged in), render a guest dashboard view
    if (!profile) {
        return (
            <div className="bg-gray-100 shadow-md p-5 flex flex-col gap-4 rounded-md">
                <h1 className="text-lg font-semibold">Welcome</h1>
                <p className="text-gray-600">You're viewing a guest dashboard. Log in to see your profile details.</p>
                <UserCards />
            </div>
        );
    }

    return (
        <div className="bg-gray-100 shadow-md p-5 flex flex-col gap-4 rounded-md">
            <h1 className="text-lg font-semibold">Profile Information</h1>
            <div>
                <p className="tex-gray-500">Name: <span className="text-gray-700 font-semibold">{profile.name}</span></p>
                <p className="tex-gray-500">Email: <span className="text-gray-700 font-semibold">{profile.email}</span></p>
            </div>
            <UserCards />
        </div>
    );
}

export default UserDashboard;