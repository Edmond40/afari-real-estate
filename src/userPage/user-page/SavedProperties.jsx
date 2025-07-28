import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { getFavorites, removeFavorite } from '../../lib/favorites';

function SavedProperties(){
    const [saveProp, setSaveProp] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Delete handler to remove property by id
    function handleDelete(id) {
        removeFavorite(id);
        setSaveProp(getFavorites());
        toast.error("Item Deleted Successfully");
    }
    

    useEffect(() => {
        setLoading(true);
        setSaveProp(getFavorites());
        setLoading(false);
    }, []);

    if(loading) return <div>Loading......</div>
    if(error) return <div className="text-red-500">{error}</div>

    return(
        <div className='lg:grid lg:grid-cols-4 md:grid md:grid-cols-2 flex flex-col  items-center gap-10 shadow-md rounded-lg bg-gray-100 p-4'>
            {
                saveProp.length === 0 ? <div className='col-span-full w-full text-center text-gray-500 py-10'>No saved properties found.</div> : (
                    saveProp.map((save) => (
                        <div key={save.id} className="flex flex-col justify-between rounded-lg text-gray-700 shadow-md h-full overflow-hidden">
                            <img src={save.image} alt="" className='overflow-hidden h-40'/>
                            <div className="flex flex-col justify-between p-3">
                                <span className='font-semibold'>{save.name}</span>
                                <p className='text-green-400 font-semibold'>${save.price}</p>
                                <p>{save.location}</p>
                            </div>
                            <div className='flex justify-between p-3'>
                                <Link to={`/properties-detail-page/${save.id}`} className='text-blue-500'>View Details</Link>
                                <Trash2
                                    size={20}
                                    className='text-red-500 hover:text-red-600 hover:scale-110 duration-300 cursor-pointer'
                                    onClick={() => handleDelete(save.id)}
                                />
                            </div>
                        </div>
                    ))
                )
            }
        </div>
    )
}

export default SavedProperties;