import { useNavigate } from "react-router-dom";
import Background from '../assets/images/bg1.jpg'

function HeroSection(){
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/properties');
    }

    return(
        <div className='relative'>
            <img src={Background} alt="background" className='w-full md:h-[600px] md:object-cover object-contain brightness-70'/>
            {/* welcome message */}
            <div className='absolute md:bottom-20 md:mt-32 top-20 left-0 right-0 text-gray-50 flex flex-col items-center gap-4'>
                <div className='border-t-2 border-b-2 border-t-white border-b-white flex items-center mx-auto max-w-6xl md:p-6' data-aos="fade-down">
                    <p className='text-gray-100 text-sm lg:text-6xl md:text-4xl' data-aos="fade-left">Find Your Dream 
                    </p>
                    <span className="text-yellow-500" data-aos="zoom-in" data-aos-duration="4000">
                            <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 -960 960 960"  className="md:w-16 md:h-16 w-10 h-10" fill="#f0cc1c"><path d="M214.77-160q-22.08 0-37.65-15.48-15.58-15.48-15.58-37.6v-69.07L303.08-408v248h-88.31Zm122.15 0v-141.54h286.16V-160H336.92Zm320 0v-290.68l-152.54-134.7 107.16-94.7 169.23 149.77q8.46 8.23 13.08 18.41 4.61 10.17 4.61 21.68v276.95q0 22.12-15.48 37.69Q767.5-160 745.38-160h-88.46ZM161.54-328.46v-161.25q0-11.45 4.61-22.02 4.62-10.58 13.08-18.58l265.39-235.23q8-7.23 16.99-10.34 9-3.12 18.43-3.12 9.42 0 18.38 3.12 8.96 3.11 16.96 10.34l70.77 63.31-424.61 373.77Z"/>
                            </svg>
                    </span>
                    <p className='text-blue-500 lg:font-semibold lg:text-6xl md:text-4xl text-sm' data-aos="fade-right">Property Today</p>
                </div>
                <p className='text-center md:text-base text-sm mx-2 md:mx-4' data-aos="fade-up">Browse through thousands of properties for rent, sale, or short-let. Find your perfect home with Afari.</p>


                {/* Links */}
                <div className='flex justify-center gap-3 mx-auto'>
                    <button onClick={()=> navigate('/properties')} className='md:w-full  p-2 text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-md' data-aos="fade-left">Browse Properties</button>

                    <button onClick={()=> navigate('/properties')} className='md:w-full md:p-4 p-2 text-base font-medium rounded-md text-blue-800 bg-white hover:bg-blue-100 shadow-sm cursor-pointer' data-aos="fade-right">List Properties</button>
                </div>
            </div>
        </div>
    )
}

export default HeroSection;