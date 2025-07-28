import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getViewingHistory } from '../../lib/history';

function ViewingHistory(){
    const [viewingHistory, setViewingHistory] = useState([]);

    useEffect(() => {
        setViewingHistory(getViewingHistory());
    }, []);

    // Optional: implement delete functionality
    function handleDelete(id) {
        const updated = viewingHistory.filter(item => item.id !== id);
        localStorage.setItem('viewingHistory', JSON.stringify(updated));
        setViewingHistory(updated);
    }

    return(
        <div className='lg:grid lg:grid-cols-4 md:grid md:grid-cols-2 flex flex-col  items-center gap-4 shadow-md rounded-lg bg-gray-100 p-4'>
            {
                viewingHistory.length === 0 ? (
                    <div className='col-span-full w-full text-center text-gray-500 py-10'>No viewing history found.</div>
                ) : (
                    viewingHistory.map((view) => (
                        <div key={view.id} className='shadow-md rounded-lg bg-gray-50 p-3 w-58'>
                            <img src={view.image} alt="" className='w-20 h-20 object-cover rounded-md'/>
                            <div className='flex flex-col gap-1'>
                                <h1 className='font-semibold'>{view.name}</h1>
                                <div className='flex justify-between'>
                                    <span>Viewed on: {view.viewDate}</span>                           
                                    <Trash2 size={20} className='text-red-500 hover:text-red-600 hover:scale-110 duration-300 cursor-pointer ' onClick={() => handleDelete(view.id)}/>
                                </div>
                            </div>
                        </div>
                    ))
                )
            }
        </div>
    )
}

export default ViewingHistory;