const User =require ('../model/userModel')
const Address = require ('../model/addressModel')
const Cart = require('../model/cartModel')
const Product = require('../model/productModel')
const Order = require('../model/orderModel')




//  Address load

const addressLoad = async (req,res) => {
    const id = req.session.user_id
    const user = await User.findById({_id:id})
    console.log('user',user);
    const address = await Address.find({user:id})
    console.log('address',address); 
    try {
        console.log('inside try of addressLoad');
        res.render('users/address',{user:user,address:address})
        
    } catch (error) {
        console.log('inside catch of addressLoad');
        console.log(error.message);
    }
}


// addAddress Load

const addAddressLoad = async (req,res) => {

    try {
        const id = req.session.user_id
        const user = await User.findById({_id:id})
        return res.render('users/addAddress',{user:user})
    } catch (error) {
        console.log(error.message); 
    }
}


// Add Address

const addAddress = async (req,res) => {
    try {
        

        const newAddress = new Address ({
            user : req.session.user_id,
            name : req.body.name,
            mobile : req.body.mobile,
            streetAddress : req.body.streetAddress,
            city : req.body.city,
            state : req.body.state,
            postalCode : req.body.postalCode,
            locality:req.body.locality,
            landmark:req.body.landmark,
            alterPhone:req.body.alterPhone,
            addressType:req.body.addressType
        })

        await newAddress.save()

        res.redirect ('/address')

    } catch (error) {
        console.error('Error saving address:', error);
        res.status(500).send('Internal Server Error');
    }
}



// Edit AddressLoad

const editAddressLoad = async (req,res) => {
    try {

        const id = req.query.id
        console.log('id',id);
        const user_id = req.session.user_id
        const user = await User.findOne({_id:user_id});
        console.log('user',user);
        const address = await Address.findById({_id:id});
        // console.log('address',address);
        if(!address){
            console.log('Address not found');
            return res.status(404).send('Address not found');
        }
        console.log('render from here');
        res.render('users/editAddress',{user:user,address:address})
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}


// Edit Address

const editAddress = async (req,res) => {
    try {
        console.log('editing start');
        const userid = req.session.user_id
        console.log('userid',userid);
        
        const user = await User.findById(userid)
        const id = req.body.id
        const address = await Address.findOne({_id:id})
        console.log('address',address);


        const updateFields = {
           name : req.body.name,
           mobile : req.body.mobile,
           streetAddress : req.body.streetAddress,
           city : req.body.city,
           state : req.body.state,
           postalCode : req.body.postalCode,
           locality : req.body.locality,
           landmark : req.body.landmark,
           alterPhone : req.body.alterPhone,
           addressType : req.body.addressType
        }

        const updateAddress = await Address.findByIdAndUpdate(id,{$set: updateFields},{new:true})
        res.redirect('/address')
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).send('Internal Server Error');
    }
}



// Delete Address

const deleteAddress = async (req,res) => {
    try {
        const id = req.query.id
        await Address.findByIdAndDelete(id)
        res.redirect('/address')
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).send('Internal Server Error');
    }
}


 // loadCheckout

 const loadCheckout = async (req, res) => {
    console.log('inside loadCheckout');
    try {
        const userId = req.session.user_id;
        const user = await User.findById(userId);
        const carts = await Cart.find({ userId }).populate('productId');
        const address = await Address.find({ user: userId });
        
        const totalPrice = carts.reduce((acc, cartItem) => {
            return acc + (cartItem.productId.price * cartItem.quantity);
        }, 0);
        res.render('users/checkout', {userId: userId, address: address, user: user, cart: carts, totalPrice: totalPrice });
    } catch (error) {
        console.log('inside catch');
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}


//  Add Checkout Address

const checkoutAddress = async (req,res) => {
    try {
        const newAddress = new Address ({
            user : req.session.user_id,
            name : req.body.name,
            mobile : req.body.mobile,
            streetAddress : req.body.streetAddress,
            city : req.body.city,
            state : req.body.state,
            postalCode : req.body.postalCode,
            locality:req.body.locality,
            landmark:req.body.landmark,
            alterPhone:req.body.alterPhone,
            addressType:req.body.addressType
        })

        await newAddress.save()

        res.redirect ('/checkout')

    } catch (error) {
        console.error('Error saving address:', error);
        res.status(500).send('Internal Server Error');
    }
}



//  Add Checkout Address

const getAddressDetails = async (req, res) => {
    try {
        const addressId = req.query.id;
        console.log('addressId',addressId);
        const address = await Address.findById(addressId);
        console.log('address',address);
        if (!address) {
            return res.status(404).json({ error: 'Address not found' });
        }
        res.json(address);
    } catch (error) {
        console.error('Error fetching address details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};




const editCheckout = async (req, res) => {
    try {
        const addressId = req.body.addressId;
        console.log('addressId',addressId);
        const updateFields = {
            name: req.body.name,
            mobile: req.body.mobile,
            streetAddress: req.body.streetAddress,
            city: req.body.city,
            state: req.body.state,
            postalCode: req.body.postalCode,
            locality: req.body.locality,
            landmark: req.body.landmark,
            alterPhone: req.body.alterPhone,
            addressType: req.body.addressType
        };
        console.log('updateFields',updateFields);
        const updatedAddress = await Address.findByIdAndUpdate(addressId, updateFields, { new: true });
        console.log('updatedAddress',updatedAddress);
        res.status(201).json(updatedAddress);
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const loadThenkyou = async (req,res) => {
    const orderId = req.query.orderId;
    try {
       console.log(orderId);
        const order= await Order.findOne({_id:orderId})  
        console.log('orderhuhuhuhuhu',order);
        res.render('users/thankyou',{ order})
    } catch (error) {
        console.log(error.message);
    }
}


const placeOrder = async (req, res) => {
        console.log('inside placeOrder');
        try {
            console.log('inside try placeOrder');
            
            const { deliveryAddress, paymentMethod } = req.body;
            console.log('Delivery Address:', deliveryAddress);
            console.log('Payment Method:', paymentMethod);
    
            const userId = req.session.user_id;
            const cart = await Cart.find({ userId }).lean(); 
    console.log('cart',cart);
    
    if (!cart || cart.length === 0) {
        
        return res.redirect('/cart?message=Your cart is empty');
    }
        
            const orderedItems = cart.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price:item.price ,
                
            }));
    
            console.log('orderedItems',orderedItems);

            for(let item of orderedItems){
                const {productId , quantity } = item
                const products = await Product.updateOne({_id: productId},{ $inc: {quantity: -quantity}})
            }
           
            const orderAmount = cart.reduce((acc, item) => {
                console.log('Price:', item.price);
                console.log('Quantity:', item.quantity);
                return acc + (item.price );
            }, 0);
           
            const order = new Order({
                userId: userId,
                orderedItem: orderedItems,
                orderAmount: orderAmount,
                deliveryAddress: deliveryAddress,
                paymentMethod: paymentMethod,
                orderStatus: 'pending',
                deliveryDate: null, 
                shippingDate: null 
            });    
            
            await order.save();
            console.log('order',order);
    
            await Cart.deleteMany({userId:userId})
            res.json({success:true,order:order._id})
            // res.redirect(`/thankyou?orderId=${order._id}`);
        } catch (error) {
            console.error('Error placing order:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    };




module.exports = {
    addressLoad,
    addAddressLoad,
    addAddress,
    editAddressLoad,
    editAddress,
    deleteAddress,

    loadCheckout,
    checkoutAddress,
    getAddressDetails,
    editCheckout,
    
    placeOrder,
    loadThenkyou
}
