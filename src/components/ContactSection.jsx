import Background from '../assets/images/real-estate-agent-handing-house-key-client.jpg'

function ContactSection(){


    return(
        <div className="relative h-[80vh] overflow-hidden">
            <img src={Background} alt="background" className="fixed top-0 left-0 w-full h-full object-cover brightness-70"/>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-50 gap-2">
                <h1 className="text-base lg:text-5xl md:text-4xl font-semibold text-yellow-400">Contact Us</h1>
                <p className="text-center md:text-base text-sm mx-2 md:mx-4">We are here to help you find your dream property</p>
            </div>
        </div>

    )
}


export default ContactSection;