import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { motion } from "motion/react";
import { Chrome } from "lucide-react";

export default function Login() {
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        // Create initial user profile
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          username: user.email?.split("@")[0] || `user_${Math.floor(Math.random() * 1000)}`,
          email: user.email,
          photoURL: user.photoURL,
          bio: "Welcome to my nexus!",
          followersCount: 0,
          followingCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-100px)] flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        <span className="text-6xl font-black tracking-tighter bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4 block underline decoration-indigo-500/30">NEXUS</span>
        <h1 className="text-xl font-medium text-zinc-400 mb-12 tracking-tight">The social media for creators.</h1>
        
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-4 bg-[#f2f2f2] text-black font-bold py-4 px-6 rounded-2xl hover:bg-white transition-all shadow-xl shadow-white/5 active:scale-95"
        >
          <Chrome size={22} className="text-indigo-600" />
          Continue with Google
        </button>
        
        <p className="mt-8 text-sm text-zinc-500 max-w-[280px] mx-auto">
          By joining, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
