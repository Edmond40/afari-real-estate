import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import H1 from "../assets/images/h10.jpeg"
import H2 from "../assets/images/3d-rendering-white-wood-living-room-near-bedroom-upstair.jpg"
import H3 from "../assets/images/house3.jpeg"
import H4 from "../assets/images/bg4.jpg"

function PropertiesImage(){
    const { id } = useParams()
    const [property, setProperty] = useState(null)
    const { properties } = useContext(ShopContext)
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        if(properties.length > 0){
            const foundProperty = properties.find(p=> p.id == id)
            setProperty(foundProperty)
        }
    },[id, properties])

    if(!properties || properties.length === 0){
        return <div>Loading......</div>
    }

    if(property == null) return <div>Loading property details...</div>

    if(!property) return <div>Property not found</div>

    // Mock images for the property
    const propertyImages = [
        property.image || H1,H2,H3,H4];

    return(
        <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="relative h-96">
                <img
                    src={propertyImages[activeImage]}
                    alt={property.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                    <span className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                        {activeImage + 1} / {propertyImages.length}
                    </span>
                </div>
            </div>
            <div className="p-4">
                <div className="grid grid-cols-4 gap-2">
                    {propertyImages.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveImage(index)}
                            className={`h-20 rounded-md overflow-hidden ${
                                activeImage === index ? 'ring-2 ring-blue-500' : ''
                            }`}
                        >
                            <img
                                src={image}
                                alt={`${property.name} ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            </div>
            </div>

            {/* Property Description */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">
                    This beautiful {property.propertyType.toLowerCase()} is located in the heart of {property.location}. 
                    Perfect for {property.category === 'For Sale' ? 'buying' : 'renting'}, this property offers 
                    modern amenities and a prime location. The property features high-quality finishes, 
                    spacious rooms, and excellent natural lighting throughout.
                </p>
            </div>
        </div>
    )
}


export default PropertiesImage;