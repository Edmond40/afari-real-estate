import { agentInfo } from "../agentInfo/AgentInfo";
import { createContext, useState } from "react";
import { properties as initialProperties } from '../propertiesInfo/propertiesInfo'
import { aboutCard } from "../Cards/AboutCard";
export const ShopContext = createContext()

const ShopContextProvider = (props) => {
    const currency = '$';
    const DeliveryFee = 10;

    // Properties state
    const [properties, setProperties] = useState([...initialProperties]);

    // Inquiries state
    const [inquiries, setInquiries] = useState([]);

    // Users state
    const [users, setUsers] = useState([
        {id:1, name: "Yhoung Promize", email: "www.obolotech@gmail.com", joined: '21 Apr 2025', role: 'admin'},
        {id:2, name: "Obolo", email: "yhoungpromise@gmail.com", joined: '21 Apr 2025', role: 'agent'},
        {id:3, name: "Nana Yaa", email: "nanayaa@gmail.com", joined: '21 Apr 2025', role: 'viewer'}
    ]);

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

    // Add inquiry
    function addInquiry(inquiry) {
        setInquiries(prev => [
            ...prev,
            { ...inquiry, id: prev.length ? Math.max(...prev.map(i => i.id)) + 1 : 1 }
        ]);
    }

    // Delete inquiry
    function deleteInquiry(id) {
        setInquiries(prev => prev.filter(i => i.id !== id));
    }

    // Update inquiry status
    function updateInquiryStatus(id, status) {
        setInquiries(prev => prev.map(i => i.id === id ? { ...i, agentStatus: status } : i));
    }

    // Add user
    function addUser(user) {
        setUsers(prev => [
            ...prev,
            {
                ...user,
                id: prev.length ? Math.max(...prev.map(u => u.id)) + 1 : 1,
                joined: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
            }
        ]);
    }
    // Edit user
    function editUser(updatedUser) {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    }
    // Delete user
    function deleteUser(id) {
        setUsers(prev => prev.filter(u => u.id !== id));
    }

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
        inquiries,
        addInquiry,
        deleteInquiry,
        updateInquiryStatus,
        users,
        addUser,
        editUser,
        deleteUser
    }

    return(
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;