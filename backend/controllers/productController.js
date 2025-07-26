import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"

// function for add product
const addProduct = async (req, res) => {
    try {

        const { name, description, price, category, subCategory, sizes, bestseller } = req.body

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url
            })
        )

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: JSON.parse(sizes),
            image: imagesUrl,
            date: Date.now()
        }

        console.log(productData);

        const product = new productModel(productData);
        await product.save()

        res.json({ success: true, message: "Product Added" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for list product
const listProducts = async (req, res) => {
    try {

        const products = await productModel.find({});
        res.json({ success: true, products })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for removing product
const removeProduct = async (req, res) => {
    try {

        await productModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Product Removed" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for single product info
const singleProduct = async (req, res) => {
    try {

        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({ success: true, product })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for update product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params; // product ID from URL
        const {
            name,
            description,
            price,
            category,
            subCategory,
            sizes,
            bestseller
        } = req.body;

        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Parse sizes if provided
        let parsedSizes = sizes ? JSON.parse(sizes) : product.sizes;

        // Existing images
        let updatedImages = [...product.image];

        // Upload new images if provided
        const uploadImage = async (imageFile) => {
            const result = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });
            return result.secure_url;
        };

        // Check each image field
        if (req.files.image1 && req.files.image1[0]) {
            updatedImages[0] = await uploadImage(req.files.image1[0]);
        }
        if (req.files.image2 && req.files.image2[0]) {
            updatedImages[1] = await uploadImage(req.files.image2[0]);
        }
        if (req.files.image3 && req.files.image3[0]) {
            updatedImages[2] = await uploadImage(req.files.image3[0]);
        }
        if (req.files.image4 && req.files.image4[0]) {
            updatedImages[3] = await uploadImage(req.files.image4[0]);
        }

        // Filter out any undefined/null slots (optional)
        updatedImages = updatedImages.filter(Boolean);

        // Update fields
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price ? Number(price) : product.price;
        product.category = category || product.category;
        product.subCategory = subCategory || product.subCategory;
        product.bestseller = bestseller === "true" ? true : bestseller === "false" ? false : product.bestseller;
        product.sizes = parsedSizes;
        product.image = updatedImages;

        await product.save();

        res.json({ success: true, message: "Product updated successfully", product });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};



export { listProducts, addProduct, removeProduct, singleProduct, updateProduct }