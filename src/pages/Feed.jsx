import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Image as ImageIcon, Send, UserCheck } from 'lucide-react';
import { mockFeedPosts, mockHostedMatches } from '../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';

const Feed = () => {
  const [matches, setMatches] = useState([]);

useEffect(() => {
  const fetchMatches = async () => {
    try {
      const res = await fetch('https://playnow-backend-khtk.onrender.com/api/matches');
      const data = await res.json();

      setMatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching matches:', err);
    }
  };

  fetchMatches();
}, []);
  // Add interactive state to the mock posts
  const [posts, setPosts] = useState(() => 
    mockFeedPosts.map(post => ({
      ...post,
      isLiked: false,
      isFollowed: false,
      showComments: false,
      commentsList: []
    }))
  );
  
  const [newPostContent, setNewPostContent] = useState('');
  const [commentInputs, setCommentInputs] = useState({});
  const [isMatchJoined, setIsMatchJoined] = useState(false);

  const handlePost = (e) => {
    e.preventDefault();
    if (newPostContent.trim()) {
      const newPost = {
        id: `p${Date.now()}`,
        user: 'You',
        handle: '@your_handle',
        avatar: '',
        content: newPostContent,
        image: null,
        likes: 0,
        comments: 0,
        time: 'Just now',
        isLiked: false,
        isFollowed: true,
        showComments: false,
        commentsList: []
      };
      setPosts([newPost, ...posts]);
      setNewPostContent('');
    }
  };

  const toggleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const toggleFollow = (handle) => {
    setPosts(posts.map(post => {
      if (post.handle === handle) {
        return { ...post, isFollowed: !post.isFollowed };
      }
      return post;
    }));
  };

  const toggleComments = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, showComments: !post.showComments };
      }
      return post;
    }));
  };

  const handleCommentSubmit = (postId, e) => {
    e.preventDefault();
    const text = commentInputs[postId];
    if (text?.trim()) {
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments + 1,
            commentsList: [...post.commentsList, { id: Date.now(), user: 'You', text: text.trim() }]
          };
        }
        return post;
      }));
      setCommentInputs({ ...commentInputs, [postId]: '' });
    }
  };

  const handleShare = () => {
    // Simple mock alert for sharing
    alert('Post link copied to clipboard!');
  };

  return (
    <div className="pt-24 pb-24 px-4 max-w-3xl mx-auto min-h-screen flex gap-6">
      
      {/* Main Feed Column */}
      <div className="flex-1 space-y-6">
        
        {/* Create Post */}
        <div className="bg-[#151b2b] p-4 rounded-2xl border border-gray-800">
          <form onSubmit={handlePost}>
            <div className="flex gap-4 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-energetic border border-[#39FF14] flex items-center justify-center font-bold flex-shrink-0">
                Y
              </div>
              <textarea 
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Share your sports moments..." 
                className="w-full bg-transparent border-none focus:outline-none text-white resize-none h-20 placeholder-gray-500"
              />
            </div>
            <div className="flex justify-between items-center border-t border-gray-800 pt-3">
              <button type="button" className="text-[#39FF14] hover:bg-[#39FF14]/10 p-2 rounded-full transition flex items-center gap-2 text-sm font-medium">
                <ImageIcon size={18} /> Add Media
              </button>
              <button type="submit" disabled={!newPostContent.trim()} className="bg-[#39FF14] text-black px-6 py-2 rounded-xl font-bold hover:bg-[#32E612] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center shadow-[0_0_15px_rgba(57,255,20,0.2)]">
                <Send size={16} className="mr-2" /> Post
              </button>
            </div>
          </form>
        </div>

        {/* Feed Posts */}
        {posts.map((post, index) => (
          <motion.div 
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-[#151b2b] rounded-2xl border border-gray-800 overflow-hidden"
          >
            <div className="p-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                {post.avatar ? (
                  <img src={post.avatar} alt={post.user} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold">
                    {post.user.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-white leading-tight">{post.user}</h3>
                  <div className="flex items-center text-xs text-gray-500">
                    <span>{post.handle}</span>
                    <span className="mx-1">•</span>
                    <span>{post.time}</span>
                  </div>
                </div>
              </div>
              
              {post.user !== 'You' && (
                <button 
                  onClick={() => toggleFollow(post.handle)}
                  className={`text-sm font-bold px-3 py-1 rounded-full transition flex items-center gap-1 ${
                    post.isFollowed 
                      ? 'bg-gray-800 text-white hover:bg-gray-700' 
                      : 'text-[#39FF14] bg-[#39FF14]/10 hover:bg-[#39FF14]/20'
                  }`}
                >
                  {post.isFollowed ? <><UserCheck size={14} /> Following</> : 'Follow'}
                </button>
              )}
            </div>
            
            <div className="px-4 pb-3">
              <p className="text-gray-200">{post.content}</p>
            </div>

            {post.image && (
              <div className="w-full h-80 bg-black">
                <img src={post.image} alt="Post media" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="px-4 py-3 border-t border-gray-800 flex justify-between text-gray-400">
              <button 
                onClick={() => toggleLike(post.id)}
                className={`flex items-center gap-2 transition ${post.isLiked ? 'text-[#39FF14]' : 'hover:text-[#39FF14]'}`}
              >
                <Heart size={20} className={post.isLiked ? 'fill-[#39FF14]' : ''} /> {post.likes}
              </button>
              <button 
                onClick={() => toggleComments(post.id)}
                className={`flex items-center gap-2 transition ${post.showComments ? 'text-[#39FF14]' : 'hover:text-[#39FF14]'}`}
              >
                <MessageCircle size={20} /> {post.comments}
              </button>
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 hover:text-[#39FF14] transition"
              >
                <Share2 size={20} /> Share
              </button>
            </div>

            {/* Comments Section */}
            <AnimatePresence>
              {post.showComments && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#0a0f1c] border-t border-gray-800 overflow-hidden"
                >
                  <div className="p-4 space-y-4 max-h-60 overflow-y-auto">
                    {post.commentsList.map(comment => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {comment.user.charAt(0)}
                        </div>
                        <div className="bg-[#151b2b] p-3 rounded-2xl rounded-tl-none border border-gray-800 text-sm">
                          <span className="font-bold block mb-1">{comment.user}</span>
                          <span className="text-gray-300">{comment.text}</span>
                        </div>
                      </div>
                    ))}
                    {post.commentsList.length === 0 && (
                      <p className="text-center text-gray-500 text-sm py-2">No comments yet. Be the first to comment!</p>
                    )}
                  </div>
                  
                  <div className="p-4 border-t border-gray-800 bg-[#151b2b]">
                    <form onSubmit={(e) => handleCommentSubmit(post.id, e)} className="flex gap-2">
                      <input 
                        type="text" 
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs({...commentInputs, [post.id]: e.target.value})}
                        placeholder="Write a comment..."
                        className="flex-1 bg-[#0a0f1c] border border-gray-800 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-[#39FF14]"
                      />
                      <button 
                        type="submit"
                        disabled={!commentInputs[post.id]?.trim()}
                        className="bg-[#39FF14] text-black w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50 transition"
                      >
                        <Send size={16} />
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

{matches.map((match) => (
  <div
    key={match._id}
    className="bg-gradient-to-r from-[#151b2b] to-[#1a233a] rounded-2xl border border-[#39FF14]/30 overflow-hidden relative p-5"
  >
    <div className="absolute top-0 right-0 bg-[#39FF14] text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
      Looking for Players
    </div>

    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold">
        {match.host?.name?.charAt(0) || 'P'}
      </div>

      <div>
        <h3 className="font-bold text-white">
          {match.host?.name}
        </h3>

        <div className="text-xs text-gray-500">
          Hosted a Match • {match.sport}
        </div>
      </div>
    </div>

    <div className="bg-[#0a0f1c] p-4 rounded-xl border border-gray-800 mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-lg">
          {match.venue}
        </span>

        <span className="text-[#39FF14] font-bold">
          ₹{Math.floor(match.totalAmount / match.totalPlayers)}
        </span>
      </div>

      <div className="text-sm text-gray-400">
        {match.date} at {match.time}
      </div>

      <div className="mt-3 flex justify-between items-center">
        <span className="text-xs text-[#39FF14] bg-[#39FF14]/10 px-2 py-1 rounded">
          {match.totalPlayers - match.joinedPlayers.length} more needed
        </span>
      </div>
    </div>

    <button
  onClick={async () => {
    try {
      const user = JSON.parse(localStorage.getItem('playnow_user'));

      const res = await fetch(
        `https://playnow-backend-khtk.onrender.com/api/matches/${match._id}/join`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert('Joined Match Successfully 🔥');

      window.location.reload();

    } catch (err) {
      console.error(err);
      alert('Error joining match');
    }
  }}
  className="w-full bg-white text-black hover:bg-gray-200 font-bold py-2 rounded-xl transition"
>
  Join Match
</button>
  </div>
))}

        {/* Hosted Match appearing in Feed */}
        <div className="bg-gradient-to-r from-[#151b2b] to-[#1a233a] rounded-2xl border border-[#39FF14]/30 overflow-hidden relative">
          <div className="absolute top-0 right-0 bg-[#39FF14] text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
            Looking for Players
          </div>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold">
                {mockHostedMatches[0].hostName.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-white leading-tight">{mockHostedMatches[0].hostName}</h3>
                <div className="text-xs text-gray-500">Hosted a Match • {mockHostedMatches[0].sport}</div>
              </div>
            </div>
            <div className="bg-[#0a0f1c] p-4 rounded-xl border border-gray-800 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-lg">{mockHostedMatches[0].venue}</span>
                <span className="text-[#39FF14] font-bold">₹{mockHostedMatches[0].pricePerPlayer}</span>
              </div>
              <div className="text-sm text-gray-400">
                {mockHostedMatches[0].date} at {mockHostedMatches[0].time}
              </div>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-xs text-[#39FF14] bg-[#39FF14]/10 px-2 py-1 rounded">
                  {isMatchJoined ? mockHostedMatches[0].playersNeeded - 1 : mockHostedMatches[0].playersNeeded} more needed
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsMatchJoined(!isMatchJoined)}
              className={`w-full font-bold py-2 rounded-xl transition ${
                isMatchJoined 
                  ? 'bg-[#39FF14] text-black shadow-[0_0_15px_rgba(57,255,20,0.4)]' 
                  : 'bg-white text-black hover:bg-gray-200'
              }`}
            >
              {isMatchJoined ? 'Joined!' : 'Join Match'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Feed;
