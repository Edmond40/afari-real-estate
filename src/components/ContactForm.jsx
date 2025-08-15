

function ContactForm(){

    function handleForm(e){
        e.preventDefault();
    }

    return(
        <div className="p-4 bg-gray-100 shadow-sm rounded-lg" data-aos="fade-right">
            <form onSubmit={handleForm} className="flex flex-col gap-3">
                <div>
                    <label htmlFor="name">Name</label>
                    <input type="text" name="name" id="" className="w-full p-2 shadow-md rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 duration-300"/>
                </div>

                <div>
                    <label htmlFor="email">Email</label>
                    <input type="text" name="email" id="" className="w-full p-2 shadow-md rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 duration-300"/>
                </div>

                <div>
                    <label htmlFor="subject">Subject</label>
                    <input type="text" name="subject" id="" className="w-full p-2 shadow-md rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 duration-300"/>
                </div>

                <div>
                    <label htmlFor="message">Message</label>
                    <textarea name="message" id="" rows={5} className="w-full shadow-md rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 duration-300"></textarea>
                </div>

                <button type="submit" className="w-full p-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 duration-300">Send Message</button>
            </form>
        </div>
    )
}

export default ContactForm