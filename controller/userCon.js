const User=require('../model/userModel')
const Otp=require('../model/otpModel')
const bcrypt=require('bcrypt')
const nodemailer= require("nodemailer")
const randomstring = require('randomstring')
const {ObjectId}=require('mongodb')
const Product = require('../model/productModel')
const Category = require ('../model/categoryModel')
const Address = require ('../model/addressModel')


const securePassword=async(password)=>{
    try{

        const passwordHash=await bcrypt.hash(password,10)
        return passwordHash;
    }catch(error){
        console.log(error.message);
    }
}


const loadRegister=async(req,res)=>{
    console.log('ghj');
    try{
    console.log('enter');
        res.render('users/register')
        console.log('finish');
    }catch(error){
        console.log(error.message);
    }
}


const insertUser = async (req, res) => {
    try {
        const spassword = await securePassword(req.body.password)

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            password: spassword,
            is_admin: 0
        })

        const email = req.body.email

        if (!user) {
            res.render('users/register', { message: "Your registration has failed" })
        } else {
            const existingUser = await User.findOne({ email: email })
            if (existingUser) {
                res.render('users/register', { message: "This email is already registered" })
            } else {
                if (!email.endsWith('.com')) {
                    res.render('users/register', { message: "Email must end with .com" })
                } else {
                    const password = req.body.password;
                    const confirmPassword = req.body.confirmPassword;
                    if (password !== confirmPassword) {
                        res.render('users/register', { message: "Your passwords do not match" });
                    } else {
                        if (password.length < 4) {
                            res.render('users/register', { message: "Password must be at least 4 characters long" });
                        } else if (!password.match(/[a-z]/i) || !password.match(/[0-9]/) || !password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)) {
                            res.render('users/register', { message: "Password must contain at least one letter and one number" });
                        } else {
                            const userData = await user.save()
                            req.session.userData = userData;
                            req.session.user_id = userData._id
                            const otp = generateOTP()
                            console.log(otp);
                            console.log(req.body.name, "name and email", req.body.email)
                            await sendVerifyMail(req.body.name, req.body.email, otp)
                            const OTP = new Otp({
                                userid: userData._id,
                                otp: otp
                            })
                            await OTP.save()
                            res.redirect('/otp')
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.log(error.message + '  insert user');
    }
}



// for send mail

const sendVerifyMail=async(name,email,otp)=>{
     try{
          
        // Compose Email
        const mailOption={
            from:'shirinmunzz@gmail.com',
            to: email,
            subject:'Your OTP',
            text:`Your OTP (One-Time Password) is:${otp}`,
        }

        // Send Email

        transporter.sendMail(mailOption,function(error,info){
            if(error){
                console.log('Error sending email:',error);
            }
            else{
                console.log("Email has been sent:-",info.response);
            }
        })
        
    }catch(error){
        console.log(error.message+'   email send');
    }
}



const verifyMail = async(req,res)=>{
    try{

         const updateInfo= await User.updateOne({_id:req.query.id},{$set:{is_varified:0}})
         console.log('updateInfo:',updateInfo);
         res.render('email_verified')

    }catch(error){
        console.log(error.message);
    }
}



const generateOTP=()=>{
    return  randomstring.generate({
     length:6,
     charset:'numeric'
 })
 }




const verifyOTP = async (req, res) => {

    try {
        const { otp } = req.body;

        console.log('req.session.userData',req.session.userData);
        req.session.user_id = req.session.userData;
        const user_id = req.session.user_id;
        console.log('userid:',user_id);
        if (!user_id) {
            throw new Error("User ID not found in session.");
        }
console.log(req.session.userData);
        const user = await Otp.findOne({ userid: user_id._id });
console.log(user);
        if (!user) {
            throw new Error("User not found.");
        }
        console.log("This is otp from bosy",otp);
        if (otp === user.otp) {
            console.log("Entered otp matched");
            console.log(otp,'otp');
            console.log(user.otp);
            user.is_varified = true;
            await user.save();
            res.redirect('/home');
        } else {
            console.log("entered eroor in otp matching");
            res.render('users/otp', { error: 'Invalid OTP. Please try again.' });
        }
    } catch (error) {
        console.log("Error in verifyOTP:", error.message);
        res.render('users/otp', { error: 'An error occurred while verifying OTP.' });
    }
};




const resendOTP= async(req,res)=>{
    try{
        console.log('hyy');
        const newOTP=generateOTP()
       console.log(newOTP)
       console.log("userdata",req.session.userData._id);
        const user=await User.findOne({_id:req.session.userData._id})
        const deleteOTP=await Otp.deleteOne({userid:req.session.userData._id})
        console.log('this is deleteotp',deleteOTP);
        const NOTP= new Otp({
            userid:req.session.userData._id,
            otp:newOTP
        })
        await NOTP.save()
console.log(user);
         user.otp=newOTP
         await user.save();

        sendVerifyMail(user.name, user.email, user._id, newOTP)
console.log('in resend hy');
        res.redirect('/otp')
        console.log('inresend after redirect hy');
    }catch(error){
        console.log('Error in resendOTP');
        res.status(500).send("An error occured while resendin OTP")
    }
}





const otpLoad = (req, res) => {
    try {
        const error = req.flash('error'); 
        res.render('users/otp', { error }); 
    } catch (error) {
        console.log(error.message);
    }
}



const loginLoad =(req,res)=>{
    try{
        const message=req.flash('message')       
        res.render('users/login',{message})
    }catch(error){
        console.log(error.message);
    }
}



const verifyLogin = async (req, res) => {
    try {
const err=req.flash('error')
        const email = req.body.name
        const password = req.body.password

        const userData = await User.findOne({ email: email })

        if (userData) {

            if (userData.is_blocked === 1) {
                req.flash('message', 'you have been blocked')
                return res.redirect('/login')
            }

            const passwordMatch = await bcrypt.compare(password, userData.password)

            if (passwordMatch) {
                req.session.user_id = userData._id
                console.log(" req.session.user_id", req.session.user_id);
                res.redirect('/userhome')
            }
            else {
                req.flash('message', 'password does not match')
                res.redirect('/login')
            }
        }
        else {
            req.flash('message', 'user not found')
            res.redirect('/login')
        }

 
      
    } catch (error) {
        console.log("error in verifyLogin", error);
    }
}



const loadHome=async(req,res)=>{
    try{
        
        const user=req.session.user_id;
        console.log('user:',user);
        const userData=await User.findOne({_id:user})
        console.log('userData:',userData);
        if(userData){
            res.render('users/userhome',{user:userData})
        }else {
            res.render('users/home',{user:null})
        }
        
    }catch(error){
        console.log(error.message);
        return res.status(500).send('Internal Server Error')
    }
}




const userLogout = async (req, res) => {
    try {
        req.session.user_id = null
        req.session.destroy();
        res.redirect('/home')
    } catch (error) {
        console.log(error.message);
    }
}



const shopLoad = async (req, res) => {
    try {
        const message = req.flash('message');
        console.log('message',message);
        const products = await Product.find({ status: true }).populate('category');
console.log('product',products);
        const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000); 
        const newProducts = await Product.find({ createdAt: { $gte: oneDayAgo } }).populate('category').limit(10); 
        console.log('oneDayAgo',oneDayAgo);
        console.log('newProducts',newProducts);
        res.render('users/shop', {  products, newProducts, message });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};


// single product load

const singleProductLoad = async (req,res) => {
    try {
        const productId = req.params.productId
        const product = await Product.findById(productId)
        const products = await Product.find()
        res.render('users/singleProduct',{product,products})
        
    } catch (error) {
        console.log(error.message)
    }
}




const profileLoad=async (req,res)=>{
    try {
        const user=req.session.user_id;
        console.log('user:',user);
        const userData=await User.findById({_id:user});
        console.log('userData:',userData);
        res.render('users/profile',{user:userData});
    } catch (error) {
        console.log(error.message);
    }
}



//  edit ProfileLoad

const editProfileLoad = async (req, res) => {
    try {
        
        const id = req.session.user_id;
        const user = await User.findById({_id:id});
        console.log('user:',user);
        if (!user) {
            return res.status(400).send('User not found'); 
        }
        res.render('users/editProfile', { user: user });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};



//  Profile updated

const updateProfile = async (req, res) => {
    try {
        if (! req.session.user_id) {
            return res.status(401).send('User not authenticated');
        }
        const { name, email, mobile } = req.body;
        const user = await User.findById(req.session.user_id);   
        if (!user) {
            return res.status(404).send('User not found');
        }
        user.name = name;
        user.email = email;
        user.mobile = mobile;

        await user.save();
        res.redirect('/profile');
    } catch (error) {
        console.error('Error in updateProfile:', error);
        res.status(500).send('Internal Server Error');
    }
};



//  Orders load





// AccountDetails Load

const accountDetailsLoad = async (req,res) => {
    console.log('accountDetailsLoad');
    try {
        console.log('inside try of accountDetailsLoad');
        res.render('users/accountDetails')
    } catch (error) {
        console.log('inside catch of accountDetailsLoad');
        console.log(error.message); 
    }
}



const changePassword = async (req,res) => {
    console.log('starting changePassword');
    try {
        const { currentPassword, newPassword, confirmNewPassword } = req.body
        console.log('currentPassword',currentPassword);
        console.log('newPassword',newPassword);
        console.log('confirmNewPassword',confirmNewPassword);
        if(newPassword !== confirmNewPassword){
            return res.status(400).send('New password and confirm new password do not match');
        }
        const userid = req.session.user_id
        console.log('userid',userid);
        const user = await User.findById(userid)
        console.log('user',user);
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        console.log('isMatch',isMatch);
        if (!isMatch) {
            return res.status(400).send('Current password is incorrect');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        user.password = hashedPassword
        await user.save()
        res.redirect('/accountDetails')
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).send('Internal Server Error');
    }
}



module.exports={
    loginLoad,
    loadRegister,
    insertUser,
    verifyLogin,
    userLogout,
    insertUser,
    loadHome,
    otpLoad,
    verifyMail,
    verifyOTP,
    resendOTP,
    sendVerifyMail,
    
    shopLoad,
    singleProductLoad,

    profileLoad,
    editProfileLoad,
    updateProfile,
    accountDetailsLoad,
    changePassword
}