import express from 'express'
import { placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, verifyStripe, verifyRazorpay, deleteOrder } from '../controllers/orderController.js'
import {authUser, admin} from '../middleware/auth.js'

const orderRouter = express.Router()

// Admin Features
orderRouter.post('/list', authUser, admin, allOrders)
orderRouter.post('/status', authUser, admin, updateStatus)

// Payment Features
orderRouter.post('/place', authUser, placeOrder)
orderRouter.post('/stripe', authUser, placeOrderStripe)
orderRouter.post('/razorpay', authUser, placeOrderRazorpay)

// User Feature 
orderRouter.post('/userorders', authUser, userOrders)
orderRouter.delete('/userorders/:id', authUser, deleteOrder)

// verify payment
orderRouter.post('/verifyStripe', authUser, verifyStripe)
orderRouter.post('/verifyRazorpay', authUser, verifyRazorpay)

export default orderRouter