const User = require('../model/userModel')
const Category = require ('../model/categoryModel')
const Product = require ('../model/productModel')
const Order = require ('../model/orderModel')
const Address = require('../model/addressModel')


const orderList = async (req, res) => {
    try {
        console.log('inside the try of orderList');
        const userId = req.session.user_id;
        console.log('userId----',userId);
        const address = await Address.findOne({ userId });
        console.log('address---',address);
        const order = await Order.find({ userId }).populate('orderedItem.productId');
        console.log('order',order);
        const users = await User.findOne({ _id: userId });
        console.log('users',users);
        res.render('users/orders', { order: order, address: address, users: users });
    } catch (error) {
        console.log('inside the catch of orderlist');
        console.error('Error fetching orders:', error);
        res.status(500).send('Internal Server Error');
    }
};










const viewOrder = async (req,res) => {
    try {
        const userId = req.session.user_id
        console.log('userId>>>>>>>>>>>>>>>>>>>',userId);
        const user = await User.findOne ({ _id: userId })
        console.log('user>>>>>>>>>>>>>>>>>>>>>>',user);
        const orderId = req.query.orderId.replace(/\s+/g, '');
console.log('orderId:::::::::::::::::::',orderId);
        const orderDetails = await Order.findOne({ _id: orderId}).populate('userId')
        .populate({path: 'orderedItem.productId', model: 'Product'})
        .populate ('deliveryAddress')
console.log('orderDetails;;;;;;;;;;;;;;;;;;;',orderDetails);
        const products = orderDetails.orderedItem
console.log('products;;;;;;;;;;;;;',products);
        res.render ('users/singleOrder', {orderDetails: orderDetails , user:userId})
    } catch (error) {
       console.log(error.message); 
    }
}


const cancelOrder = async (req, res) => {

    const orderId = req.params.orderId;
    console.log('orderId>>>>>>>>>>>>',orderId);
    const newStatus = req.body.status;
    console.log('newStatus>>>>>>>>>>>>>>>>>>',newStatus);
    try {
        // Find the order by ID and update its status
        console.log('inside try of cancelOrder');
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { orderStatus: newStatus }, { new: true });
        console.log('updatedOrder:::::::::::',updatedOrder);
        if (!updatedOrder) {
            console.log('Order not found     ?????????????????????????????');
            return res.status(404).json({ error: 'Order not found' });
        }

        // Respond with the updated order
        res.status(200).json(updatedOrder);
    } catch (error) {
        console.log('inside catch of cancelOrder');
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
};


module.exports = {
    orderList,
    cancelOrder,
    viewOrder
}