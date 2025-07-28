import { LayoutGrid, Contact, Users, HousePlus, MessageCircleMore } from "lucide-react";

export const AdminNavLinks = [
    {icon: LayoutGrid, label: "Dashboard", to: "/AdminDashboard"},
    {icon: Users, label: "Users", to: "User"},
    {icon: HousePlus, label: "Properties", to: "Properties"},
    {icon: Contact, label: "Agents", to: "Agent"},
    {icon: MessageCircleMore, label: "Inquiries", to: "Inquiries"}
]