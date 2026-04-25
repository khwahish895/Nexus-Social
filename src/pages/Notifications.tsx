import { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../App";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, UserPlus, BellOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "motion/react";

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("recipientId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const notifs = await Promise.all(snapshot.docs.map(async (d) => {
        const data = d.data();
        const senderDoc = await getDoc(doc(db, "users", data.senderId));
        return {
          id: d.id,
          ...data,
          sender: senderDoc.exists() ? senderDoc.data() : null
        };
      }));
      setNotifications(notifs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) return <div className="h-96 flex items-center justify-center animate-pulse text-zinc-500 font-black italic tracking-widest uppercase">SYNCING FREQUENCIES...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-black tracking-tighter mb-8 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent underline decoration-zinc-800 underline-offset-8">Notifications</h1>
      
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-zinc-800">
          <BellOff size={64} className="mb-4 opacity-20" />
          <p className="text-sm font-black uppercase tracking-widest">Silence in the nexus.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {notifications.map((n) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-3xl flex items-center gap-4 transition-colors hover:bg-zinc-900/40 border border-transparent hover:border-zinc-800 ${!n.isRead ? "bg-indigo-500/5 border-indigo-500/10" : ""}`}
              >
                <Link to={`/profile/${n.senderId}`} className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden ring-2 ring-black">
                    {n.sender?.photoURL ? (
                      <img src={n.sender.photoURL} alt={n.sender.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
                        {n.sender?.username?.[0]}
                      </div>
                    )}
                  </div>
                </Link>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-300">
                    <Link to={`/profile/${n.senderId}`} className="font-bold text-white hover:underline">{n.sender?.username || "Someone"}</Link>
                    <span> {n.type === 'like' ? 'liked your transmission' : n.type === 'comment' ? 'commented on your post' : 'followed you'}</span>
                  </p>
                  <span className="text-[10px] font-black uppercase text-zinc-600 tracking-widest mt-1 block">
                    {n.createdAt?.toDate ? formatDistanceToNow(n.createdAt.toDate()) + " ago" : "just now"}
                  </span>
                </div>

                {n.type === 'like' && <Heart size={20} className="text-pink-500" fill="currentColor" />}
                {n.type === 'comment' && <MessageCircle size={20} className="text-indigo-400" />}
                {n.type === 'follow' && <UserPlus size={20} className="text-indigo-400" />}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
