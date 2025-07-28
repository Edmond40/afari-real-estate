import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

function AdminLayout() {
  const [showLabels, setShowLabels] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false); // for mobile

  // Sidebar width: 14rem (224px) when expanded, 8rem (128px) when collapsed
  const sidebarWidth = showLabels ? 'md:ml-[14rem]' : 'md:ml-[8rem]';

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar
        showLabels={showLabels}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${sidebarWidth}`}>
        <AdminNavbar
          setShowLabels={setShowLabels}
          showLabels={showLabels}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className="flex-1 overflow-y-auto p-4 duration-500">
        <ToastContainer position="bottom-right" autoClose={3000} />
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;