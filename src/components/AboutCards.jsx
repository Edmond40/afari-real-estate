import { ShieldCheck, Users, Zap } from "lucide-react";



function AboutCards(){


    return(
        <div className="flex flex-col gap-10 p-10 relative bg-white">
            <div className="flex flex-col gap-4 items-center text-center lg:w-1/2 md:w-4/5 w-full mx-auto" data-aos="fade-right">
                <h1 className="text-base md:text-4xl font-semibold">Our Mission</h1>
                <p className="text-gray-600 md:text-lg text-base">At Afari, we're committed to making the real estate journey seamless and rewarding for everyone. We believe in transparency, integrity, and personalized service to help you find the perfect property.</p>
            </div>

            <div className="md:grid md:grid-cols-3 flex flex-col gap-5" data-aos="zoom-in">
                <div className="flex flex-col items-center gap-3 w-full text-center bg-gray-50 rounded-lg shadow-md p-6 hover:-translate-y-4 duration-300 cursor-pointer">
                    <ShieldCheck size={40} className="text-blue-600"/>
                    <div>
                        <h1 className="text-lg font-semibold">Trust & Integrity</h1>
                        <p>We maintain the highest standards of honesty and transparency in all our dealings.</p>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-3 w-full text-center bg-gray-50 rounded-lg shadow-md p-6 hover:-translate-y-4 duration-300 cursor-pointer">
                    <Zap size={40} className="text-blue-600"/>
                    <div>
                        <h1 className="text-lg font-semibold">Innovation</h1>
                        <p>We leverage cutting-edge technology to provide the best real estate experience.</p>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-3 w-full text-center bg-gray-50 rounded-lg shadow-md p-6 hover:-translate-y-4 duration-300 cursor-pointer">
                    <Users size={40} className="text-blue-600"/>
                    <div>
                        <h1 className="text-lg font-semibold">Community</h1>
                        <p>We build strong relationships with our clients and communities we serve.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AboutCards;