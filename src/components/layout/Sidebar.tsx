import { Link } from "react-router-dom";
import { Bell, Search, PlusSquare, User, Home, Hash, LogOut } from "lucide-react";
import { auth } from "../../lib/firebase";
import { useAuth } from "../../App";

export default function Sidebar() {
  const { user } = useAuth();
  
  if (!user) return null;

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Explore", path: "/explore", icon: Search },
    { name: "Notifications", path: "/notifications", icon: Bell },
    { name: "Create", path: "/create", icon: PlusSquare },
    { name: "Profile", path: `/profile/${user.uid}`, icon: User },
  ];

  return (
    <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-zinc-800 bg-black p-6 md:flex flex-col z-50 shrink-0">
      <div className="mb-10 px-2">
        <Link to="/" className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">NEXUS</Link>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className="flex items-center gap-4 rounded-xl px-3 py-3 text-zinc-400 transition-all hover:bg-zinc-900/50 hover:text-white group"
          >
            <item.icon size={24} className="group-hover:scale-110 transition-transform" />
            <span className="font-semibold">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-zinc-900">
        <button
          onClick={() => auth.signOut()}
          className="w-full flex items-center gap-4 rounded-xl px-3 py-3 text-zinc-500 transition-all hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={24} />
          <span className="font-semibold">Logout</span>
        </button>
      </div>
    </aside>
  );
}
