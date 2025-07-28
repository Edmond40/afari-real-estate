import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

function PasswordReset() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md flex flex-col gap-4 w-[350px]">
        <h2 className="text-xl font-semibold text-center">Reset Password</h2>
        <input
          type="email"
          className="p-2 border rounded"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50">
          {loading ? 'Sending...' : 'Send Reset Email'}
        </button>
        {message && <div className="text-green-600 text-center text-sm">{message}</div>}
        {error && <div className="text-red-600 text-center text-sm">{error}</div>}
      </form>
    </div>
  );
}

export default PasswordReset;
