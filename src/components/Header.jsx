import { User } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className='flex justify-between items-center p-5 shadow-md fixed top-0 bg-gray-50 z-50 w-full'>
            <Link to={`/`}>
                <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#f0cc1c"><path d="M214.77-160q-22.08 0-37.65-15.48-15.58-15.48-15.58-37.6v-69.07L303.08-408v248h-88.31Zm122.15 0v-141.54h286.16V-160H336.92Zm320 0v-290.68l-152.54-134.7 107.16-94.7 169.23 149.77q8.46 8.23 13.08 18.41 4.61 10.17 4.61 21.68v276.95q0 22.12-15.48 37.69Q767.5-160 745.38-160h-88.46ZM161.54-328.46v-161.25q0-11.45 4.61-22.02 4.62-10.58 13.08-18.58l265.39-235.23q8-7.23 16.99-10.34 9-3.12 18.43-3.12 9.42 0 18.38 3.12 8.96 3.11 16.96 10.34l70.77 63.31-424.61 373.77Z"/>
                    </svg>
                    <h1 className="text-2xl font-bold text-blue-600">Afari</h1>
                </div>
            </Link>

            {/* links */}
            <div className='hidden md:flex gap-3 font-semibold text-gray-600'>
                <NavLink to="/" className='hover:text-gray-700 duration-300 active'>
                    <p>Home</p>
                    <hr className='bg-blue-500 w-4/5 mx-auto h-[2px] rounded-full border-none scale-0 duration-500'></hr>
                </NavLink>

                <NavLink to="/properties" className='hover:text-gray-700 duration-300'>
                    Properties
                    <hr className='bg-blue-500 w-4/5 mx-auto h-[2px] rounded-full border-none  scale-0 duration-500'></hr>
                </NavLink>

                <NavLink to="/agents-page" className='hover:text-gray-700 duration-300'>
                    Agents
                    <hr className='bg-blue-500 w-4/5 mx-auto h-[2px] rounded-full border-none scale-0 duration-500'></hr>
                </NavLink>

                <NavLink to="/about" className='hover:text-gray-700 duration-300'>
                    About
                    <hr className='bg-blue-500 w-4/5 mx-auto h-[2px] rounded-full border-none scale-0 duration-500'></hr>
                </NavLink>

                <NavLink to="/contact" className='hover:text-gray-700 duration-300'>
                    Contact
                    <hr className='bg-blue-500 w-4/5 mx-auto h-[2px] rounded-full border-none scale-0 duration-500'></hr>
                </NavLink>
            </div>

            <div className='flex gap-3 font-semibold text-gray-700'>
                {
                    user ? (
                        <div className='group relative'>
                            <User className='cursor-pointer' />
                            <div className='scale-0 bg-gray-100 p-4 w-32 rounded-md flex flex-col group-hover:scale-110 group-opacity-1 duration-500 absolute top-8 right-2 font-medium text-base text-gray-500'>
                                <Link to="/user-dashboard" className='cursor-pointer hover:text-gray-700 duration-300'>View Profile</Link>
                                <button onClick={handleLogout} className='cursor-pointer hover:text-gray-700 duration-300 text-left'>Log Out</button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <Link to="/signup" className='cursor-pointer'>Sign Up</Link>
                            <Link to="/login" className='cursor-pointer ml-2'>Sign In</Link>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default Header;