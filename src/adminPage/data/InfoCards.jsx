import React, { useContext } from "react";
import { CheckCircle, HousePlus, ShieldCheck, Users } from "lucide-react";
import { ShopContext } from '../../context/ShopContext';

const iconMap = {
    "Total Users": <Users size={30} className="text-indigo-400"/>,
    "Total Properties": <HousePlus size={30} className="text-green-400"/>,
    "Active Listings": <CheckCircle size={30} className="text-orange-400"/>,
    "Total Admins": <ShieldCheck size={30} className="text-violet-400"/>
}

function InfoCards(){
    const { properties, users } = useContext(ShopContext);
    const totalUsers = users.filter(u => u.role === 'user' || u.role === 'viewer' || u.role === 'agent').length;
    const totalAdmins = users.filter(u => u.role === 'admin').length;
    const totalProperties = properties.length;
    const activeListings = properties.filter(p => (p.propertyType === 'For Sale' || p.propertyType === 'For Rent')).length;

    const infoCard = [
        { Title: "Total Users", Users: totalUsers },
        { Title: "Total Properties", Users: totalProperties },
        { Title: "Active Listings", Users: activeListings },
        { Title: "Total Admins", Users: totalAdmins }
    ];

    return(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 mb-6">
            {
                infoCard.map((card) => (
                    <div key={card.Title} className="flex flex-col justify-between p-5 rounded-lg bg-gray-100 shadow">
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

export default InfoCards;