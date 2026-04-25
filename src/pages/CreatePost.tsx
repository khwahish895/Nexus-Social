import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../App";
import { motion } from "motion/react";
import { ImagePlus, Sparkles, Send, Loader2 } from "lucide-react";
import { generateCaption } from "../lib/gemini";

export default function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGenerateCaption = async () => {
    if (!imageUrl) {
      alert("Please provide an image description or URL first.");
      return;
    }
    setIsGenerating(true);
    const aiCaption = await generateCaption(imageUrl);
    setCaption(aiCaption || "");
    setIsGenerating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !imageUrl) return;

    setIsSubmitting(true);
    try {
      const postData = {
        authorId: user.uid,
        imageUrl,
        caption,
        likesCount: 0,
        commentsCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "posts"), postData);
      
      // Update post count in user profile
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        updatedAt: serverTimestamp()
      });

      navigate("/");
    } catch (error) {
      console.error("Failed to create post:", error);
      alert("Failed to post. Check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-xl mx-auto"
    >
      <h1 className="text-3xl font-black tracking-tighter mb-8 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent underline decoration-zinc-800 underline-offset-8">
        New Transmission
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Image Endpoint</label>
          <div className="relative group">
            <ImagePlus className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
              type="url" 
              required
              placeholder="https://..." 
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-zinc-100 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all placeholder:text-zinc-600"
            />
          </div>
          {imageUrl && (
            <div className="mt-4 rounded-2xl overflow-hidden border border-zinc-800 aspect-square bg-zinc-900 shadow-2xl relative">
               <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-purple-500/10 pointer-events-none" />
               <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between ml-1">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Context</label>
            <button
              type="button"
              onClick={handleGenerateCaption}
              disabled={isGenerating || !imageUrl}
              className="flex items-center gap-2 text-[10px] font-black text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition-colors uppercase tracking-widest"
            >
              <Sparkles size={14} />
              {isGenerating ? "Synthesizing..." : "AI Assist"}
            </button>
          </div>
          <textarea 
            rows={4}
            placeholder="Document your moment..." 
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-4 text-zinc-100 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all placeholder:text-zinc-600 resize-none h-40"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white font-black py-5 px-6 rounded-2xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/30 active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={20} />}
          {isSubmitting ? "TRANSMITTING..." : "PUBLISH TO NEXUS"}
        </button>
      </form>
    </motion.div>
  );
}
