import { useContext, useEffect, useState } from "react";
import AgentItem from "../components/AgentItem";
import { ShopContext } from "../context/ShopContext";

function AgentsPage(){
    const {agentInfo} = useContext(ShopContext);
    const [agentCards, setAgentCards] = useState([]);
    const [searchAgent, setSearchAgent] = useState({
        AgentName: '',
        locationFilter: 'All Locations',
        statusFilter: 'All Status',
        propertyFilter: 'All Properties',
    })

    function handleInputChange(e){
        const { name, value } = e.target;
        setSearchAgent(prev => ({
            ...prev,
            [name]: value
        }))
    }

    function handleSearch(e){
        e.preventDefault();

        let filtered = agentInfo;

        if(searchAgent.AgentName){
            filtered = filtered.filter(agent => agent.AgentName.toLowerCase().includes(searchAgent.AgentName.toLowerCase()))
        }

        if(searchAgent.locationFilter !== 'All Locations'){
            filtered = filtered.filter(agent => agent.Location === searchAgent.locationFilter)
        }

        if(searchAgent.statusFilter !== 'All Status'){
            filtered = filtered.filter(agent => agent.AgentStatus === searchAgent.statusFilter)
        }

        if(searchAgent.propertyFilter !== 'All Properties'){
            if (searchAgent.propertyFilter === '10') {
                filtered = filtered.filter(agent => agent.AgentProperties >= 10);
            } else if (searchAgent.propertyFilter === '20') {
                filtered = filtered.filter(agent => agent.AgentProperties >= 20);
            }
        }
        setAgentCards(filtered);
    }

    useEffect(() => {
        setAgentCards(agentInfo)
    },[agentInfo])

    return(
        <div className="flex flex-col gap-5 m-5">
            <div className="bg-gray-50 p-10 rounded-md shadow-md">
                <form onSubmit={handleSearch} className="flex flex-col gap-4">
                    <div className="md:grid md:grid-cols-4 flex flex-col md:flex-row gap-4">

                        <input type="text" name="AgentName"
                            value={searchAgent.AgentName}
                            onChange={handleInputChange}
                            placeholder="Enter Name"
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 duration-300"
                        />

                        <select id="locationFilter" name="locationFilter"
                        value={searchAgent.locationFilter}
                        onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 duration-300">
                            <option value="All Locations">All Locations</option>
                            <option value="France">France</option>
                            <option value="Canada">Canada</option>
                            <option value="U.K">U.K</option>
                            <option value="USA">USA</option>
                            <option value="Nigeria">Nigeria</option>
                            <option value="Ghana">Ghana</option>
                            <option value="South Africa">South Africa</option>
                            <option value="Australia">Australia</option>
                            <option value="Germany">Germany</option>
                            <option value="Italy">Italy</option>
                            <option value="Spain">Spain</option>
                            <option value="Brazil">Brazil</option>
                            <option value="India">India</option>
                            <option value="China">China</option>
                            <option value="Japan">Japan</option>
                            <option value="Mexico">Mexico</option>
                            <option value="Egypt">Egypt</option>
                            <option value="Turkey">Turkey</option>
                            <option value="Russia">Russia</option>
                            <option value="Argentina">Argentina</option>
                            <option value="Kenya">Kenya</option>
                            <option value="Morocco">Morocco</option>
                            <option value="Sweden">Sweden</option>
                            <option value="Norway">Norway</option>
                            <option value="Denmark">Denmark</option>
                            <option value="Netherlands">Netherlands</option>
                            <option value="Belgium">Belgium</option>
                            <option value="Switzerland">Switzerland</option>
                            <option value="Poland">Poland</option>
                            <option value="Portugal">Portugal</option>
                            <option value="Greece">Greece</option>
                            <option value="Saudi Arabia">Saudi Arabia</option>
                            <option value="UAE">UAE</option>
                            <option value="Qatar">Qatar</option>
                            <option value="South Korea">South Korea</option>
                            <option value="Singapore">Singapore</option>
                            <option value="New Zealand">New Zealand</option>
                            <option value="Malaysia">Malaysia</option>
                            <option value="Thailand">Thailand</option>
                            <option value="Indonesia">Indonesia</option>
                            <option value="Vietnam">Vietnam</option>
                            <option value="Philippines">Philippines</option>
                            <option value="Pakistan">Pakistan</option>
                            <option value="Bangladesh">Bangladesh</option>
                            <option value="Ukraine">Ukraine</option>
                            <option value="Romania">Romania</option>
                            <option value="Hungary">Hungary</option>
                            <option value="Czech Republic">Czech Republic</option>
                            <option value="Ireland">Ireland</option>
                            <option value="Finland">Finland</option>
                            <option value="Austria">Austria</option>
                            <option value="Chile">Chile</option>
                            <option value="Colombia">Colombia</option>
                            <option value="Peru">Peru</option>
                            <option value="Venezuela">Venezuela</option>
                            <option value="Israel">Israel</option>
                            <option value="Jordan">Jordan</option>
                            <option value="Lebanon">Lebanon</option>
                            <option value="Tunisia">Tunisia</option>
                            <option value="Algeria">Algeria</option>
                            <option value="Ethiopia">Ethiopia</option>
                            <option value="Uganda">Uganda</option>
                            <option value="Tanzania">Tanzania</option>
                            <option value="Zimbabwe">Zimbabwe</option>
                            <option value="Zambia">Zambia</option>
                            <option value="Cameroon">Cameroon</option>
                            <option value="Ivory Coast">Ivory Coast</option>
                            <option value="Senegal">Senegal</option>
                            <option value="Sudan">Sudan</option>
                            <option value="Angola">Angola</option>
                            <option value="Mozambique">Mozambique</option>
                        </select>

                        <select id="statusFilter" name="statusFilter"
                        value={searchAgent.statusFilter} 
                        onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 duration-300">
                        <option value="All Status">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Pending">Pending</option>
                        </select>

                        <select id="propertyFilter"name="propertyFilter"
                        value={searchAgent.propertyFilter}
                        onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 duration-300">
                        <option value="All Properties">All Properties</option>
                        <option value="10">10+ Properties</option>
                        <option value="20">20+ Properties</option>
                        </select>
                    </div>

                    <button type="submit" className="w-40 mx-auto bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium">Search Agent</button>
                </form>
            </div>

            <div className="flex flex-col gap-10">
                <h1 className="md:text-xl text-base text-gray-700 font-semibold">Our Agents</h1>

                <div className="lg:grid lg:grid-cols-4 md:grid md:grid-cols-2 flex flex-col gap-10">
                
                    {
                        agentCards.map((agentCard, index) => (
                            <AgentItem key={index} {...agentCard}/>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default AgentsPage;