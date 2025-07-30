import { LayoutGrid, Contact, Users, HousePlus, MessageCircleMore } from "lucide-react";

export const AdminNavLinks = [
    {icon: LayoutGrid, label: "Dashboard", to: "/admin"},
    {icon: Users, label: "Users", to: "users"},
    {icon: HousePlus, label: "Properties", to: "properties"},
    {icon: Contact, label: "Agents", to: "agents"},
    {icon: MessageCircleMore, label: "Inquiries", to: "inquiries"}
]