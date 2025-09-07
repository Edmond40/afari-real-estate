import React from "react";
import { CheckCircle, HousePlus, ShieldCheck, Users } from "lucide-react";
import { useDashboardStats } from '../../lib/hooks/useDashboard';

const iconMap = {
    "Total Users": <Users size={30} className="text-indigo-400"/>,
    "Total Properties": <HousePlus size={30} className="text-green-400"/>,
    "Total Agents": <CheckCircle size={30} className="text-orange-400"/>,
    "Total Inquiries": <ShieldCheck size={30} className="text-violet-400"/>
}

function InfoCards(){
    const { data: dashboardData, isLoading, error } = useDashboardStats();
    
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse flex flex-col justify-between p-5 rounded-lg bg-gray-200 h-24">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-6 bg-gray-300 rounded w-1/2 mt-2"></div>
                    </div>
                ))}
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="p-4 text-red-500 text-center bg-red-50 rounded-lg mt-6">
                Failed to load dashboard statistics. Please try again.
            </div>
        );
    }

    const infoCard = dashboardData?.infoCards || [
        { Title: "Total Users", Users: "0" },
        { Title: "Total Properties", Users: "0" },
        { Title: "Active Listings", Users: "0" },
        { Title: "Total Agents", Users: "0" }
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