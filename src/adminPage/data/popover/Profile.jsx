import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

function Profile({ setShowProfile }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowProfile(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [setShowProfile]);

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  return (
    <motion.div
      className="absolute top-16 right-10 bg-gray-100 p-3 flex flex-col shadow-md rounded-md cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1 border-b border-b-gray-300">
          <User size={20} className="text-blue-400" />
          <h1 className=" text-gray-600">Admin Profile</h1>
        </div>
        <div className="flex flex-col mt-2 mb-2 text-xs text-gray-500">
          {user && <span>{user.email}</span>}
        </div>
        <div className="flex flex-col">
          <Link to="settings">Settings</Link>
          <button
            type="button"
            className="text-left text-gray-600 font-semibold cursor-pointer"
            onClick={handleLogout}
          >
            LogOut
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default Profile;