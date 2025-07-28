import { Link } from 'react-router-dom';


function Footer(){


    return(
        <div className="bg-gray-800 text-gray-200 px-5 py-6 z-5">
            <div className="lg:grid lg:grid-cols-4 md:grid md:grid-cols-3 flex flex-col justify-between md:gap-1 gap-5">
                <div>
                    <h1 className="font-bold">About Afari</h1>
                    <p className="text-gray-400">Your trusted real estate platform for finding and listing properties.</p>
                </div>

                <div>
                    <h1 className="font-bold">Quick Links</h1>
                    <div className='flex flex-col w-28'>
                        <Link to="" className="text-gray-400 hover:text-gray-100 duration-300">Properties</Link>
                        <Link to="" className="text-gray-400 hover:text-gray-100 duration-300">Agents</Link>
                        <Link to="" className="text-gray-400 hover:text-gray-100 duration-300">About</Link>
                        <Link to="" className="text-gray-400 hover:text-gray-100 duration-300">Contact</Link>
                    </div>
                </div>

                <div>
                    <h1 className="font-bold">Contact Us</h1>
                    <p className="text-gray-400">Email: info@afari.com</p>
                    <p className="text-gray-400">Phone: +1 234 567 890</p>
                    <p className="text-gray-400">Address: 123 Real Estate St, City</p>
                </div>

                <div>
                    <h1 className="font-bold">Newsletter</h1>
                    <div className='flex flex-col gap-1'>
                        <p className="text-gray-400">Subscribe to our newsletter for updates</p>
                        <div className='w-4/5 border-2 flex rounded-md'>
                            <input type="email" name="email" id="email" placeholder="Your Email" className='p-2  w-full'/>
                            <button type="submit" className='bg-blue-500 rounded-r-md hover:bg-blue-600 duration-300 font-semibold p-2'>Subscribe</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-700 mt-8 p-8 text-center text-gray-400">
                <p>&copy; {new Date().getFullYear()} Afari. All rights reserved.</p>
            </div>
        </div>
    )
}

export default Footer;