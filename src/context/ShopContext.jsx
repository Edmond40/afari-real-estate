import { agentInfo } from "../agentInfo/AgentInfo";
import { createContext, useState } from "react";
import { aboutCard } from "../Cards/AboutCard";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
    const currency = '$';
    const DeliveryFee = 10;

    // Properties state (no mock data; real data comes from API pages/hooks)
    const [properties, setProperties] = useState([]);

    // Note: Inquiries and Users are now managed via API hooks (useInquiries, useUsers)
    // These states are kept for backward compatibility with non-admin components

    // Add property
    function addProperty(property) {
        setProperties(prev => [
            ...prev,
            { ...property, id: prev.length ? Math.max(...prev.map(p => p.id)) + 1 : 1 }
        ]);
    }

    // Edit property
    function editProperty(updatedProperty) {
        setProperties(prev => prev.map(p => p.id === updatedProperty.id ? updatedProperty : p));
    }

    // Delete property
    function deleteProperty(id) {
        setProperties(prev => prev.filter(p => p.id !== id));
    }

    // Legacy functions kept for backward compatibility
    // Admin components now use API hooks directly

    // Filtering logic
    function filterProperties({location, propertyType, category, priceRange, baseProperties }) {
        let filtered = baseProperties ? [...baseProperties] : [...properties];
        if (location) {
            filtered = filtered.filter(p =>
                p.location.toLowerCase().includes(location.toLowerCase())
            );
        }
        if (propertyType && propertyType !== 'AllTypes') {
            filtered = filtered.filter(p => p.propertyType === propertyType);
        }

        if(category && category !== 'Any'){
            filtered = filtered.filter(p => p.category === category)
        }

        if (priceRange && priceRange !== 'AnyPrice') {
            const priceRanges = {
                '$100,000': price => price <= 100000,
                '$100,000-200,000': price => price >= 100000 && price <= 200000,
                '$400000-500000': price => price >= 400000 && price <= 500000,
            };
            if (priceRanges[priceRange]) {
                filtered = filtered.filter(p => priceRanges[priceRange](p.price));
            }
        }
        return filtered;
    }

    // Sorting logic
    function sortProperties(propertiesList, sortBy) {
        let sorted = [...propertiesList];
        switch (sortBy) {
            case 'price-low':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                sorted.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                break;
        }
        return sorted;
    }

    // Combined logic
    function getFilteredProperties(filters) {
        let filtered = filterProperties(filters);
        return sortProperties(filtered, filters.sortBy);
    }

    const value = {
        agentInfo,
        aboutCard,
        properties,
        currency,
        DeliveryFee,
        filterProperties,
        sortProperties,
        getFilteredProperties,
        addProperty,
        editProperty,
        deleteProperty,
        // Legacy properties - admin components use API hooks directly
    }

    return(
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;