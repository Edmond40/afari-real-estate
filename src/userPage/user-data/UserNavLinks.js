import { BellIcon, CalendarCheck, Heart, History, Settings, UserCircle } from "lucide-react";

export const UserNavLinks = [
    { icon: UserCircle, label: "Profile", to: "/user-dashboard"},
    { icon: Heart, label: "Saved Properties", to: "saved-properties"},
    { icon: History, label: "Viewing History", to: "viewing-history"},
    { icon: CalendarCheck, label: "Appointments", to: "appointments"},
    { icon: BellIcon, label: "Notification", to: "notification"},
    { icon: Settings, label: "Settings", to: "settings"}
]