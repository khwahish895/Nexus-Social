import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from "lucide-react";
import { doc, getDoc, updateDoc, increment, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../App";
import { motion, AnimatePresence } from "motion/react";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: any;
  key?: any;
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const [author, setAuthor] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showHeartAnim, setShowHeartAnim] = useState(false);

  useEffect(() => {
    const fetchAuthor = async () => {
      const userDoc = await getDoc(doc(db, "users", post.authorId));
      if (userDoc.exists()) setAuthor(userDoc.data());
    };

    const checkIfLiked = async () => {
      if (!user) return;
      const likeDoc = await getDoc(doc(db, `posts/${post.id}/likes`, user.uid));
      setIsLiked(likeDoc.exists());
    };

    fetchAuthor();
    checkIfLiked();
  }, [post.authorId, post.id, user]);

  const handleLike = async () => {
    if (!user) return;

    const postRef = doc(db, "posts", post.id);
    const likeRef = doc(db, `posts/${post.id}/likes`, user.uid);

    if (isLiked) {
      setIsLiked(false);
      setLikesCount((prev: number) => prev - 1);
      await deleteDoc(likeRef);
      await updateDoc(postRef, { likesCount: increment(-1) });
    } else {
      setIsLiked(true);
      setLikesCount((prev: number) => prev + 1);
      setShowHeartAnim(true);
      setTimeout(() => setShowHeartAnim(false), 800);
      await setDoc(likeRef, { userId: user.uid, createdAt: new Date().toISOString() });
      await updateDoc(postRef, { likesCount: increment(1) });
    }
  };

  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden mb-8 shadow-xl shadow-black/40"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 px-5">
        <Link to={`/profile/${post.authorId}`} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden ring-2 ring-zinc-800">
            {author?.photoURL ? (
              <img src={author.photoURL} alt={author.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs uppercase">
                {author?.username?.[0]}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm tracking-tight">{author?.username || "loading..."}</span>
            </div>
            <span className="text-[11px] text-zinc-500 font-medium">
              {post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate()) + " ago" : "just now"}
            </span>
          </div>
        </Link>
        <button className="p-2 text-zinc-500 hover:text-white transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Image */}
      <div className="relative aspect-square bg-zinc-800 relative group overflow-hidden" onDoubleClick={handleLike}>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 z-10 pointer-events-none" />
        <img 
          src={post.imageUrl} 
          alt="Post content" 
          className="w-full h-full object-cover select-none transition-transform duration-700 hover:scale-105" 
          draggable={false}
        />
        <AnimatePresence>
          {showHeartAnim && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <Heart fill="#6366f1" color="#6366f1" size={100} className="drop-shadow-[0_0_30px_rgba(99,102,241,0.6)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="p-4 px-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button 
              onClick={handleLike}
              className={`transition-all active:scale-125 flex items-center gap-1.5 font-medium ${isLiked ? "text-pink-500" : "text-zinc-400 hover:text-white"}`}
            >
              <Heart size={26} fill={isLiked ? "currentColor" : "none"} />
              <span className="text-sm">{likesCount.toLocaleString()}</span>
            </button>
            <button className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors">
              <MessageCircle size={26} />
              <span className="text-sm">{post.commentsCount}</span>
            </button>
            <button className="text-zinc-400 hover:text-white transition-colors">
              <Share2 size={26} />
            </button>
          </div>
          <button className="text-zinc-400 hover:text-white transition-colors">
            <Bookmark size={26} />
          </button>
        </div>

        {/* Caption */}
        <div className="text-sm leading-relaxed">
          <Link to={`/profile/${post.authorId}`} className="font-bold mr-2 hover:underline tracking-tight">{author?.username}</Link>
          <span className="text-zinc-300 whitespace-pre-wrap">{post.caption}</span>
        </div>

        {/* Comments Link */}
        {post.commentsCount > 0 && (
          <button className="text-sm text-zinc-500 font-medium hover:text-zinc-400 transition-colors">
            View all {post.commentsCount} comments
          </button>
        )}
      </div>
    </motion.article>
  );
}
