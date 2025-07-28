import { motion } from "framer-motion";
import { BellPlus } from "lucide-react";
import { useEffect } from "react";

function Notification({setShowNotification}){

    useEffect(() => {
        setTimeout(() =>{
            setShowNotification(false);           
        },5000);
    })

    return(
        <motion.div
        className="absolute top-16 right-20 bg-gray-100 p-3 flex flex-col gap-2 shadow-md rounded-md cursor-pointer" 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.6 }}
                onClick={(e) => e.stopPropagation()}>
            <div >
                <div className="flex items-center gap-1 border-b border-b-gray-300">
                    <BellPlus size={20} className="text-red-400"/>
                    <h1 className="text-gray-600">Notification</h1>
                </div>
                <div>
                    <h1 className="text-gray-600 font-semibold">Property Listed</h1>
                    <p>Obolo listed a villa</p>
                </div>
            </div>
        </motion.div>
    )
}


export default Notification;