import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Image1 from '../assets/images/client2.jpeg';

function SignUp() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        terms: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    function validate() {
        let errs = {};
        if (!form.name.trim()) errs.name = 'Name is required.';
        if (!form.email.trim()) {
            errs.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            errs.email = 'Invalid email address.';
        }
        if (!form.password) errs.password = 'Password is required.';
        if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
        if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password.';
        if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
        if (!form.terms) errs.terms = 'You must agree to the terms.';
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
        if (loading) return; // Prevent double submit
        setErrors({});
        setSuccess('');
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        setLoading(true);
        try {
            // Import here to avoid breaking SSR if needed
            const { createUserWithEmailAndPassword, sendEmailVerification } = await import('firebase/auth');
            const { auth, db } = await import('../firebase');
            const { doc, setDoc } = await import('firebase/firestore');
            const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
            // Send email verification
            await sendEmailVerification(userCredential.user);
            // Force reload of user to ensure authentication state is current
            await userCredential.user.reload();
            // Store user profile in Firestore
            try {
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    name: form.name,
                    email: form.email,
                    createdAt: new Date()
                });
                setSuccess('Signup successful! Please check your email for a verification link.');
                setForm({ name: '', email: '', password: '', confirmPassword: '', terms: false });
                setTimeout(() => {
                    navigate('/user-dashboard');
                }, 2000);
            } catch (firestoreError) {
                setErrors({ firebase: 'Signup succeeded but failed to save user profile: ' + firestoreError.message });
                setLoading(false);
                return;
            }
        } catch (error) {
            let msg = error.message;
            if (error.code === 'auth/email-already-in-use') msg = 'Email already in use.';
            if (error.code === 'auth/invalid-email') msg = 'Invalid email address.';
            if (error.code === 'auth/weak-password') msg = 'Password is too weak.';
            setErrors({ firebase: msg });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-[60%] mx-auto flex justify-center items-center">
            <div className="shadow-sm rounded-md flex gap-5">
                <img src={Image1} alt="" className="w-[50%] max-h-full object-cover rounded-md brightness-90" />
                <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3 w-full">
            {errors.firebase && <div className="text-red-500 text-sm mb-2">{errors.firebase}</div>}
            {success && <div className="text-green-600 text-sm mb-2">{success}</div>}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="name">Name*</label>
                        <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Enter your name" className={`focus:outline-blue-500 duration-500 rounded-md p-2 shadow-md ${errors.name && 'border border-red-500'}`} />
                        {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
                    </div>
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
                    <div className="flex flex-col gap-2 relative">
                        <label htmlFor="confirmPassword">Confirm Password*</label>
                        <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm your password" className={`focus:outline-blue-500 duration-500 rounded-md p-2 shadow-md ${errors.confirmPassword && 'border border-red-500'}`} />
                        <button type="button" onClick={() => setShowConfirmPassword(v => !v)} className="absolute right-3 top-9 text-xs text-blue-500">{showConfirmPassword ? 'Hide' : 'Show'}</button>
                        {errors.confirmPassword && <span className="text-red-500 text-xs">{errors.confirmPassword}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" name="terms" checked={form.terms} onChange={handleChange} id="terms" />
                        <label htmlFor="terms" className="text-sm">I agree to the <a href="#" className="text-blue-500 underline">Terms & Conditions</a>*</label>
                    </div>
                    {errors.terms && <span className="text-red-500 text-xs">{errors.terms}</span>}
                    <button type="submit" disabled={loading} className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                    {success && <div className="text-green-600 text-center text-sm">{success}</div>}
                    <p className="text-center">Already have an account? <a href="/log-in" className="text-blue-500 hover:underline duration-300">Login</a></p>
                </form>
            </div>
        </div>
    );
}

export default SignUp;