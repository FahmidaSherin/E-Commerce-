
const mongoose=require('mongoose')
// const morgan=require('morgan')

mongoose.connect('mongodb://localhost:27017/MyProject')

const express=require('express')
 const session = require('express-session');

const path=require('path')

const flash = require('connect-flash')
const noCache=require('nocache')
const app=express();

// app.use(morgan('dev'))
app.use(noCache())
app.use(session({
    secret:'sessionSecret',
    resave:false,
    saveUninitialized:false
}))
app.use(flash())



// app.use(express.static('public'))
app.set('view engine','ejs')


// app.set('view engine', 'ejs'); // Replace 'ejs' with your chosen view engine
app.set('views', path.join(__dirname, './views'));
app.use(express.static(path.join(__dirname,'public')))
app.use(express.json());
app.use(express.urlencoded({extended:true}))

//for admin Routes
const adminRoute=require('./routes/adminRoute')


//for user Routes
const userRoutes = require('./routes/userRoute');

//for category Routes

const categoryRoute = require('./routes/categoryRoute');

const productRoute = require('./routes/productRoute');

app.use('/', userRoutes);
app.use('/admin',adminRoute);
app.use('/admin',categoryRoute)
app.use('/admin',productRoute)



app.listen(3000, () => console.log('It\'s running '));
