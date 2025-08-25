import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"

// function for add product
const addProduct = async (req, res) => {
    try {
        const { 
            name, 
            description, 
            longDescription,
            productDetails,
            price, 
            originalPrice,
            category, 
            subCategory, 
            sizes, 
            colors,
            fabric,
            careInstructions,
            sku,
            stockQuantity,
            bestseller 
        } = req.body

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

        // Parse JSON strings if needed
        const parsedSizes = sizes ? JSON.parse(sizes) : [];
        const parsedColors = colors ? JSON.parse(colors) : [];
        const parsedProductDetails = productDetails ? JSON.parse(productDetails) : [];

        const productData = {
            name,
            description,
            longDescription: longDescription || "",
            productDetails: parsedProductDetails,
            category,
            price: Number(price),
            originalPrice: originalPrice ? Number(originalPrice) : undefined,
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: parsedSizes,
            colors: parsedColors,
            fabric: fabric || "",
            careInstructions: careInstructions || "",
            sku: sku || undefined,
            stockQuantity: stockQuantity ? Number(stockQuantity) : 0,
            image: imagesUrl,
            date: Date.now()
        }

        console.log("Adding product:", productData);

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
            longDescription,
            productDetails,
            price,
            originalPrice,
            category,
            subCategory,
            sizes,
            colors,
            fabric,
            careInstructions,
            sku,
            stockQuantity,
            bestseller
        } = req.body;

        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Parse JSON strings if provided
        const parsedSizes = sizes ? JSON.parse(sizes) : product.sizes;
        const parsedColors = colors ? JSON.parse(colors) : product.colors;
        const parsedProductDetails = productDetails ? JSON.parse(productDetails) : product.productDetails;

        // Existing images
        let updatedImages = [...product.image];

        // Upload new images if provided
        const uploadImage = async (imageFile) => {
            const result = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });
            return result.secure_url;
        };

        // Check each image field and update if provided
        if (req.files && req.files.image1 && req.files.image1[0]) {
            updatedImages[0] = await uploadImage(req.files.image1[0]);
        }
        if (req.files && req.files.image2 && req.files.image2[0]) {
            updatedImages[1] = updatedImages[1] ? await uploadImage(req.files.image2[0]) : await uploadImage(req.files.image2[0]);
        }
        if (req.files && req.files.image3 && req.files.image3[0]) {
            updatedImages[2] = updatedImages[2] ? await uploadImage(req.files.image3[0]) : await uploadImage(req.files.image3[0]);
        }
        if (req.files && req.files.image4 && req.files.image4[0]) {
            updatedImages[3] = updatedImages[3] ? await uploadImage(req.files.image4[0]) : await uploadImage(req.files.image4[0]);
        }

        // Filter out any undefined/null slots
        updatedImages = updatedImages.filter(Boolean);

        // Update all fields
        product.name = name || product.name;
        product.description = description || product.description;
        product.longDescription = longDescription !== undefined ? longDescription : product.longDescription;
        product.productDetails = parsedProductDetails;
        product.price = price ? Number(price) : product.price;
        product.originalPrice = originalPrice !== undefined ? Number(originalPrice) : product.originalPrice;
        product.category = category || product.category;
        product.subCategory = subCategory || product.subCategory;
        product.bestseller = bestseller === "true" ? true : bestseller === "false" ? false : product.bestseller;
        product.sizes = parsedSizes;
        product.colors = parsedColors;
        product.fabric = fabric !== undefined ? fabric : product.fabric;
        product.careInstructions = careInstructions !== undefined ? careInstructions : product.careInstructions;
        product.sku = sku !== undefined ? sku : product.sku;
        product.stockQuantity = stockQuantity !== undefined ? Number(stockQuantity) : product.stockQuantity;
        product.image = updatedImages;

        await product.save();

        res.json({ success: true, message: "Product updated successfully", product });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export { listProducts, addProduct, removeProduct, singleProduct, updateProduct }