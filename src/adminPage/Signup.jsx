import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { TOKEN_KEY } from '../config/auth';

export default function AdminSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      const res = await api.post('/auth/admin-signup', {
        name: 'Admin User',
        email,
        password,
        authCode,
      });
      const { token } = res.data || {};
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      }
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Admin signup error:', err);
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold text-center">Admin Sign Up</h2>
        {error && <div className="p-2 text-sm text-center text-red-600 bg-red-100 rounded">{error}</div>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 text-sm font-medium">Auth Code</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={authCode}
              onChange={e => setAuthCode(e.target.value)}
              placeholder="Enter admin authorization code"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing up...
                </>
              ) : 'Sign Up'}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/admin/login" className="font-medium text-blue-600 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}
