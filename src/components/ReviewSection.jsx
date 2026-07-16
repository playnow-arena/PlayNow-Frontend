import React, { useState, useEffect } from 'react';
import { Star, Trash2, Edit } from 'lucide-react';

const ReviewSection = ({ venueId, user, onReviewAdded }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');

  useEffect(() => {
    fetchReviews();
  }, [venueId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/${venueId}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('playnow_token');
      const res = await fetch(`${API_BASE_URL}/api/reviews/${venueId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });
      if (!res.ok) throw new Error('Failed to submit review');
      setComment('');
      fetchReviews();
      onReviewAdded();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading reviews...</div>;

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-2xl font-bold">Reviews ({reviews.length})</h3>
      
      {user && (
        <form onSubmit={handleSubmit} className="bg-black/20 p-6 rounded-2xl border border-white/10">
          <h4 className="font-bold mb-3">Write a Review</h4>
          <div className="flex gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                onClick={() => setRating(star)}
                className={`cursor-pointer ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`}
              />
            ))}
          </div>
          <textarea 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white mb-3"
            placeholder="Share your experience..."
          />
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <button className="bg-primary text-black font-bold py-2 px-6 rounded-xl hover:bg-primary/90">
            Submit Review
          </button>
        </form>
      )}

      <div className="space-y-4">
        {reviews.map(review => (
          <div key={review._id} className="bg-black/20 p-4 rounded-xl border border-white/5">
            <div className="flex justify-between items-start mb-2">
              <p className="font-bold">{review.user.name}</p>
              <div className="flex items-center text-yellow-400">
                <Star size={14} className="fill-yellow-400" />
                <span className="ml-1 text-sm font-bold text-white">{review.rating}</span>
              </div>
            </div>
            <p className="text-gray-300 text-sm">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection;
