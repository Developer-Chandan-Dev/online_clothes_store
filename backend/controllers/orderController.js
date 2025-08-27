import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import Stripe from 'stripe'
import razorpay from 'razorpay'
import mongoosePaginate from 'mongoose-paginate-v2';

// global variables
const currency = 'inr'
const deliveryCharge = 50

// gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// Create direct order (for Buy Now functionality)
const createDirectOrder = async (req, res) => {
    try {
        const { productId, quantity, size, color, shippingAddress, paymentMethod } = req.body
        const userId = req.user.id

        // Get product details
        const product = await productModel.findById(productId)
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" })
        }

        // Check stock availability
        if (product.stockQuantity < quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stockQuantity} items available in stock`
            })
        }

        // Calculate total price
        const totalPrice = product.price * quantity

        // Create order
        const order = new orderModel({
            user: userId,
            items: [{
                product: productId,
                quantity,
                size,
                color,
                price: product.price,
                name: product.name
            }],
            totalAmount: totalPrice,
            shippingAddress,
            paymentMethod,
            orderType: 'direct',
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed'
        })

        await order.save()

        // Update product stock
        product.stockQuantity -= quantity
        await product.save()

        res.json({
            success: true,
            message: "Order placed successfully",
            order
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Placing orders using COD Method
const placeOrder = async (req, res) => {
    try {
        const { shippingAddress, items, totalAmount, paymentMethod } = req.body;
        const user = req.user; // Assuming you have user from auth middleware
        console.log("User: ", user, 23);
        const orderData = {
            user: user.id,
            items: items.map(item => ({
                product: item.product,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                price: item.price,
                name: item.name
            })),
            totalAmount,
            shippingAddress: {
                firstName: shippingAddress.firstName,
                lastName: shippingAddress.lastName,
                email: shippingAddress.email,
                phone: shippingAddress.phone,
                street: shippingAddress.street,
                apartment: shippingAddress.apartment,
                city: shippingAddress.city,
                state: shippingAddress.state,
                zipcode: shippingAddress.zipcode,
                country: shippingAddress.country,
                saveAddress: shippingAddress.saveAddress
            },
            paymentMethod: paymentMethod.toLowerCase(),
            paymentStatus: paymentMethod.toLowerCase() === 'cod' ? 'pending' : 'completed',
            status: 'pending',
            orderType: items.length > 1 ? 'cart' : 'direct'
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        // Clear user's cart
        if (user.cartData) {
            await userModel.findByIdAndUpdate(user.id, { cartData: {} })
        }

        res.json({
            success: true,
            message: "Order Placed Successfully",
            order: newOrder
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Placing orders using Stripe Method
const placeOrderStripe = async (req, res) => {
    try {
        const { shippingAddress, items, totalAmount } = req.body;
        const user = req.user;
        const { origin } = req.headers;

        // Create order with pending payment
        const orderData = {
            user: user.id,
            items: items.map(item => ({
                product: item.product,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                price: item.price,
                name: item.name
            })),
            totalAmount,
            shippingAddress: {
                firstName: shippingAddress.firstName,
                lastName: shippingAddress.lastName,
                email: shippingAddress.email,
                phone: shippingAddress.phone,
                street: shippingAddress.street,
                apartment: shippingAddress.apartment,
                city: shippingAddress.city,
                state: shippingAddress.state,
                zipcode: shippingAddress.zipcode,
                country: shippingAddress.country,
                saveAddress: shippingAddress.saveAddress
            },
            paymentMethod: 'stripe',
            paymentStatus: 'pending',
            status: 'pending',
            orderType: items.length > 1 ? 'cart' : 'direct'
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        // Create Stripe line items
        const line_items = items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name,
                    metadata: {
                        productId: item.product.toString()
                    }
                },
                unit_amount: Math.round(item.price * 100)
            },
            quantity: item.quantity
        }))

        // Add delivery charge if applicable
        if (deliveryCharge > 0) {
            line_items.push({
                price_data: {
                    currency: currency,
                    product_data: {
                        name: 'Delivery Charges'
                    },
                    unit_amount: deliveryCharge * 100
                },
                quantity: 1
            })
        }

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
            metadata: {
                orderId: newOrder._id.toString(),
                userId: user.id.toString()
            }
        })

        res.json({
            success: true,
            session_url: session.url,
            orderId: newOrder._id
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Verify Stripe 
const verifyStripe = async (req, res) => {
    try {
        const { orderId, success } = req.body
        const user = req.user;

        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, {
                paymentStatus: 'completed',
                status: 'confirmed'
            });

            // Clear user's cart
            if (user.cartData) {
                await userModel.findByIdAndUpdate(user.id, { cartData: {} })
            }

            res.json({ success: true, message: "Payment Successful" });
        } else {
            await orderModel.findByIdAndUpdate(orderId, {
                paymentStatus: 'failed',
                status: 'cancelled'
            });
            res.json({ success: false, message: "Payment Failed" })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Placing orders using Razorpay Method
const placeOrderRazorpay = async (req, res) => {
    try {
        const { shippingAddress, items, totalAmount } = req.body;
        const user = req.user;

        const orderData = {
            user: user.id,
            items: items.map(item => ({
                product: item.product,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                price: item.price,
                name: item.name
            })),
            totalAmount,
            shippingAddress: {
                firstName: shippingAddress.firstName,
                lastName: shippingAddress.lastName,
                email: shippingAddress.email,
                phone: shippingAddress.phone,
                street: shippingAddress.street,
                apartment: shippingAddress.apartment,
                city: shippingAddress.city,
                state: shippingAddress.state,
                zipcode: shippingAddress.zipcode,
                country: shippingAddress.country,
                saveAddress: shippingAddress.saveAddress
            },
            paymentMethod: 'razorpay',
            paymentStatus: 'pending',
            status: 'pending',
            orderType: items.length > 1 ? 'cart' : 'direct'
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        const options = {
            amount: Math.round(totalAmount * 100),
            currency: currency,
            receipt: newOrder._id.toString(),
            notes: {
                orderId: newOrder._id.toString(),
                userId: user.id.toString()
            }
        }

        const order = await razorpayInstance.orders.create(options)

        res.json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt
            }
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const user = req.user;

        // Verify payment signature
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Invalid signature' });
        }

        // Fetch order details from Razorpay
        const payment = await razorpayInstance.payments.fetch(razorpay_payment_id);

        if (payment.status === 'captured') {
            await orderModel.findByIdAndUpdate(payment.notes.orderId, {
                paymentStatus: 'completed',
                status: 'confirmed',
                paymentId: razorpay_payment_id
            });

            // Clear user's cart
            if (user.cartData) {
                await userModel.findByIdAndUpdate(user.id, { cartData: {} })
            }

            res.json({ success: true, message: "Payment Successful" });
        } else {
            await orderModel.findByIdAndUpdate(payment.notes.orderId, {
                paymentStatus: 'failed',
                status: 'cancelled'
            });
            res.json({ success: false, message: 'Payment Failed' });
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// All Orders data for Admin Panel
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({})
            .populate('user', 'name email')
            .populate('items.product', 'name images')
            .sort({ createdAt: -1 });

        res.json({ success: true, orders })

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// User Order Data For Frontend
const userOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, page = 1, limit = 10 } = req.query;
        
        let query = { 
            user: userId,
            active: true // Only show active orders
        };
        
        // Filter by status if provided
        if (status && status !== 'all') {
            query.status = status;
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 },
            populate: {
                path: 'items.product',
                select: 'name image price' // Only select necessary fields for performance
            }
        };
        console.log(query, options, 412);



        // Use paginate method from mongoose-paginate-v2
        const orders = await orderModel.paginate(query, options);

        console.log("Orders", orders);
        res.json({ 
            success: true, 
            orders: orders.docs,
            totalPages: orders.totalPages,
            currentPage: orders.page,
            totalOrders: orders.totalDocs
        });

    } catch (error) {
        console.log("Error in userOrders controller:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Internal server error" 
        });
    }
};

// update order status from Admin Panel
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body

        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        ).populate('user', 'name email');

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({
            success: true,
            message: 'Status Updated',
            order: updatedOrder
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await orderModel.findByIdAndDelete(id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.json({ success: true, message: "Order removed successfully" })

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message })
    }
}

// Cancel order
const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        // Find the order
        const order = await orderModel.findOne({ _id: orderId, user: userId });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Check if order can be cancelled (only pending, confirmed, or processing orders can be cancelled)
        if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: `Order cannot be cancelled as it is already ${order.status}`
            });
        }

        // Restore product stock for each item in the order
        for (const item of order.items) {
            const product = await productModel.findById(item.product);
            if (product) {
                product.stockQuantity += item.quantity;
                await product.save();
            }
        }

        // Update order status to cancelled
        order.status = 'cancelled';

        // If payment was completed, mark it as refunded
        if (order.paymentStatus === 'completed') {
            order.paymentStatus = 'refunded';
        }

        await order.save();

        res.json({
            success: true,
            message: "Order cancelled successfully",
            order
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Resume a cancelled order
const resumeOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        // Find the order
        const order = await orderModel.findOne({ _id: orderId, user: userId });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Check if order can be resumed (only cancelled orders can be resumed)
        if (order.status !== 'cancelled') {
            return res.status(400).json({
                success: false,
                message: `Order cannot be resumed as it is ${order.status}`
            });
        }

        // Check if products are still available
        for (const item of order.items) {
            const product = await productModel.findById(item.product);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product ${item.name} is no longer available`
                });
            }

            if (product.stockQuantity < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.stockQuantity} items available for ${item.name}`
                });
            }
        }

        // Deduct product stock again
        for (const item of order.items) {
            const product = await productModel.findById(item.product);
            product.stockQuantity -= item.quantity;
            await product.save();
        }

        // Update order status to pending and reset payment status if needed
        order.status = 'pending';

        // If payment was refunded, set it back to pending for re-payment
        if (order.paymentStatus === 'refunded') {
            order.paymentStatus = 'pending';
        }

        await order.save();

        res.json({
            success: true,
            message: "Order resumed successfully",
            order
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Reorder a previous order
const reorder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        // Find the original order
        const originalOrder = await orderModel.findOne({ _id: orderId, user: userId });
        if (!originalOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Check product availability for reorder
        for (const item of originalOrder.items) {
            const product = await productModel.findById(item.product);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product ${item.name} is no longer available`
                });
            }

            if (product.stockQuantity < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.stockQuantity} items available for ${item.name}`
                });
            }
        }

        // Create new order with same items but current prices
        const itemsWithCurrentPrices = await Promise.all(
            originalOrder.items.map(async (item) => {
                const product = await productModel.findById(item.product);
                return {
                    product: item.product,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color,
                    price: product.price, // Use current price, not the old price
                    name: item.name
                };
            })
        );

        // Calculate new total amount
        const totalAmount = itemsWithCurrentPrices.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);

        const newOrder = new orderModel({
            user: userId,
            items: itemsWithCurrentPrices,
            totalAmount,
            shippingAddress: originalOrder.shippingAddress,
            paymentMethod: originalOrder.paymentMethod,
            orderType: 'direct',
            paymentStatus: originalOrder.paymentMethod === 'cod' ? 'pending' : 'completed'
        });

        await newOrder.save();

        // Update product stock
        for (const item of newOrder.items) {
            const product = await productModel.findById(item.product);
            product.stockQuantity -= item.quantity;
            await product.save();
        }

        res.json({
            success: true,
            message: "Reorder placed successfully",
            order: newOrder
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Soft delete order (user end) - sets active to false
const softDeleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        // Find the order
        const order = await orderModel.findOne({ 
            _id: orderId, 
            user: userId,
            active: true // Only allow deletion of active orders
        });
        
        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: "Order not found or already deleted" 
            });
        }

        // Check if order can be deleted by user
        // Typically, users can only delete delivered or cancelled orders
        const allowedStatuses = ['delivered', 'cancelled'];
        if (!allowedStatuses.includes(order.status)) {
            return res.status(400).json({ 
                success: false, 
                message: `Order cannot be deleted as it is ${order.status}. Only delivered or cancelled orders can be deleted.` 
            });
        }

        // Soft delete by setting active to false
        order.active = false;
        await order.save();

        res.json({ 
            success: true, 
            message: "Order deleted successfully", 
            order 
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


export {
    createDirectOrder,
    verifyRazorpay,
    verifyStripe,
    placeOrder,
    placeOrderStripe,
    placeOrderRazorpay,
    allOrders,
    userOrders,
    updateStatus,
    deleteOrder,
    cancelOrder,
    resumeOrder,
    reorder,
    softDeleteOrder
}