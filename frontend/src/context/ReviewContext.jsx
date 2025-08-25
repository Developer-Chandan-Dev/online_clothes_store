/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const ReviewContext = createContext();

const ReviewContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState({
    add: false,
    get: false,
    update: false,
    delete: false
  });
  const [error, setError] = useState(null);

  // Add a new review
  const addReview = async (reviewData, token) => {
    setLoading(prev => ({ ...prev, add: true }));
    setError(null);
    
    try {
      const response = await axios.post(
        `${backendUrl}/api/review`,
        reviewData,
        { headers: { token } }
      );
      
      if (response.data.success) {
        toast.success("Review added successfully!");
        // Add the new review to the reviews array
        setReviews(prevReviews => [response.data.data, ...prevReviews]);
        return response.data;
      } else {
        toast.error(response.data.message || "Failed to add review");
        setError(response.data.message || "Failed to add review");
      }
    } catch (error) {
      console.log(error);
      if (error.response) {
        // Server responded with error status
        toast.error(error.response.data.message || "Error adding review");
        setError(error.response.data.message || "Error adding review");
      } else if (error.request) {
        // Network error
        toast.error("Network error. Please check your connection.");
        setError("Network error. Please check your connection.");
      } else {
        // Other error
        toast.error("An unexpected error occurred.");
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(prev => ({ ...prev, add: false }));
    }
  };

  // Get all reviews for a product
  const getProductReviews = async (productId) => {
    setLoading(prev => ({ ...prev, get: true }));
    setError(null);
    
    try {
      console.log("Product Id", productId);
      const response = await axios.get(`${backendUrl}/api/review/${productId}`);
      
      if (response.data.success) {
        setReviews(response.data.data);
        return response.data.data;
      } else {
        toast.error(response.data.message || "Failed to fetch reviews");
        setError(response.data.message || "Failed to fetch reviews");
        setReviews([]);
      }
    } catch (error) {
      console.log(error);
      if (error.response) {
        // Server responded with error status
        toast.error(error.response.data.message || "Error fetching reviews");
        setError(error.response.data.message || "Error fetching reviews");
      } else if (error.request) {
        // Network error
        toast.error("Network error. Please check your connection.");
        setError("Network error. Please check your connection.");
      } else {
        // Other error
        toast.error("An unexpected error occurred.");
        setError("An unexpected error occurred.");
      }
      setReviews([]);
    } finally {
      setLoading(prev => ({ ...prev, get: false }));
    }
  };

  // Update an existing review
  const updateReview = async (reviewId, reviewData, token) => {
    setLoading(prev => ({ ...prev, update: true }));
    setError(null);
    
    try {
      const response = await axios.put(
        `${backendUrl}/api/review/reviews/${reviewId}`,
        reviewData,
        { headers: { token } }
      );
      
      if (response.data.success) {
        toast.success("Review updated successfully!");
        // Update the review in the reviews array
        setReviews(prevReviews => 
          prevReviews.map(review => 
            review._id === reviewId ? response.data.data : review
          )
        );
        return response.data;
      } else {
        toast.error(response.data.message || "Failed to update review");
        setError(response.data.message || "Failed to update review");
      }
    } catch (error) {
      console.log(error);
      if (error.response) {
        // Server responded with error status
        toast.error(error.response.data.message || "Error updating review");
        setError(error.response.data.message || "Error updating review");
      } else if (error.request) {
        // Network error
        toast.error("Network error. Please check your connection.");
        setError("Network error. Please check your connection.");
      } else {
        // Other error
        toast.error("An unexpected error occurred.");
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  };

  // Delete a review
  const deleteReview = async (reviewId, token) => {
    setLoading(prev => ({ ...prev, delete: true }));
    setError(null);
    
    try {
      const response = await axios.delete(
        `${backendUrl}/api/review/${reviewId}`,
        { headers: { token } }
      );
      
      if (response.data.success) {
        toast.success("Review deleted successfully!");
        // Remove the review from the reviews array
        setReviews(prevReviews => 
          prevReviews.filter(review => review._id !== reviewId)
        );
        return response.data;
      } else {
        toast.error(response.data.message || "Failed to delete review");
        setError(response.data.message || "Failed to delete review");
      }
    } catch (error) {
      console.log(error);
      if (error.response) {
        // Server responded with error status
        toast.error(error.response.data.message || "Error deleting review");
        setError(error.response.data.message || "Error deleting review");
      } else if (error.request) {
        // Network error
        toast.error("Network error. Please check your connection.");
        setError("Network error. Please check your connection.");
      } else {
        // Other error
        toast.error("An unexpected error occurred.");
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const value = {
    reviews,
    loading,
    error,
    addReview,
    getProductReviews,
    updateReview,
    deleteReview,
    setReviews
  };

  return (
    <ReviewContext.Provider value={value}>
      {props.children}
    </ReviewContext.Provider>
  );
};

export default ReviewContextProvider;