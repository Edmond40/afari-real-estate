import ContactForm from "../components/ContactForm";
import ContactInfo from "../components/ContactInfo";
import ContactSection from "../components/ContactSection";



function Contact(){

    return(
        <div>
            <ContactSection/>

            <div className="bg-white z-5 relative md:grid md:grid-cols-2 flex flex-col p-5 mt-5 gap-5">
                <ContactForm/>
                <ContactInfo/>
            </div>
        </div>
    )
}

export default Contact;