import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResetSent(false);
    setLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError('Google login is currently unavailable. Please use email and password.');
  };

  const handlePasswordReset = () => {
    setError('Password reset is currently unavailable. Please contact support.');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold text-center">Admin Login</h2>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        {resetSent && <div className="text-green-600 text-sm text-center">Password reset email sent!</div>}
        <button
          onClick={handleGoogleLogin}
          className="w-full py-2 mb-2 text-white bg-red-600 rounded hover:bg-red-700 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          Continue with Google
        </button>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
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
            <div className="flex justify-end mt-1">
              <button
                type="button"
                className="text-xs text-blue-600 hover:underline disabled:opacity-50"
                onClick={handlePasswordReset}
                disabled={loading}
              >
                Forgot Password?
              </button>
            </div>
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
                  Logging in...
                </>
              ) : 'Login'}
            </button>
          </div>
        </form>
        <p className="text-sm text-center">
          Don&apos;t have an account?{' '}
          <Link to="/admin/signup" className="text-blue-600 hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
