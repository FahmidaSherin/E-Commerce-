const User=require('../model/userModel')
const bcrypt=require('bcrypt')
const config=require('../config/config')
const Category = require('../model/categoryModel')
const Product = require ('../model/productModel')



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

const productDetails=async(req,res)=>{
    try {
        const Products = await Product.find()
        res.render('products',{Products:Products})
        console.log(Products);
        
    } catch (error) {
        console.log(error.message);
    }
}

// Category Details

const categoryDetails=async(req,res)=>{
    try {

     
        const categorys = await Category.find()
        res.render('categories',{categorys:categorys})
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
    productDetails,
    categoryDetails,
    updatedCategory,
    logout,
    adminVerify
}