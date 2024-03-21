const User = require('../model/userModel')
const Category = require ('../model/categoryModel')
const Product = require ('../model/productModel')
const Order = require ('../model/orderModel')
const Address = require('../model/addressModel')


const orderList = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const address = await Address.findOne({ userId });
        const order = await Order.find({ userId }).populate('orderedItem.productId');
        const users = await User.findOne({ _id: userId });

        res.render('users/orders', { order: order, address: address, users: users });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).send('Internal Server Error');
    }
};


const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { productId } = req.body; // Assuming productId is sent in the request body
        console.log('req.params',req.params);
        console.log(' req.body', req.body);
        const order = await Order.findById(orderId);
console.log('order',order);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Find the index of the product in the orderedItem array
        const productIndex = order.orderedItem.findIndex(item => item.productId.toString() === productId);
console.log('productIndex',productIndex);
        if (productIndex === -1) {
            return res.status(404).json({ message: 'Product not found in order' });
        }

        // Remove the product from the orderedItem array
        order.orderedItem.splice(productIndex, 1);

        // Save the updated order
        await order.save();

        res.status(200).json({ message: 'Product cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling product:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


module.exports = {
    orderList,
    cancelOrder
}