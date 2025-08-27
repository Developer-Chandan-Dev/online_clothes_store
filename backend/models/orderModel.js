import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        items: [{
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            size: String,
            color: String,
            price: {
                type: Number,
                required: true
            },
            name: String
        }],
        totalAmount: {
            type: Number,
            required: true
        },
        shippingAddress: {
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String, required: true },
            street: { type: String, required: true },
            apartment: String,
            city: { type: String, required: true },
            state: String,
            zipcode: { type: String, required: true },
            country: { type: String, required: true },
            saveAddress: { type: Boolean, default: false }
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'pending'
        },
        paymentMethod: {
            type: String,
            enum: ['cod', 'stripe', 'razorpay'],
            required: true
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending'
        },
        paymentId: String,
        orderType: {
            type: String,
            enum: ['cart', 'direct'],
            default: 'cart'
        },
        deliveryDate: Date,
        trackingNumber: String,
        notes: String,
        active: {
            type: Boolean,
            default: true
        }
    }, {    
    timestamps: true
});

// Apply pagination plugin
orderSchema.plugin(mongoosePaginate);

// Index for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ active: 1 });

const orderModel = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default orderModel;