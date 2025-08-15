import { useEffect, useState } from "react";
import { aboutCard } from "./AboutCard";


function AboutTeamCard(){
    const [about, setAbout ] = useState([]);

    useEffect(() => {
        setAbout(aboutCard)

    },[aboutCard])

    if(!aboutCard || aboutCard.length === 0){
        return <div>Loading...</div>;
    }

    if(about === null){
        return <div>Loading about..........</div>
    }

    if(!about){
        return <div>About not found</div>
    }


    return(
        <div className="flex flex-col gap-10 p-10">
            <div className="flex flex-col gap-4 items-center text-center lg:w-1/2 md:w-4/5 w-full mx-auto" data-aos="fade-down">
                <h1 className="text-base md:text-4xl font-semibold">Our Leadership Team</h1>
            </div>
            <div className="md:grid md:grid-cols-3 flex flex-col gap-5 ">
                {
                    about.map((item, index) => (
                        <div key={index} className="bg-gray-100 flex flex-col items-center p-4 rounded-lg shadow-md" data-aos="zoom-in">
                        <div>
                                <img src={item.Image} alt="" className="w-32 h-32 rounded-full object-cover"/>
                            </div>
                            <div className="text-gray-700 text-center">
                                <h1 className="text-base md:text-xl font-semibold text-gray-900">{item.teamName}</h1>
                                <p>{item.status}</p>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default AboutTeamCard;