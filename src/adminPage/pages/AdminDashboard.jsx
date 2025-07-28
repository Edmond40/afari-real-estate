import InfoCards from "../data/InfoCards";
import PropertiesCard from "../data/PropertiesChart";


function AdminDashboard(props){


    return(
        <div className="p-4">
            <h1 className="text-xl font-semibold">Dashboard Overview</h1>
            <div>
                <InfoCards/>
                <PropertiesCard/>
            </div>
        </div>
    )
}

export default AdminDashboard;