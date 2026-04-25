import { Link } from "react-router-dom";
import { Search, Bell } from "lucide-react";

export default function Navbar() {
  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 h-16 border-b border-zinc-800 bg-black/50 backdrop-blur-md z-40 px-4 md:px-8">
      <div className="flex h-full items-center justify-between max-w-4xl mx-auto">
        <Link to="/" className="md:hidden text-xl font-bold tracking-tighter bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">NEXUS</Link>
        <div className="hidden md:block relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input 
            type="text" 
            placeholder="Search Nexus" 
            className="w-full bg-zinc-900 border-none rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-zinc-600"
          />
        </div>
        <div className="flex items-center gap-4">
          <Link to="/notifications" className="p-2 text-zinc-400 hover:text-white md:hidden">
            <Bell size={24} />
          </Link>
        </div>
      </div>
    </header>
  );
}
