import { Star } from "lucide-react";
import { useState } from "react";

const Review = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hover, setHover] = useState(0);

  function handleClick(getCurrentIndex) {
    setRating(getCurrentIndex);
  }

  function handleMouseEnter(getCurrentIndex) {
    setHover(getCurrentIndex);
  }

  function handleMouseLeave() {
    setHover(rating);
  }

  return (
    <>
      <form className="w-full border text-gray-600 px-5 py-5">
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
        >
          Submit
        </button>
      </form>
      <div className="px-4 py-5">
        <h3 className="text-lg font-semibold py-3">Reviews</h3>
        <ul className="">
            
        </ul>
      </div>
    </>
  );
};

export default Review;
