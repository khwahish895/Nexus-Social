import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, collection, query, where, orderBy, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../App";
import { motion } from "motion/react";
import { Grid, Bookmark, List, Edit2, UserPlus, UserCheck, MessageSquare } from "lucide-react";

export default function Profile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      setLoading(true);
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) setProfile(userDoc.data());

      const postsQuery = query(
        collection(db, "posts"),
        where("authorId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const postsSnap = await getDocs(postsQuery);
      setPosts(postsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      if (currentUser && currentUser.uid !== userId) {
        const followDoc = await getDoc(doc(db, "followers", `${currentUser.uid}_${userId}`));
        setIsFollowing(followDoc.exists());
      }
      setLoading(false);
    };

    fetchProfile();
  }, [userId, currentUser]);

  const handleFollow = async () => {
    if (!currentUser || !userId || currentUser.uid === userId) return;

    const followId = `${currentUser.uid}_${userId}`;
    const followRef = doc(db, "followers", followId);

    if (isFollowing) {
      setIsFollowing(false);
      await deleteDoc(followRef);
    } else {
      setIsFollowing(true);
      await setDoc(followRef, {
        followerId: currentUser.uid,
        followingId: userId,
        createdAt: new Date().toISOString()
      });
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center animate-pulse text-zinc-500 font-black italic">FETCHING PROTOCOL...</div>;
  if (!profile) return <div className="text-center py-20">User not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4">
      <header className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 md:w-40 md:h-40 rounded-full bg-zinc-800 p-1 ring-4 ring-zinc-900 overflow-hidden"
        >
          {profile.photoURL ? (
            <img src={profile.photoURL} alt={profile.username} className="w-full h-full object-cover rounded-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-black text-zinc-700">
              {profile.username?.[0]?.toUpperCase()}
            </div>
          )}
        </motion.div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
            <h1 className="text-2xl font-black tracking-tight">{profile.username}</h1>
            <div className="flex gap-2">
              {currentUser?.uid === userId ? (
                <button className="bg-zinc-900 border border-zinc-800 text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-zinc-800">
                  <Edit2 size={14} /> Edit Profile
                </button>
              ) : (
                <>
                  <button 
                    onClick={handleFollow}
                    className={`text-xs font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all active:scale-95 ${isFollowing ? "bg-zinc-900 text-zinc-500 border border-zinc-800" : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"}`}
                  >
                    {isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                  <button className="bg-zinc-900 border border-zinc-800 text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-400">
                    <MessageSquare size={14} />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-center md:justify-start gap-10 mb-8 px-1">
            <div className="flex flex-col"><span className="font-bold text-lg text-white">{(posts.length || 0).toLocaleString()}</span><span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Posts</span></div>
            <div className="flex flex-col"><span className="font-bold text-lg text-white">{(profile.followersCount || 0).toLocaleString()}</span><span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Followers</span></div>
            <div className="flex flex-col"><span className="font-bold text-lg text-white">{(profile.followingCount || 0).toLocaleString()}</span><span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Following</span></div>
          </div>

          <div className="max-w-md">
            <p className="text-sm text-zinc-400 leading-relaxed font-medium italic">"{profile.bio}"</p>
          </div>
        </div>
      </header>

      <div className="border-t border-zinc-900 pt-2">
        <div className="flex justify-center gap-12 mb-8">
          <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-indigo-400 border-t-2 border-indigo-500 pt-4 -mt-[2px]">
            <Grid size={16} /> Posts
          </button>
          <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600 hover:text-zinc-300 transition-colors pt-4 -mt-[2px]">
            <Bookmark size={16} /> Saved
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1 md:gap-4">
          {posts.map((post) => (
            <Link 
              key={post.id} 
              to={`/post/${post.id}`} 
              className="aspect-square bg-zinc-900 relative group overflow-hidden rounded-lg md:rounded-2xl"
            >
              <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-4">
                 <div className="flex items-center gap-1 text-white font-bold"><Grid size={18} /> {post.likesCount}</div>
              </div>
            </Link>
          ))}
        </div>
        {posts.length === 0 && (
          <div className="text-center py-20 text-zinc-600 font-bold uppercase tracking-widest">No transmissions yet.</div>
        )}
      </div>
    </div>
  );
}
