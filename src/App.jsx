import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import VerifyAdmin from './adminPage/VerifyAdmin';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { AuthProvider } from './contexts/AuthProvider';

// Layouts
const MainLayout = lazy(() => import('./pages/MainLayout'));
const AdminLayout = lazy(() => import('./adminPage/data/AdminLayout'));
const UserLayout = lazy(() => import('./userPage/user-data/UserLayout'));

// Main Pages - Lazy loaded
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const PropertiesPage = lazy(() => import('./pages/PropertiesPage'));
const PropertiesDetailPage = lazy(() => import('./pages/PropertiesDetailPage'));
const AgentsPage = lazy(() => import('./pages/AgentsPage'));
const AgentDetailPage = lazy(() => import('./pages/AgentDetailPage'));

// Admin Pages - Lazy loaded
const AdminDashboard = lazy(() => import('./adminPage/pages/AdminDashboard'));
const AdminAgents = lazy(() => import('./adminPage/pages/Agent'));
const AdminInquiries = lazy(() => import('./adminPage/pages/Inquiries'));
const AdminProperties = lazy(() => import('./adminPage/pages/Properties'));
const AdminAddProperty = lazy(() => import('./adminPage/pages/modals/propertiesModal/AddPropertyModal'))
const AdminEditProperty = lazy(() => import('./adminPage/pages/modals/propertiesModal/EditPropertyModal'))
const AdminUsers = lazy(() => import('./adminPage/pages/User'));
const AdminProfile = lazy(() => import('./adminPage/pages/Profile'));
const AdminSettings = lazy(() => import('./adminPage/pages/Settings'));
const AdminAppointments = lazy(() => import('./adminPage/pages/Appointments'));
// Import the new AppointmentsPage
import AppointmentsPage from './pages/AppointmentsPage';

// User Pages - Lazy loaded
const UserLogin = lazy(() => import('./userPage/Login'));
const UserSignup = lazy(() => import('./userPage/Signup'));
const PasswordReset = lazy(() => import('./userPage/PasswordReset'));
const UserProfile = lazy(() => import('./userPage/UserProfile'));
const UserDashboard = lazy(() => import('./userPage/user-page/UserDashboard'));
const SavedProperties = lazy(() => import('./userPage/user-page/SavedProperties'));
const ViewingHistory = lazy(() => import('./userPage/user-page/ViewingHistory'));
const Appointment = lazy(() => import('./userPage/user-page/Appointment'));
const Notification = lazy(() => import('./userPage/user-page/Notification'));
const Settings = lazy(() => import('./userPage/user-page/Settings'));

// Admin Auth Pages
const AdminLogin = lazy(() => import('./adminPage/Login'));
const AdminSignup = lazy(() => import('./adminPage/Signup'));

// Loading component
const LoadingFallback = () => (
  <div className="flex flex-col items-center gap-3 justify-center min-h-screen">
    <p className='arena text-xl font-semibold'>Please wait...</p>
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

function App() {
  useEffect(() => {
    AOS.init({
      duration: 1300,
      delay: 200,
      offset: 100,
      easing: 'ease-in-out',
    });
  }, []);
  
  return (
    <AuthProvider>
      <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="properties" element={<PropertiesPage />} />
            <Route path="/properties-detail-page/:id" element={<PropertiesDetailPage />} />
            <Route path="agents-page" element={<AgentsPage />} />
            <Route path="/agent-detail-page/:id" element={<AgentDetailPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path='/admin' element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<VerifyAdmin><AdminDashboard /></VerifyAdmin>} />
            <Route path="agents" element={<VerifyAdmin><AdminAgents /></VerifyAdmin>} />
            <Route path="inquiries" element={<VerifyAdmin><AdminInquiries /></VerifyAdmin>} />
            <Route path="properties" element={<VerifyAdmin><AdminProperties /></VerifyAdmin>} />
            <Route path='add-property' element={<VerifyAdmin><AdminAddProperty/></VerifyAdmin>} />
            <Route path='edit-property/:id' element={<VerifyAdmin><AdminEditProperty/></VerifyAdmin>} />
            <Route path="users" element={<VerifyAdmin><AdminUsers /></VerifyAdmin>} />
            <Route path="appointments" element={<VerifyAdmin><AppointmentsPage /></VerifyAdmin>} />
            <Route path="profile" element={<VerifyAdmin><AdminProfile /></VerifyAdmin>} />
            <Route path="settings" element={<VerifyAdmin><AdminSettings /></VerifyAdmin>} />
          </Route>

          {/* Admin Auth Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignup />} />

          {/* User Routes */}
          <Route path="/login" element={<UserLogin />} />
          <Route path="/signup" element={<UserSignup />} />
          <Route path="/reset-password" element={<PasswordReset />} />
          <Route path='/user-dashboard' element={<UserLayout/>}>
            <Route index element={<UserDashboard/>} />
            <Route path='saved-properties' element={<SavedProperties/>}/>
            <Route path='viewing-history' element={<ViewingHistory/>}/>
            <Route path="profile" element={<UserProfile/>} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path='notification' element={<Notification/>}/>
            <Route path='settings' element={<Settings/>}/>
          </Route>
          

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  </AuthProvider>
  );
}

export default App;