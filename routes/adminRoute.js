// const { config } = require('dotenv')
const express=require('express')

const admin_route=express()


const config=require('../config/config')
const session= require('express-session')
const adminController=require('../controller/adminCon')

admin_route.use(session({
    secret:config.sessionSecret,
    resave:false,
    saveUninitialized:true
}))



admin_route.use(express.json())
admin_route.use(express.urlencoded({extended:true}))


admin_route.set('view engine','ejs')
admin_route.set('views','./views/admin');


const multer=require('multer')
const path=require('path')
admin_route.use(express.static('public'))


const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/admin'))
    },
    filename:function(req,file,cb){
        const name=date.now()+'-'+file.originalname;
        cb(null,name)
    }
})

const upload=multer({storage:storage})
const auth=require('../middleware/adminAuth')
const product =require ('../routes/productRoute')



admin_route.get('/',auth.isLogout,adminController.loadLogin)
admin_route.post('/',adminController.adminVerify)
admin_route.get('/dashboard',adminController.loadDashboard)
admin_route.get('/custommer', auth.isLogin , adminController.listUsers)
admin_route.patch('/custommer/:id/:action', auth.isLogin, adminController.updateUserStatus)
admin_route.get('/categories',adminController.categoryDetails)
admin_route.get('/order',adminController.orderDetails)
admin_route.get('/singleorderview',adminController.singleView)
admin_route.post('/updatestatus',adminController.updateStatus)
admin_route.post('/logout',auth.isLogin,adminController.logout)
admin_route.get('/logout',auth.isLogin,adminController.logout)





// admin_route.post('/custommer/:id/block',auth.isLogin, adminController.blockUser)
// admin_route.post('/custommer/:id/unblock', auth.isLogin , adminController.unblockUser)
// admin_route.get('/products',adminController.productDetails)




module.exports= admin_route;

