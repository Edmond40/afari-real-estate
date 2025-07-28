import { motion } from "framer-motion";
import { MessageCircleMore } from "lucide-react";
import { useEffect } from "react";


function MessageAlert({setShowMessage}){

    useEffect(() => {
        setTimeout(() => {
            setShowMessage(false);
        },5000);
    })

    return(
        <motion.div
        className="absolute top-16 right-10 bg-gray-100 p-3 flex flex-col gap-2 shadow-md rounded-md cursor-pointer" 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                // exit={{ scale: 0, x: 50 }}
                transition={{ duration: 0.6 }}
                onClick={(e) => e.stopPropagation()}>
            <div >
                <div className="flex items-center gap-1 border-b border-b-gray-300">
                    <MessageCircleMore size={20} className="text-yellow-400"/>
                    <h1 className=" text-gray-600">Message Alert</h1>
                </div>
                <div>
                    <h1 className="text-gray-600 font-semibold">You've got a new message</h1>
                    <p>Mr. Smith wants to see an agent</p>
                </div>
            </div>
        </motion.div>
    )
}


export default MessageAlert;