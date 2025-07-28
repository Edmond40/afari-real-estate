import { Mail, MapPin, PhoneCall } from "lucide-react";


function ContactInfo(){



    return(
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-5 p-4 bg-gray-100 shadow-sm rounded-lg">
                <h1 className="md:text-2xl text-base font-semibold">Contact Information</h1>
                <div className="flex gap-3">
                    <MapPin size={25} className="text-blue-500"/>
                    <div>
                        <h1>Main Office</h1>
                        <p>123 Real Estate St, City, State 12345</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <PhoneCall size={25} className="text-blue-500"/>
                    <div>
                        <h1>Phone</h1>
                        <p>+1 234 567 890</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Mail size={25} className="text-blue-500"/>
                    <div>
                        <h1>Email</h1>
                        <p>info@afari.com</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-5 p-4 bg-gray-100 shadow-sm rounded-lg">
                <h1 className="md:text-2xl text-base font-semibold">Office Hours</h1>
                <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                        <h1>Monday - Friday</h1>
                        <p>9:00 AM - 6:00 PM</p>
                    </div>

                    <div className="flex gap-3">
                        <h1>Saturday</h1>
                        <p>10:00 AM - 4:00 PM</p>
                    </div>

                    <div className="flex gap-3">
                        <h1>Sunday</h1>
                        <p>Closed</p>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default ContactInfo;