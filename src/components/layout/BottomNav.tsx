import { Link, useLocation } from "react-router-dom";
import { Home, Search, PlusSquare, Bell, User } from "lucide-react";
import { useAuth } from "../../App";

export default function BottomNav() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const navItems = [
    { path: "/", icon: Home },
    { path: "/explore", icon: Search },
    { path: "/create", icon: PlusSquare },
    { path: "/notifications", icon: Bell },
    { path: `/profile/${user.uid}`, icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 border-t border-zinc-800 bg-black flex items-center justify-around px-2 md:hidden z-50">
      {navItems.map((item) => (
        <Link 
          key={item.path} 
          to={item.path} 
          className={`p-3 rounded-xl transition-all ${location.pathname === item.path ? "text-indigo-400 bg-indigo-500/10" : "text-zinc-500 hover:text-zinc-300"}`}
        >
          <item.icon size={26} />
        </Link>
      ))}
    </nav>
  );
}
