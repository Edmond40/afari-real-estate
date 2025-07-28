import { Link, NavLink } from 'react-router-dom';
import { Bell, Mail, PanelLeftClose, UserCircle, Menu } from 'lucide-react';
import { useState } from 'react';
import Notification from './popover/Notification';
import MessageAlert from './popover/MessageAlert';
import Profile from './popover/Profile';

function AdminNavbar({ setShowLabels, showLabels, setSidebarOpen }) {
  const [showNotification, setShowNotification] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="flex justify-between items-center p-5 shadow-md sticky top-0 bg-gray-50 transition-all duration-500 z-30">
      {/* Hamburger menu for mobile */}
      <button className="md:hidden mr-2" onClick={() => setSidebarOpen(true)}>
        <Menu size={28} />
      </button>
      {/* Collapse/expand button for desktop */}
      <PanelLeftClose size={20} onClick={() => setShowLabels((prev) => !prev)} className="cursor-pointer hidden md:inline" />

      {/* links */}
      <div className="md:flex gap-3 hidden font-semibold text-gray-600">
        <Link to="/">Home</Link>
        <Link to="/properties" className="hover:text-gray-700 duration-300">Properties</Link>
        <Link to="/agents-page" className="hover:text-gray-700 duration-300">Agents</Link>
        <Link to="/about" className="hover:text-gray-700 duration-300">About</Link>
        <Link to="/contact" className="hover:text-gray-700 duration-300">Contact</Link>
      </div>

      <div className="flex gap-4 text-gray-600">
        <Bell className="hover:text-gray-700 hover:scale-110 duration-300 cursor-pointer" onClick={() => setShowNotification(true)} />
        <Mail className="hover:text-gray-700 hover:scale-110 duration-300 cursor-pointer" onClick={() => setShowMessage(true)} />
        <UserCircle className="hover:text-gray-700 hover:scale-110 duration-300 cursor-pointer" onClick={() => setShowProfile(true)} />
      </div>
      {/* <NavLink to=''>
        Home
      </NavLink> */}

      {showNotification && <Notification onClose={() => setShowNotification(false)} setShowNotification={setShowNotification} />}
      {showMessage && <MessageAlert onClose={() => setShowMessage(false)} setShowMessage={setShowMessage} />}
      {showProfile && <Profile onClose={() => setShowProfile(false)} setShowProfile={setShowProfile} />}
    </div>
  );
}

export default AdminNavbar;