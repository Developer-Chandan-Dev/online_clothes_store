import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Truck, Wallet, MapPin, User, Mail, Phone, Home, Building, Map } from 'lucide-react'
import CartTotal from '../components/CartTotal'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const PlaceOrder = () => {
    const navigate = useNavigate()
    const [method, setMethod] = useState('cod')
    const { backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext)
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        street: '',
        apartment: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        saveAddress: true
    })

    const [loading, setLoading] = useState(false)

    const onChangeHandler = (event) => {
        const { name, value, type, checked } = event.target
        setFormData(data => ({ 
            ...data, 
            [name]: type === 'checkbox' ? checked : value 
        }))
    }

    const initPay = (order) => {
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: 'Order Payment',
            description: 'Order Payment',
            order_id: order.id,
            receipt: order.receipt,
            handler: async (response) => {
                try {
                    const { data } = await axios.post(
                        backendUrl + '/api/order/verifyRazorpay',
                        response,
                        { headers: { token } }
                    )
                    if (data.success) {
                        navigate('/orders')
                        setCartItems({})
                    }
                } catch (error) {
                    console.log(error)
                    toast.error(error.response?.data?.message || 'Payment verification failed')
                }
            },
            theme: {
                color: '#2563eb'
            }
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault()
        setLoading(true)

        try {
            // Validate form
            if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || 
                !formData.street || !formData.city || !formData.zipcode || !formData.country) {
                toast.error('Please fill all required fields')
                setLoading(false)
                return
            }

            let orderItems = []

            for (const productId in cartItems) {
                for (const variant in cartItems[productId]) {
                    if (cartItems[productId][variant] > 0) {
                        const productInfo = products.find(product => product._id === productId)
                        if (productInfo) {
                            orderItems.push({
                                product: productId,
                                quantity: cartItems[productId][variant],
                                size: variant !== 'default' ? variant : undefined,
                                color: productInfo.color || undefined,
                                price: productInfo.price,
                                name: productInfo.name
                            })
                        }
                    }
                }
            }

            if (orderItems.length === 0) {
                toast.error('Your cart is empty')
                setLoading(false)
                return
            }

            const totalAmount = getCartAmount() + delivery_fee

            let orderData = {
                shippingAddress: formData,
                items: orderItems,
                totalAmount: totalAmount,
                paymentMethod: method,
                orderType: 'cart'
            }

            let response

            switch (method) {
                case 'cod':
                    response = await axios.post(
                        backendUrl + '/api/order/place',
                        orderData,
                        { headers: { token } }
                    )
                    break

                case 'stripe':
                    response = await axios.post(
                        backendUrl + '/api/order/stripe',
                        orderData,
                        { headers: { token } }
                    )
                    if (response.data.success) {
                        window.location.replace(response.data.session_url)
                        return
                    }
                    break

                case 'razorpay':
                    response = await axios.post(
                        backendUrl + '/api/order/razorpay',
                        orderData,
                        { headers: { token } }
                    )
                    if (response.data.success) {
                        initPay(response.data.order)
                        return
                    }
                    break

                default:
                    break
            }

            if (response.data.success) {
                toast.success('Order placed successfully!')
                setCartItems({})
                navigate('/orders')
            } else {
                toast.error(response.data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || 'Failed to place order')
        } finally {
            setLoading(false)
        }
    }

    const paymentMethods = [
        {
            id: 'cod',
            name: 'Cash on Delivery',
            icon: <Truck size={20} className="text-gray-600" />,
            description: 'Pay when you receive your order'
        },
        {
            id: 'stripe',
            name: 'Credit/Debit Card',
            icon: <CreditCard size={20} className="text-gray-600" />,
            description: 'Pay securely with your card'
        },
        {
            id: 'razorpay',
            name: 'Razorpay',
            icon: <Wallet size={20} className="text-gray-600" />,
            description: 'Secure payment gateway'
        }
    ]

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Order</h1>
                <p className="text-gray-600">Review your items and enter your delivery information</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side - Delivery Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <MapPin className="text-blue-600" size={24} />
                        <h2 className="text-xl font-semibold">Delivery Information</h2>
                    </div>

                    <form onSubmit={onSubmitHandler} className="space-y-4">
                        {/* Personal Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <User size={16} />
                                    First Name *
                                </label>
                                <input
                                    required
                                    onChange={onChangeHandler}
                                    name="firstName"
                                    value={formData.firstName}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    type="text"
                                    placeholder="First name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <User size={16} />
                                    Last Name *
                                </label>
                                <input
                                    required
                                    onChange={onChangeHandler}
                                    name="lastName"
                                    value={formData.lastName}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    type="text"
                                    placeholder="Last name"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Mail size={16} />
                                Email Address *
                            </label>
                            <input
                                required
                                onChange={onChangeHandler}
                                name="email"
                                value={formData.email}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                type="email"
                                placeholder="Email address"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Phone size={16} />
                                Phone Number *
                            </label>
                            <input
                                required
                                onChange={onChangeHandler}
                                name="phone"
                                value={formData.phone}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                type="tel"
                                placeholder="Phone number"
                            />
                        </div>

                        {/* Address Information */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Home size={16} />
                                Street Address *
                            </label>
                            <input
                                required
                                onChange={onChangeHandler}
                                name="street"
                                value={formData.street}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                type="text"
                                placeholder="Street address"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Apartment, Suite, etc. (Optional)
                            </label>
                            <input
                                onChange={onChangeHandler}
                                name="apartment"
                                value={formData.apartment}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                type="text"
                                placeholder="Apartment, suite, etc."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <Building size={16} />
                                    City *
                                </label>
                                <input
                                    required
                                    onChange={onChangeHandler}
                                    name="city"
                                    value={formData.city}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    type="text"
                                    placeholder="City"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <Map size={16} />
                                    State
                                </label>
                                <input
                                    onChange={onChangeHandler}
                                    name="state"
                                    value={formData.state}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    type="text"
                                    placeholder="State"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    ZIP Code *
                                </label>
                                <input
                                    required
                                    onChange={onChangeHandler}
                                    name="zipcode"
                                    value={formData.zipcode}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    type="text"
                                    placeholder="ZIP code"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Country *
                                </label>
                                <input
                                    required
                                    onChange={onChangeHandler}
                                    name="country"
                                    value={formData.country}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    type="text"
                                    placeholder="Country"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="saveAddress"
                                name="saveAddress"
                                checked={formData.saveAddress}
                                onChange={onChangeHandler}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="saveAddress" className="text-sm text-gray-600">
                                Save this address for future orders
                            </label>
                        </div>
                    </form>
                </div>

                {/* Right Side - Order Summary & Payment */}
                <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                        <CartTotal />
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <CreditCard className="text-blue-600" size={24} />
                            <h2 className="text-xl font-semibold">Payment Method</h2>
                        </div>

                        <div className="space-y-4">
                            {paymentMethods.map((payment) => (
                                <div
                                    key={payment.id}
                                    onClick={() => setMethod(payment.id)}
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                        method === payment.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${
                                            method === payment.id ? 'bg-blue-100' : 'bg-gray-100'
                                        }`}>
                                            {payment.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">{payment.name}</h3>
                                            <p className="text-sm text-gray-600">{payment.description}</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 ${
                                            method === payment.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                        }`}>
                                            {method === payment.id && (
                                                <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Place Order Button */}
                        <button
                            type="submit"
                            onClick={onSubmitHandler}
                            disabled={loading}
                            className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : 'Place Order'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlaceOrder