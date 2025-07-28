import { Routes, Route } from 'react-router-dom';
import './App.css'
import MainLayout from './pages/MainLayout';
import Home from './pages/Home';
import PropertiesPage from './pages/PropertiesPage';
import AgentsPage from './pages/AgentsPage';
import About from './pages/About'
import AdminDashboard from '../src/adminPage/pages/AdminDashboard'
import AdminLayout from './adminPage/data/AdminLayout';
import User from './adminPage/pages/User';
import Properties from './adminPage/pages/Properties';
import Inquiries from './adminPage/pages/Inquiries'
import Agent from './adminPage/pages/Agent'
import Contact from './pages/Contact';
import UserDashboard from './userPage/user-page/UserDashboard';
import SavedProperties from './userPage/user-page/SavedProperties';
import UserLayout from './userPage/user-data/UserLayout';
import ViewingHistory from './userPage/user-page/ViewingHistory';
import Notification from './userPage/user-page/Notification';
import Appointment from './userPage/user-page/Appointment';
import Settings from './userPage/user-page/Settings';
import PropertiesDetailPage from './pages/PropertiesDetailPage';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import AgentDetailPage from './pages/AgentDetailPage';
import NotFoundPage from './NotFoundPage';
import SignUp from './userPage/Signup';
import LogIn from './userPage/Login';
import PasswordReset from './userPage/PasswordReset';
import UserProfile from './userPage/UserProfile';
import PrivateRoute from './components/PrivateRoute';

function App() {


  return (
    <>
      <div>
        {/* SiteLayout */}
        <Routes>
          <Route path='/' element={<MainLayout/>}>
            <Route index element={<Home/>}></Route> 
            <Route path='properties' element={<PropertiesPage/>}></Route>
            <Route path='properties-detail-page/:id' element={<PropertiesDetailPage/>}></Route>
            <Route path='agents-page' element={<AgentsPage/>}></Route>
            <Route path='agent-detail-page/:id' element={<AgentDetailPage/>}></Route>
            <Route path='about' element={<About/>}></Route>
            <Route path='contact' element={<Contact/>}></Route>           
          </Route>
        </Routes>
      
        <ToastContainer position="bottom-right" autoClose={3000}/>

        {/* AdminLayout */}
        <Routes>
          <Route path='/AdminDashboard' element={<AdminLayout/>}>
            <Route index element={<AdminDashboard/>}></Route>
            <Route path='User' element={<User/>}></Route>
            <Route path='Properties' element={<Properties/>}></Route>
            <Route path='Agent' element={<Agent/>}></Route>
            <Route path='Inquiries' element={<Inquiries/>}></Route>
          </Route>       
          
          {/* UserLayout */}
          <Route path='/user-dashboard' element={<UserLayout/>}>
            <Route index  element={<UserDashboard/>}></Route>
            <Route path='saved-properties' element={<SavedProperties/>}></Route>
            <Route path='viewing-history' element={<ViewingHistory/>}></Route>
            <Route path='appointments' element={<Appointment/>}></Route>
            <Route path='notification' element={<Notification/>}></Route>
            <Route path='settings' element={<Settings/>}></Route>
          </Route>
          <Route path='sign-up' element={<SignUp/>}></Route>
          <Route path='log-in' element={<LogIn/>}></Route>
          <Route path='reset-password' element={<PasswordReset/>}></Route>
          <Route path='profile' element={
            <PrivateRoute>
              <UserProfile/>
            </PrivateRoute>
          } />
        </Routes>  
      </div>
    </>
  )
}

export default App
