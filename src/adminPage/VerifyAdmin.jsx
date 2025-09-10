import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';


export default function VerifyAdmin({ children }) {
  const { user, loading } = useAuth();
  const role = (user?.role || '').toString().toLowerCase();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
