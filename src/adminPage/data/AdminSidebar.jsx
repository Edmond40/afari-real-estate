import { DoorOpen, X } from 'lucide-react';
import { AdminNavLinks } from '../../adminData/AdminNavLinks';
import { Link } from 'react-router-dom';

function AdminSidebar({ showLabels, sidebarOpen, setSidebarOpen }) {
  // Sidebar for desktop (md+) and overlay for mobile
  return (
    <>
      {/* Overlay for mobile with fade animation */}
      <div
        className={`fixed inset-0 z-40 backdrop-brightness-50 transition-opacity duration-500 md:hidden ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden={!sidebarOpen}
      ></div>
      {/* Sidebar - always fixed, animated slide/fade on mobile and width/labels on desktop */}
      <div
        className={`fixed top-0 left-0 z-50 bg-slate-800 p-5 gap-3 text-white h-screen flex flex-col transition-all duration-500 ease-in-out ${sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'} md:translate-x-0 md:opacity-100`}
        style={{ width: showLabels ? '14rem' : '8rem', maxWidth: '90vw', transitionProperty: 'width, transform, opacity' }}
      >
        {/* Close button for mobile */}
        <button className="md:hidden mb-4 self-end" onClick={() => setSidebarOpen(false)}>
          <X size={28}  className='cursor-pointer'/>
        </button>
        <div className="flex justify-center items-center">
          <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#f0cc1c"><path d="M214.77-160q-22.08 0-37.65-15.48-15.58-15.48-15.58-37.6v-69.07L303.08-408v248h-88.31Zm122.15 0v-141.54h286.16V-160H336.92Zm320 0v-290.68l-152.54-134.7 107.16-94.7 169.23 149.77q8.46 8.23 13.08 18.41 4.61 10.17 4.61 21.68v276.95q0 22.12-15.48 37.69Q767.5-160 745.38-160h-88.46ZM161.54-328.46v-161.25q0-11.45 4.61-22.02 4.62-10.58 13.08-18.58l265.39-235.23q8-7.23 16.99-10.34 9-3.12 18.43-3.12 9.42 0 18.38 3.12 8.96 3.11 16.96 10.34l70.77 63.31-424.61 373.77Z"/></svg>
          <span
            className={`text-2xl font-bold text-blue-500 ml-2 transition-opacity duration-500 ${showLabels ? 'opacity-100' : 'opacity-0'}`}
            style={{ transitionProperty: 'opacity' }}
          >
            {showLabels && 'Afari'}
          </span>
        </div>
        <div className="p-4">
          {AdminNavLinks.map((AdminNavLink, index) => (
            <div key={index}>
              <Link
                key={index}
                to={AdminNavLink.to}
                className="flex items-center gap-2 p-3 hover:bg-gray-700 text-gray-300 hover:text-gray-100 hover:scale-110 duration-300 rounded-lg"
                onClick={() => setSidebarOpen(false)}
              >
                <AdminNavLink.icon size={20} />
                <span
                  className={`font-semibold transition-opacity duration-500 ${showLabels ? 'opacity-100 ml-2' : 'opacity-0 ml-0'}`}
                  style={{ transitionProperty: 'opacity, margin-left' }}
                >
                  {showLabels && AdminNavLink.label}
                </span>
              </Link>
            </div>
          ))}
        </div>
        {/* Logout */}
        <div className="flex justify-center gap-2 mt-16 items-center py-3 hover:bg-red-700 text-gray-300 hover:text-red-100 hover:scale-110 duration-300 rounded-lg cursor-pointer">
          <DoorOpen />
          <span
            className={`transition-opacity duration-500 ${showLabels ? 'opacity-100 ml-2' : 'opacity-0 ml-0'}`}
            style={{ transitionProperty: 'opacity, margin-left' }}
          >
            {showLabels && 'Logout'}
          </span>
        </div>
      </div>
    </>
  );
}

export default AdminSidebar;