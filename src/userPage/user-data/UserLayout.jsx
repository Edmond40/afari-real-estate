import { Outlet } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import UserSidebar from "../user-page/UserSidebar"
import MobileNavbar from "../../pages/MobileNavbar";


function UserLayout(){
    

    return(
        <div className="flex flex-col h-screen justify-between gap-4">
            <div className="md:hidden">
                    <MobileNavbar/>
                </div>
            <div className="hidden md:flex">
                <Header/>
            </div>
            <div className="mt-18">
                <div className="bg-gray-100 p-7 rounded-md shadow-md m-4">
                    <h1 className="text-xl font-semibold text-gray-700">Welcome back, {}</h1>
                </div>

                <div className="md:flex md:flex-row flex-col md:gap-4 p-4">
                    <UserSidebar/>
                    <main className="flex-1 md:mt-0 mt-5">
                        <Outlet/>
                    </main>

                </div>
            </div>

            <Footer/>
        </div>
    )
}


export default UserLayout;