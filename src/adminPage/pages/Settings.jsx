import { Link } from 'react-router-dom';

export default function AdminSettings() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Admin Settings</h2>
        <div className="mb-4 text-gray-700">Settings options will go here.</div>
        <Link to="/admin/profile" className="text-blue-600 hover:underline">Back to Profile</Link>
      </div>
    </div>
  );
} 