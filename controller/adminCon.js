const User=require('../model/userModel')
const bcrypt=require('bcrypt')
const config=require('../config/config')
const Category = require('../model/categoryModel')
const Product = require ('../model/productModel')
const Order = require('../model/orderModel')



  //admin login page
const loadLogin=async(req,res)=>{
    try {
        const message=req.flash('msg');
        res.render('login',{message})

    } catch (error) {
        console.log(error.message);
    }
}

//admin data post
const adminVerify=async(req,res)=>{
    try {
       
        const email=req.body.email;
        const password=req.body.password;
        console.log(email);
        const userData=await User.findOne({email:email})
          console.log('userData',userData)
         if (userData) {
            
        const passwordMatch=  await  bcrypt.compare(password,userData.password)
        if (passwordMatch) {
            
            if (userData.is_admin===0) {
                req.flash('msg','your not admin')
                res.redirect('/admin')
            } else {
                req.session.admin_id=userData._id 
                res.redirect('/admin/dashboard')
            }

        } else {
            req.flash('msg','email and password incorrect')
            res.redirect('/admin')
        } 
        
        } else {
             req.flash('msg','email and password incorrect')
             res.redirect('/admin')
         }


    } catch (error) {
        console.log(error.message);
    }
}


//load dashboard
const loadDashboard=async(req,res)=>{
    try {
        const userData=  await User.findById({_id:req.session.admin_id});
        res.render('dashboard',{admin:userData})

    } catch (error) {
        console.log(error.message);
    }
}


// List users

const listUsers = async (req, res) => {
    try {
        const users = await User.find()
        res.render('custommer', { users })
    }catch (error) {
        console.log(error.message);
    }
}


// Block or unblock  users

const updateUserStatus = async (req,res) => {
    try {
        const userId = req.params.id
        const action = req.params.action

        const user = await User.findById(userId)

        if(!user) {
            return res.status(404).json({ error: 'User not found' })
        }
        if (action === 'block') {
            user.is_blocked = 1
        }else if (action === 'unblock') {
            user.is_blocked = 0
        }else {
            return res.status(400).json({ error: 'Invalid action'})
        }
       

        await user.save()

        res.status(200).json({ message: `User ${action === 'block' ? 'blocked' : 'unublocked'} successfully`})
    } catch (error) {
        console.error ('Error updating user status ', error)
        res.status(500).json({ error:' Internal Server Error' })
    }
}




// product Details

// const productDetails=async(req,res)=>{
//     try {
//         const Products = await Product.find()
//         res.render('products',{Products:Products})
//         console.log(Products);
        
//     } catch (error) {
//         console.log(error.message);
//     }
// }

// Category Details

const categoryDetails=async(req,res)=>{
    try {

        const pageNumber = parseInt(req.query.page) || 1;
        const pageSize = 10; 
        const skip = (pageNumber - 1) * pageSize;
        const categorys = await Category.find({}).sort({ createdAt: -1}).skip(skip).limit(pageSize)
        const totalCategoriesCount = await Category.countDocuments();
        const totalPages = Math.ceil(totalCategoriesCount / pageSize);
        res.render('categories',{categorys:categorys , currentPage: pageNumber , totalPages})
        // console.log(categorys);
    } catch (error) {
        console.log(error.message);
    }
}

// Category updatedCategory

const updatedCategory = async (req,res) => {
    try {

        const categoryId = req.query.categoryId
        const category = await Category.findById({categoryId})
        res.render('categories',{category:category})
        console.log(category);

    }catch (error) {
        console.log(error.message);
    }
}


const orderDetails = async (req,res) => {
    try {
        const orders = await Order.find({}).populate('userId')
        .populate('deliveryAddress')
        .populate({ path : 'orderedItem.productId', model:'Product'})
        .sort({ _id: -1 })
        console.log('orders:',orders);

        const formattedOrders = orders.map(order => {
            const date = new Date (order.createdAt)
            const formattedDate = date.getFullYear() + '-' + String(date.getMonth() +1).padStart(2,'0')+ '-' + String(date.getDate()).padStart(2,'0')
            return {
                ...order.toObject(),
                formattedCreatedAt : formattedDate
            }
        })
        res.render('order', { orderDetails: formattedOrders })
    } catch (error) {
       console.log(error.message); 
    }
}

const singleView = async (req,res) => {
    try {
        const orderId = req.query.orderId.replace(/\s+/g, '');
console.log(' admin orderId:::::::::::::::::::',orderId);
        const orderDetails = await Order.findOne({ _id: orderId}).populate('userId')
        .populate({path: 'orderedItem.productId', model: 'Product'})
        .populate ('deliveryAddress')
console.log(' admin orderDetails;;;;;;;;;;;;;;;;;;;',orderDetails);
        const products = orderDetails.orderedItem
console.log('admin products;;;;;;;;;;;;;',products);
        res.render ('singleView', {orderDetails: orderDetails })
    } catch (error) {
       console.log(error.message); 
    }
}


const updateStatus = async (req, res) => {
    try {
      console.log('going to change the order status');
      const { status, orderId } = req.body; // Removed productId
  
  console.log('status',status);
  console.log('orderId',orderId);
  
      const orderStatus = await Order.updateOne(
        { 
          _id: orderId,
        },
        { 
          $set: { 'orderStatus': status } // Update the order status directly
        }
      );
  console.log('orderStatus',orderStatus);
     
      console.log('successfully updated the order status');
      res.status(200).json({ success: true });
    } catch (error) {
      console.log('Error in updating order status:', error);
      res.status(500).json({ success: false });
    }
  };


//Logout

const logout = async (req, res) => {
    try {
        req.session.admin_id = null;
        res.redirect('/admin/');
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}



module.exports={
    loadLogin,
    loadDashboard,
    listUsers,
    updateUserStatus,
    // productDetails,
    categoryDetails,
    updatedCategory,
    orderDetails,
    singleView,
    updateStatus,
    logout,
    adminVerify
}