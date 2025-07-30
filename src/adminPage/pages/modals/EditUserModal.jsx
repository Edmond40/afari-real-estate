// import { motion } from 'framer-motion'
import { SquarePen, X } from 'lucide-react';
import { useState, useEffect } from 'react';

function EditUserModal({onClose, user, onEditUser}){
    const [form, setForm] = useState({ name: '', email: '', role: 'viewer' });
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setForm({ name: user.name, email: user.email, role: user.role });
        }
    }, [user]);

    function handleOnChange(event){
        const { name, value } = event.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    function HandleSubmit(event){
        event.preventDefault();
        if (!form.name || !form.email || !form.role) {
            setError('All fields are required.');
            return;
        }
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
            setError('Invalid email format.');
            return;
        }
        setError('');
        onEditUser({ ...user, ...form });
        onClose();
    }

    return(
        <div className="fixed inset-0 backdrop-brightness-50 flex items-center justify-center z-50" onClick={onClose}>
            <motion.div className="bg-white shadow lg:p-8 md:p-4 w-full md:w-1/2 mx-auto rounded-lg p-4 text-gray-900" 
                initial={{ opacity: 0, y: -100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                transition={{ duration: 0.6 }}
                onClick={(e) => e.stopPropagation()}>
                <div className="relative">
                    <X className="text-gray-700 absolute right-5 -top-5 cursor-pointer" onClick={onClose}/>
                    <form onSubmit={HandleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label htmlFor="name">Name*</label>
                            <input type="text" onChange={handleOnChange} name="name" value={form.name} className="border-2 border-gray-700 p-2 w-full rounded-md focus:outline-blue-500 duration-300" placeholder='Yhoung Promize'/>
                        </div>
                        <div>
                            <label htmlFor="email">Email*</label>
                            <input type="email" onChange={handleOnChange} name="email" value={form.email} className="border-2 border-gray-700 p-2 w-full rounded-md focus:outline-blue-500 duration-300" placeholder='www.obolotech@gmail.com'/>
                        </div>
                        <div>
                            <label htmlFor="role">Role*</label>
                            <select name="role" value={form.role} onChange={handleOnChange} className="border-2 border-gray-700 p-2 w-full rounded-md focus:outline-blue-500 duration-300">
                                <option value="admin">Admin</option>
                                <option value="agent">Agent</option>
                                <option value="viewer">Viewer</option>
                            </select>
                        </div>
                        {error && <div className="text-red-500 text-sm">{error}</div>}
                        <button type="submit" className="flex w-32 mx-auto justify-center items-center gap-1 bg-blue-500 text-white p-2 rounded-md hover:scale-110 duration-300 cursor-pointer">
                            <SquarePen/>
                            <span>Edit User</span>
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}

export default EditUserModal;