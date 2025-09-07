import { useState } from "react";
import H1 from "../assets/images/h10.jpeg"
import H2 from "../assets/images/3d-rendering-white-wood-living-room-near-bedroom-upstair.jpg"
import H3 from "../assets/images/house3.jpeg"
import H4 from "../assets/images/bg4.jpg"

function PropertiesImage({ listing }){
    const property = listing;
    const [activeImage, setActiveImage] = useState(0);
    if (!property) return null;

    // Use provided images or fallbacks
    const propertyImages = Array.isArray(property.images) && property.images.length > 0
        ? property.images
        : [property.image || H1, H2, H3, H4];

    return(
        <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8" data-aos="fade-right">
            <div className="relative h-96">
                <img
                    src={propertyImages[activeImage]}
                    alt={property.title || property.name || 'Property'}
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
                                alt={`${property.title || property.name || 'Property'} ${index + 1}`}
                                className="w-full h-full object-cover"
                            />

                        </button>
                    ))}
                </div>
            </div>
            </div>

            {/* Property Description */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8" data-aos="flip-down">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">
                    {property.description || (
                        `This beautiful ${(property.type || property.propertyType || 'home').toLowerCase()} is located in the heart of ${property.location || [property.city, property.state].filter(Boolean).join(', ')}. ` +
                        `Perfect for ${(property.status || property.category) === 'For Sale' ? 'buying' : 'renting'}, this property offers modern amenities and a prime location.`
                    )}
                </p>

            </div>
        </div>
    )
}

export default PropertiesImage;