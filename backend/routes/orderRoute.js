import express from 'express'
import { createDirectOrder, placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, verifyStripe, verifyRazorpay, deleteOrder, cancelOrder,
    resumeOrder,
    reorder, 
    softDeleteOrder 
} from '../controllers/orderController.js'
import {authUser, admin} from '../middleware/auth.js'

const orderRouter = express.Router()

// Admin Features
orderRouter.get('/list', authUser, admin, allOrders)
orderRouter.post('/status', authUser, admin, updateStatus)

// Payment Features
orderRouter.post("/direct-order", authUser, createDirectOrder)
orderRouter.post('/place', authUser, placeOrder)
orderRouter.post('/stripe', authUser, placeOrderStripe)
orderRouter.post('/razorpay', authUser, placeOrderRazorpay)

// User Feature 
orderRouter.get('/userorders', authUser, userOrders)
orderRouter.delete('/userorders/:id', authUser, deleteOrder)
orderRouter.put('/:orderId/cancel', authUser, cancelOrder);
orderRouter.put('/:orderId/resume', authUser, resumeOrder);
orderRouter.post('/:orderId/reorder', authUser, reorder);
orderRouter.delete('/:orderId/soft-delete', authUser, softDeleteOrder); // Soft delete route

// verify payment
orderRouter.post('/verifyStripe', authUser, verifyStripe)
orderRouter.post('/verifyRazorpay', authUser, verifyRazorpay)

export default orderRouter