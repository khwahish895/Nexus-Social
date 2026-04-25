import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, createContext, useContext } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "./lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { connectSocket, disconnectSocket } from "./lib/socket";

// Pages
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import CreatePost from "./pages/CreatePost";
import Notifications from "./pages/Notifications";

// Components
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import BottomNav from "./components/layout/BottomNav";

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        setProfile(userDoc.exists() ? userDoc.data() : null);
        connectSocket(user.uid);
      } else {
        setProfile(null);
        disconnectSocket();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-white font-sans">
        <div className="text-xl font-medium tracking-tight animate-pulse">NEXUS</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      <Router>
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-orange-500/30">
          {user && (
            <>
              <Sidebar />
              <Navbar />
            </>
          )}
          <main className={cn("transition-all duration-300", user ? "md:pl-64 pt-16 pb-20 md:pb-0" : "")}>
            <div className="max-w-4xl mx-auto px-4 py-6">
              <Routes>
                <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
                <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
                <Route path="/explore" element={user ? <Explore /> : <Navigate to="/login" />} />
                <Route path="/notifications" element={user ? <Notifications /> : <Navigate to="/login" />} />
                <Route path="/create" element={user ? <CreatePost /> : <Navigate to="/login" />} />
                <Route path="/profile/:userId" element={user ? <Profile /> : <Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </main>
          {user && <BottomNav />}
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

// Utility to merge tailwind classes
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
