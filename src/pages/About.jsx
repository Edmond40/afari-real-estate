import AboutTeamCard from "../Cards/AboutTeamCard";
import AboutCards from "../components/AboutCards";
import AboutSection from "../components/AboutSection";
import AboutYears from "../components/AboutYears";


function About(){

    return(
        <div>
            <AboutSection/>
            <div className="bg-white z-5 relative flex flex-col">
                <AboutCards/>
                <AboutTeamCard/>
                <AboutYears/>
            </div>
        </div>
    )
}

export default About;