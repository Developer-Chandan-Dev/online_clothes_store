import validator from "validator";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import userModel from "../models/userModel.js";

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

// Route for user login
const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exists" })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {

            const token = createToken(user._id)
            res.json({ success: true, token, userData: { _id: user?._id, name: user?.name, email: user?.email } })

        }
        else {
            res.json({ success: false, message: 'Invalid credentials' })
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Route for user register
const registerUser = async (req, res) => {
    try {

        const { name, email, password } = req.body;

        // checking user already exists or not
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }

        // validating email format & strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })

        const user = await newUser.save()

        const token = createToken(user._id)

        res.json({ success: true, token, userData: { _id: user?._id, name: user?.name, email: user?.email } })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

const profile = async (req, res) => {
    try {
        console.log(req.params);
        const userId = req.params.id;

        const profile = await userModel.findById(userId).select("-password");

        if (!profile) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        res.status(200).json({ success: true, profile });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}
// Route for admin login
const adminLogin = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        if (user.role !== "admin") {
            return res.status(401).json({ message: false, message: "Admin only" })
        }
        console.log("User: ", user);
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = jwt.sign({ email: user.email, role: user.role, _id: user._id }, process.env.JWT_SECRET);
            res.status(200).json({ success: true, token })
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message })
    }
}

const userProfile = async (req, res) => {

}

// const favorite
const favoriteProducts = async (req, res) => {
    try {

        const { userId, productId } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({ message: "User ID and Product ID are required" })
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const index = user.favorites.indexOf(productId);
        if (index === -1) {
            user.favorites.push(productId); // Add to favorites
        } else {
            user.favorites.splice(index, 1); // Remove from favorites
        }

        await user.save();

        res.status(200).json({ success: true, message: `${index === -1 ? 'Added in Favorites' : 'Removed from Favorites'}`, favorites: user.favorites });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

const getFavoriteProducts = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }
        // console.log(user?.favorites);
        const favoriteProducts = await userModel.findById(userId).select("-password -cartData").populate("favorites")

        res.status(200).json({ success: true, favorites: favoriteProducts, favoriteIds: user?.favorites })
    } catch (error) {
        console.log(error);
    }
}

export { loginUser, registerUser, profile, adminLogin, favoriteProducts, getFavoriteProducts }