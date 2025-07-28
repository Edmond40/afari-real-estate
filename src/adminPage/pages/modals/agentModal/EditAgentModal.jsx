import { SquarePen, X } from "lucide-react";
import { motion } from 'framer-motion'

function EditAgentModal({onClose}){

    function SubmitForms(event){
        event.preventDefault();
    }

    function handleOnChange(event){
        event.target.name;
    }

    return(
        <div className="fixed inset-0 backdrop-brightness-50 flex items-center justify-center z-50 overflow-auto top-0 bottom-0" onClick={onClose}>
            <motion.div className="bg-white shadow p-8 w-full md:w-1/3 mx-auto rounded-lg p-4 text-gray-900" 
                initial={{ scale: 0, x: -100 }}
                animate={{ scale: 1, x: 0 }}
                // exit={{ scale: 0, x: 50 }}
                transition={{ duration: 0.6 }}
                onClick={(e) => e.stopPropagation()}>
                <div className="relative">
                    <X size={20} className="text-gray-700 absolute right-5 -top-6 cursor-pointer " onClick={onClose}/>
                    <form onSubmit={SubmitForms} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4">
                            <input type="text" name="name" id="" placeholder="Name*" className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"/>

                            <input type="email" name="email" id="" placeholder="Email*" className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"/>

                            <input type="text" name="number" id="" placeholder="Number*" className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"/>
                            

                            {/* No of properties */}
                            <select name="dropdown" id="" className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300">
                                <option value="any*">Number of Properties</option>
                                <option value="4">4</option>
                                <option value="3">3</option>
                                <option value="2">2</option>
                                <option value="1">1</option>
                            </select>

                            <select name="dropdown" id="" className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300">
                                <option value="any*">Select Location</option>
                                <option value="4">U.K</option>
                                <option value="3">U.S.A</option>
                                <option value="2">France</option>
                                <option value="1">Germany</option>
                            </select>

                            <select name="dropdown" id="" className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300">
                                <option value="any*">Status</option>
                                <option value="4">Inactive</option>
                                <option value="3">Active</option>
                                <option value="2">Pending</option>
                                <option value="1">Suspended</option>
                            </select>

                            <input type="text" src="/image" id="" placeholder="/image/team3.jpg*" className="border-2 border-gray-700 rounded-md p-2 focus:outline-blue-500 duration-300"/>

                            <div className="flex w-52 mx-auto justify-center items-center gap-1 bg-blue-500 text-white p-2 rounded-md hover:scale-110 duration-300 cursor-pointer" onClick={onClose}>
                                <SquarePen/>
                                <span>Edit Agent</span>
                            </div>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}


export default EditAgentModal;