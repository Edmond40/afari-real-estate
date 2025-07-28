import { Outlet } from "react-router-dom";
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileNavbar from "./MobileNavbar";

function MainLayout(){


    return(
        <div >

            <div className="flex flex-col flex-grow">
                <div className="md:hidden">
                    <MobileNavbar/>
                </div>

                <div className="flex flex-col min-h-screen justify-between">
                    <div className="hidden md:flex">
                        <Header/>
                    </div>

                    <div className="mt-18">
                        <Outlet/>
                    </div>

                    <Footer/>
                </div>
            </div>
        </div>
    )
}

export default MainLayout;