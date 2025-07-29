import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

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
const AdminUsers = lazy(() => import('./adminPage/pages/User'));

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

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

function App() {
  return (
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
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="agents" element={<AdminAgents />} />
            <Route path="inquiries" element={<AdminInquiries />} />
            <Route path="properties" element={<AdminProperties />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>

          {/* User Routes */}
          <Route path="/login" element={<UserLogin />} />
          <Route path="/signup" element={<UserSignup />} />
          <Route path="/reset-password" element={<PasswordReset />} />
          <Route path='/user-dashboard' element={<UserLayout/>}>
            <Route index element={<UserDashboard/>} />
            <Route path='saved-properties' element={<SavedProperties/>}/>
            <Route path='viewing-history' element={<ViewingHistory/>}/>
            <Route path="profile" element={<UserProfile/>} />
            <Route path="appointments" element={<Appointment/>}/>
            <Route path='notification' element={<Notification/>}/>
            <Route path='settings' element={<Settings/>}/>
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;