import { Bell, CalendarCheck, Eye, HouseIcon, MessageSquare, Star, Bookmark, History } from "lucide-react";
import { useDashboardStats } from '../../lib/hooks/useDashboard';
import { useUserInteractions } from '../../lib/hooks/useUserInteractions';

const iconMap = {
    "Active Listings": <HouseIcon size={30} className="text-green-400"/>,
    "Favorites": <Star size={30} className="text-yellow-400"/>,
    "Saved Properties": <Bookmark size={30} className="text-blue-400"/>,
    "Viewing History": <History size={30} className="text-purple-400"/>,
    "Messages": <MessageSquare size={30} className="text-pink-400"/>,
    "Total Views": <Eye size={30} className="text-indigo-400"/>,
    "Appointments": <CalendarCheck size={30} className="text-orange-400"/>,
    "Notifications": <Bell size={30} className="text-violet-400"/>
}


function UserCards(){
    const { data: dashboardData, isLoading: dashboardLoading } = useDashboardStats();
    const { stats, statsLoading, likedProperties, savedProperties, useViewingHistory } = useUserInteractions();
    const { data: viewingHistoryData } = useViewingHistory({ page: 1, limit: 1 });
    
    // Show loading state
    if (statsLoading || dashboardLoading) {
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

    // Use dashboard data if available, otherwise fallback to user interactions
    const userCards = dashboardData?.userCardStat || [
        {
            Title: "Favorites",
            Users: likedProperties?.length || 0
        },
        {
            Title: "Saved Properties", 
            Users: savedProperties?.length || 0
        },
        {
            Title: "Viewing History",
            Users: viewingHistoryData?.total || 0
        },
        {
            Title: "Total Views",
            Users: stats?.views || 0
        }
    ];


    return(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 mb-6" data-testid="user-cards">
            {
                userCards.map((card)=> (
                    <div key={card.Title} className="flex flex-col justify-between p-5 rounded-lg bg-gray-800 text-gray-50 shadow hover:shadow-lg transition-shadow duration-200">
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