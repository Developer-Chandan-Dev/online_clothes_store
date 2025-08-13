import express from 'express'
const router = express.Router();
import {authUser} from "../middleware/auth.js";

import { addReview, getProductReviews, deleteReview, updateReview } from "../controllers/reviewController.js";

router.post("/", addReview);
// router.post("/", authUser, addReview);

router.get("/:productId", getProductReviews);

router.put("/reviews/:reviewId", authUser, updateReview);

router.delete("/:id", authUser, deleteReview);

export default router;