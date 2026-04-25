import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import PostCard from "../components/feed/PostCard";
import { motion } from "motion/react";
import { PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(20));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-zinc-900/50 aspect-[4/5] rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Stories Placeholder */}
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide no-scrollbar">
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <Link to="/create" className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center text-zinc-500 hover:border-indigo-500 hover:text-indigo-500 transition-all bg-zinc-900/40">
            <PlusCircle size={24} />
          </Link>
          <span className="text-[11px] text-zinc-400 font-medium">Your Story</span>
        </div>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
               <div className="w-full h-full rounded-full bg-black p-[2px]">
                 <div className="w-full h-full rounded-full bg-zinc-800 overflow-hidden">
                   <img src={`https://picsum.photos/seed/${i*20}/100/100`} alt="Avatar" className="w-full h-full object-cover" />
                 </div>
               </div>
            </div>
            <span className="text-[11px] text-zinc-400 font-medium">luna_{i}</span>
          </div>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 px-4">
          <h2 className="text-2xl font-black text-zinc-800 mb-2">The nexus is empty...</h2>
          <p className="text-zinc-600 mb-6">Be the first to share a moment with the community.</p>
          <Link 
            to="/create" 
            className="inline-block bg-zinc-900 border border-zinc-800 text-sm font-bold py-3 px-8 rounded-full hover:bg-zinc-800 transition-all"
          >
            Create First Post
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
