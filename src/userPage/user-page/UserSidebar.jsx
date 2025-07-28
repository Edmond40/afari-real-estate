import { Link } from "react-router-dom";
import { UserNavLinks } from "../user-data/UserNavLinks";




function Usersidebar(){


    return(
        <div className="md:w-56 h-96 flex flex-col gap-4 p-5 bg-gray-100 shadow-md rounded-md">
            { UserNavLinks.map((UserNavLink, index) => (
                <div key={index}>
                    <Link key={index} to={UserNavLink.to} className="flex items-center gap-1 text-gray-700 hover:bg-gray-200 hover:scale-110 duration-300 p-2 rounded-md">
                        <UserNavLink.icon size={20}/>
                        <h1>{UserNavLink.label}</h1>
                    </Link>
                </div>
            ))}
        </div>
    )
}

export default Usersidebar;