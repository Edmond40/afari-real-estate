import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function LogIn() {
    const [form, setForm] = useState({
        email: '',
        password: '',
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    function validate() {
        let errs = {};
        if (!form.email.trim()) {
            errs.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            errs.email = 'Invalid email address.';
        }
        if (!form.password) errs.password = 'Password is required.';
        return errs;
    }

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setErrors({});
        setSuccess('');
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        
        try {
            setLoading(true);
            const result = await login(form.email, form.password);
            
            if (result.success) {
                setSuccess('Login successful! Redirecting...');
                setForm({ email: '', password: '', remember: false });
                setTimeout(() => {
                    navigate('/user-dashboard');
                }, 1500);
            } else {
                setErrors({ server: result.error || 'Login failed. Please try again.' });
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrors({ server: error.response?.data?.message || 'An error occurred during login.' });
        } finally {
            setLoading(false);
        }
    }

    // Google login will be implemented later
    function handleGoogleLogin() {
        setErrors({ server: 'Google login is currently unavailable. Please use email and password.' });
    }

    return (
        <div className="min-h-screen md:w-[90%] lg:w-[60%] mx-auto flex justify-center items-center p-3">
            <div className="shadow-md rounded-md flex flex-col gap-5 md:w-[70%] lg:w-[60%] mx-auto w-[90%] p-4 bg-gray-100">
                <h2 className="text-2xl font-semibold text-center">Login</h2>
                <button onClick={handleGoogleLogin} disabled={loading} type="button" className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-2">
                    Continue with Google
                </button>
                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-100 text-gray-500">Or continue with</span>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email">Email*</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter your email" className={`focus:outline-blue-500 duration-500 rounded-md p-2 shadow-md ${errors.email && 'border border-red-500'}`} />
                        {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}
                    </div>
                    <div className="flex flex-col gap-2 relative">
                        <label htmlFor="password">Password*</label>
                        <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" className={`focus:outline-blue-500 duration-500 rounded-md p-2 shadow-md ${errors.password && 'border border-red-500'}`} />
                        <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-9 text-xs text-blue-500">{showPassword ? 'Hide' : 'Show'}</button>
                        {errors.password && <span className="text-red-500 text-xs">{errors.password}</span>}
                    </div>
                    <div className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                            <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} id="remember" />
                            <label htmlFor="remember" className="text-sm">Remember me</label>
                        </div>
                        <a href="/reset-password" className="text-blue-500 text-xs hover:underline">Forgot Password?</a>
                    </div>
                    <button type="submit" disabled={loading} className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? 'Logging In...' : 'Login'}
                    </button>
                    {success && <div className="text-green-600 text-center text-sm">{success}</div>}
                </form>
                <p className="text-center text-sm">Don't have an account? <a href="/signup" className="text-blue-500 hover:underline duration-300">Sign Up</a></p>
            </div>
        </div>
    );
}

export default LogIn;