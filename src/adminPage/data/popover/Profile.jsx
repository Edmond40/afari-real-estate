import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";


function Profile({setShowProfile}){
    useEffect(() => {
        setTimeout(() => {
            setShowProfile(false);
        },5000)
    })

    return(
        <motion.div
        className="absolute top-16 right-10 bg-gray-100 p-3 flex flex-col shadow-md rounded-md cursor-pointer" 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                // exit={{ scale: 0, x: 50 }}
                transition={{ duration: 0.6 }}
                onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1 border-b border-b-gray-300">
                    <User size={20} className="text-blue-400"/>
                    <h1 className=" text-gray-600">Admin Profile</h1>
                </div>
                <div className="flex flex-col">
                    <Link to="">Settings</Link>
                    <button type="submit" className="text-left text-gray-600 font-semibold cursor-pointer">LogOut</button>
                </div>
            </div>
        </motion.div>
    )
}


export default Profile;