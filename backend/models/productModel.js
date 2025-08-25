import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    longDescription: { 
      type: String, 
      default: "" 
    },
    productDetails: [{ 
      type: String 
    }],
    price: { 
      type: Number, 
      required: true 
    },
    originalPrice: { 
      type: Number 
    },
    image: { 
      type: Array, 
      required: true 
    },
    category: { 
      type: String, 
      required: true 
    },
    subCategory: { 
      type: String, 
      required: true 
    },
    sizes: { 
      type: Array, 
      required: true 
    },
    colors: [{ 
      type: String 
    }],
    fabric: { 
      type: String, 
      default: "" 
    },
    careInstructions: { 
      type: String, 
      default: "" 
    },
    sku: { 
      type: String, 
      unique: true,
      sparse: true
    },
    stockQuantity: { 
      type: Number, 
      default: 0 
    },
    bestseller: { 
      type: Boolean, 
      default: false 
    },
    date: { 
      type: Number, 
      required: true 
    }
  },
  {
    timestamps: true
  }
);

// Create index for better query performance
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ bestseller: 1 });
productSchema.index({ sku: 1 });

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;