import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Link } from "react-router-dom";
import { Search, Grid, Play } from "lucide-react";

export default function Explore() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExplore = async () => {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50));
      const snap = await getDocs(q);
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetchExplore();
  }, []);

  return (
    <div>
      <div className="relative mb-8 md:hidden">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
        <input 
          type="text" 
          placeholder="Search creators, hashtags..." 
          className="w-full bg-zinc-900 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-1 focus:ring-orange-500 outline-none"
        />
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2 no-scrollbar">
         {['Art', 'Fashion', 'Gaming', 'Music', 'Tech', 'Nature', 'Travel'].map(tag => (
           <button key={tag} className="bg-zinc-900 border border-zinc-800 px-6 py-2 rounded-full text-xs font-bold whitespace-nowrap hover:bg-zinc-800 hover:border-zinc-700 transition-colors uppercase tracking-widest text-zinc-400">
             {tag}
           </button>
         ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-4">
        {loading ? (
          [1,2,3,4,5,6,7,8].map(i => <div key={i} className="aspect-square bg-zinc-900 animate-pulse rounded-2xl" />)
        ) : (
          posts.map((post, idx) => (
            <Link 
              key={post.id} 
              to={`/post/${post.id}`} 
              className={`aspect-square bg-zinc-900 relative group overflow-hidden rounded-xl md:rounded-2xl ${idx % 7 === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
            >
              <img src={post.imageUrl} alt="Explore" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity scale-110 group-hover:scale-100">
                 {idx % 3 === 0 ? <Play className="text-white fill-white" size={32} /> : <Grid className="text-white" size={32} />}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
