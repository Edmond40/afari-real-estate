import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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
        setLoading(true);
        try {
            const { signInWithEmailAndPassword, signOut } = await import('firebase/auth');
            const { auth } = await import('../firebase');
            const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
            // Check role in Firestore
            const db = getFirestore();
            const userDoc = doc(db, 'users', userCredential.user.uid);
            const userSnap = await getDoc(userDoc);
            if (!userSnap.exists() || userSnap.data().role !== 'user') {
                await signOut(auth);
                setErrors({ firebase: 'Access denied: Not a user account.' });
                setLoading(false);
                return;
            }
            setSuccess('Login successful! Redirecting...');
            setForm({ email: '', password: '', remember: false });
            setTimeout(() => {
                navigate('/user-dashboard');
            }, 1500);
        } catch (error) {
            let msg = error.message;
            if (error.code === 'auth/user-not-found') msg = 'No user found with this email.';
            if (error.code === 'auth/wrong-password') msg = 'Incorrect password.';
            if (error.code === 'auth/invalid-email') msg = 'Invalid email address.';
            setErrors({ firebase: msg });
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleLogin() {
        setErrors({});
        setSuccess('');
        setLoading(true);
        try {
            const { signInWithPopup, signOut } = await import('firebase/auth');
            const { auth, googleProvider } = await import('../firebase');
            const { getFirestore, doc, setDoc, getDoc } = await import('firebase/firestore');
            const result = await signInWithPopup(auth, googleProvider);
            // Store user profile in Firestore if not exists
            const db = getFirestore();
            const userDoc = doc(db, 'users', result.user.uid);
            const userSnap = await getDoc(userDoc);
            if (!userSnap.exists()) {
                await setDoc(userDoc, {
                    name: result.user.displayName,
                    email: result.user.email,
                    createdAt: new Date(),
                    role: 'user'
                });
            } else if (userSnap.data().role !== 'user') {
                await signOut(auth);
                setErrors({ firebase: 'Access denied: Not a user account.' });
                setLoading(false);
                return;
            }
            setSuccess('Login successful! Redirecting...');
            setTimeout(() => {
                navigate('/user-dashboard');
            }, 1500);
        } catch (error) {
            let msg = error.message;
            if (error.code === 'auth/popup-closed-by-user') msg = 'Google login popup was closed.';
            setErrors({ firebase: msg });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen md:w-[90%] lg:w-[60%] mx-auto flex justify-center items-center p-3">
            <div className="shadow-md rounded-md flex flex-col gap-5 md:w-[70%] lg:w-[60%] mx-auto w-[90%] p-4 bg-gray-100">
                <h2 className="text-2xl font-semibold text-center">Login</h2>
                <button onClick={handleGoogleLogin} disabled={loading} type="button" className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-2">
                    {loading ? 'Loading...' : 'Continue with Google'}
                </button>
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