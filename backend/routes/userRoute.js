import express from 'express';
import { loginUser, registerUser, profile, adminLogin, favoriteProducts,getFavoriteProducts } from '../controllers/userController.js';
import authUser from '../middleware/auth.js'

const 
userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)
userRouter.post("/me/:id", profile);
userRouter.put("/favorites", authUser, favoriteProducts);
userRouter.get("/favorites", authUser, getFavoriteProducts);

export default userRouter;