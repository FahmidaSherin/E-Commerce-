const express = require('express')
const user_route = express.Router()
const session = require('express-session')
const config = require('../config/config')
const auth = require('../middleware/userAuth');
const multer = require('multer')
const path = require('path')
const { sendVerificationEmail, verifyOTP, generateOTP } = require('../controller/userCon');
const productCon = require('../controller/productCon')
const cartCon = require('../controller/cartCon')
const orderCon = require ( '../controller/orderCon')


// user_route.use(express.static('public'))

// const storage=multer.diskStorage({
//     destination:function(req,file,cb){
//         const name=Date.now()+'-'+file.originalname;
//         cb(null,name)
//     }
// })

// const upload=multer({storage:storage})


const userCon = require('../controller/userCon')
const addressCon = require('../controller/addressCon')

user_route.get('/',auth.isLogout,userCon.loadHome)
user_route.get('/home',auth.isLogout,userCon.loadHome)
user_route.get('/userhome',auth.isLogin,auth.isBlocked,userCon.loadHome)

user_route.get('/register', userCon.loadRegister);
user_route.post('/register', userCon.insertUser);

user_route.get('/login',auth.isLogout,userCon.loginLoad)
user_route.post('/login',auth.isLogout,userCon.verifyLogin)

user_route.get('/logout',auth.isLogin,userCon.userLogout)

user_route.get('/verify',userCon.sendVerifyMail)
user_route.get('/otp',userCon.otpLoad) 
user_route.post('/verify-otp', userCon.verifyOTP);
user_route.post('/resend-otp',userCon.resendOTP)

user_route.get('/shop', auth.isBlocked, userCon.shopLoad)
user_route.get('/singleProduct/:productId', auth.isBlocked, userCon.singleProductLoad)

user_route.get('/profile',userCon.profileLoad)
user_route.get('/editProfile', userCon.editProfileLoad)
user_route.post('/editProfile', userCon.updateProfile)

user_route.get('/address', addressCon.addressLoad)
user_route.get('/addAddress',addressCon.addAddressLoad)
user_route.post('/addAddress',addressCon.addAddress)
user_route.get('/editAddress',addressCon.editAddressLoad)
user_route.post('/editAddress',addressCon.editAddress)
user_route.get('/deleteAddress', addressCon.deleteAddress);

user_route.get('/accountDetails',userCon.accountDetailsLoad)
user_route.post('/changePassword',userCon.changePassword)
user_route.get('/sortProducts',productCon.sortProducts)

user_route.get('/cart',cartCon.cartLoaded)
user_route.post('/cart/add',cartCon.addToCart)
user_route.post('/cart/updateQuantity/:productId',cartCon.updateCartItemQuantity)
user_route.post('/removecart',cartCon.cartRemove)
user_route.get('/cartItemCount',cartCon.getCartCount)

user_route.get('/checkout',addressCon.loadCheckout)
user_route.post('/checkoutAddress',addressCon.checkoutAddress)
user_route.get('/getAddressDetails',addressCon.getAddressDetails)
user_route.post('/editCheckout',addressCon.editCheckout)
  
user_route.post('/placeOrder', addressCon.placeOrder);
user_route.get('/thankyou',addressCon.loadThenkyou)
user_route.get('/orders',  auth.isLogin, orderCon.orderList)
user_route.put('/cancelOrder/:orderId', orderCon.cancelOrder)
user_route.get('/singleOrder', auth.isLogin, orderCon.viewOrder)


module.exports = user_route;