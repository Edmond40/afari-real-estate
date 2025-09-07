import { X } from "lucide-react";
import { motion } from 'framer-motion'

function EditInquiriesModal({onClose, inquiry}){
    return(
        <div className="fixed inset-0 backdrop-brightness-50 flex items-center justify-center z-50 overflow-auto top-0 bottom-0" onClick={onClose}>
            <motion.div className="bg-white shadow p-8 w-full md:w-1/3 mx-auto rounded-lg text-gray-900" 
                initial={{ scale: 0, x: -100 }}
                animate={{ scale: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                onClick={(e) => e.stopPropagation()}>
                <div className="relative">
                    <X size={20} className="text-gray-700 absolute right-0 -top-6 cursor-pointer " onClick={onClose}/>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <p>Property: <span className="font-semibold text-gray-600">{inquiry?.propertyName}</span></p>
                            <p>User: <span className="font-semibold text-gray-600">{inquiry?.user}</span></p>
                            <p>Phone: <span className="font-semibold text-gray-600">{inquiry?.phone}</span></p>
                            <p>Message: <span className="font-semibold text-gray-600">{inquiry?.message}</span></p>
                            <p>Agent Info: <span className="font-semibold text-gray-600">{inquiry?.agentName}</span></p>
                            <p>Date: <span className="font-semibold text-gray-600">{inquiry?.date}</span></p>
                            <p>Status: <span className="font-semibold text-gray-600">{inquiry?.agentStatus}</span></p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default EditInquiriesModal;