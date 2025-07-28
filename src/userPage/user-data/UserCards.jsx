import axios from "axios";
import { Bell, CalendarCheck, Eye, HouseIcon, MessageSquare, Star } from "lucide-react";
import { useEffect, useState } from "react";

const iconMap = {
    "Active Listings": <HouseIcon size={30} className="text-green-400"/>,
    "Favorities": <Star size={30} className="text-yellow-400"/>,
    "Messages": <MessageSquare size={30} className="text-pink-400"/>,
    "Total Views": <Eye size={30} className="text-indigo-400"/>,
    "Appointments": <CalendarCheck size={30} className="text-orange-400"/>,
    "Notifications": <Bell size={30} className="text-violet-400"/>
}


function UserCards(){

    const [userCard, setUserCard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null)
    
    useEffect(()=> {
        axios.get("/UserCardStat.json")
        .then(res => {
            if(Array.isArray(res.data.userCardStat)){
                setUserCard(res.data.userCardStat)
            }else{
                setUserCard([])
                setError("No User was found");
            }
        }).catch(error => {
            console.log(error);
            setError("Failed to fetch data");
            setUserCard([])
        }).finally(() => setLoading(false));

    },[])

    if(loading) return <div>Loading......</div>
    if(error) return <div className="text-red-500">{error}</div>


    return(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 mb-6">
            {
                userCard.map((card)=> (
                    <div key={card.Title} className="flex flex-col justify-between p-5 rounded-lg bg-gray-800 text-gray-50 shadow">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">{card.Title}</span>
                            {iconMap[card.Title]}
                        </div>
                        <p className="text-lg font-semibold">{card.Users}</p>
                    </div>
                ))
            }
        </div>
    )
}

export default UserCards;