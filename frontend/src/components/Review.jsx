import { Star } from "lucide-react";
import { useState, useContext, useEffect } from "react";
import { ReviewContext } from "../context/ReviewContext";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

const Review = ({ productId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { addReview, getProductReviews, reviews, loading, error } = useContext(ReviewContext);
  const { token } = useContext(ShopContext);

  // Fetch reviews when component mounts
  useEffect(() => {
    if (productId) {
      getProductReviews(productId);
    }
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    
    if (!comment.trim()) {
      toast.error("Please write a review comment");
      return;
    }
    
    if (!token) {
      toast.error("Please login to submit a review");
      return;
    }

    setSubmitting(true);

    const reviewData = {
      productId,
      rating,
      comment
    };

    try {
      await addReview(reviewData, token);
      // Reset form after successful submission
      setRating(0);
      setComment("");
      setHover(0);
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setSubmitting(false);
    }
  };

  function handleClick(getCurrentIndex) {
    setRating(getCurrentIndex);
  }

  function handleMouseEnter(getCurrentIndex) {
    setHover(getCurrentIndex);
  }

  function handleMouseLeave() {
    setHover(rating);
  }

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <form className="w-full border text-gray-600 px-5 py-5" onSubmit={handleSubmit}>
        <h2 className="text-xl font-semibold py-1">Add a review</h2>
        <div className="flex items-center gap-3 py-3">
          <p>
            Your Rating <span>*</span>
          </p>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, index) => {
              index += 1;
              return (
                <Star
                  key={index}
                  className={`size-4 text-gray-400 cursor-pointer ${
                    index <= (hover || rating)
                      ? "fill-yellow-300 text-yellow-500"
                      : ""
                  }`}
                  onClick={() => handleClick(index)}
                  onMouseMove={() => handleMouseEnter(index)}
                  onMouseLeave={() => handleMouseLeave()}
                />
              );
            })}
          </div>
        </div>
        <label htmlFor="review-textarea" className="py-1">
          Your Review <span>*</span>
        </label>
        <textarea
          name="review-textarea"
          className="w-full h-32 border px-3 mt-1 py-3 mb-2 outline-gray-300 resize-none"
          id="review-textarea"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        ></textarea>
        <button
          className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </form>
      <div className="px-4 py-5">
        <h3 className="text-lg font-semibold py-3">Reviews ({reviews.length})</h3>
        {loading.get ? (
          <p>Loading reviews...</p>
        ) : error ? (
          <p className="text-red-500">Error loading reviews: {error}</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li key={review._id} className="border-b pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`size-4 ${
                          i < review.rating
                            ? "fill-yellow-300 text-yellow-500"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{review.userId?.name || "Anonymous"}</span>
                </div>
                <p className="text-gray-700 mb-1">{review.comment}</p>
                <p className="text-gray-500 text-sm">{formatDate(review.createdAt)}</p>
              </li>
            ))}
            {reviews.length === 0 && (
              <p className="text-gray-500">No reviews yet. Be the first to review!</p>
            )}
          </ul>
        )}
      </div>
    </>
  );
};

Review.propTypes = {
  productId: PropTypes.string.isRequired
};

export default Review;
