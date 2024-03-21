const User = require('../model/userModel')
const Product = require('../model/productModel')
const Cart = require('../model/cartModel')
const Address = require('../model/addressModel')



const addToCart = async (req, res) => {
    try {

        const { productId } = req.body;
        const userId = req.session.user_id;
        const user = await User.findById(userId);

        if (!user) {
            return res.json({ status: false, message: 'User not found' });
        }
        const product = await Product.findById(productId);
        console.log("product", product);
        if (!product) {
            return res.status(404).json({ status: false, message: 'Product not found' });
        }
        if (product.quantity <= 0) {
            return res.status(200).json({ status: false, message: 'Product out of stock' });
        }

        const cartItem = await Cart.findOne({ userId, productId: product._id });

        if (cartItem && cartItem.quantity >= product.quantity) {
            return res.status(200).json({ status: false, message: 'Maximum quantity per person reached' });
        }

        // Calculate the maximum quantity per person based on the product's quantity
        const maxQuantityPerPerson = product.quantity;

        // Calculate the quantity to add to the cart
        const quantityToAdd = Math.min(1, maxQuantityPerPerson); // Add 1 item or remaining stock
        console.log("quantityToAdd", quantityToAdd);

      const aleadyExist=await Cart.findOne({userId:userId,productId:productId})
      if(aleadyExist){
        await  Cart.updateOne({userId:userId,productId:productId},{$inc:{quantity:quantityToAdd,price:product.price}})

      }else{
          const newCart = new Cart({
              userId: userId,
              productId: productId,
              price: product.price
          })

          await newCart.save()
      }



        // Update the cart
        //  const cartvalue=   await Cart.updateOne(
        //         { userId:userId, productId: product._id },
        //         { $inc: { quantity: quantityToAdd } },
        //         {price:product.price * quantityToAdd},
        //         { upsert: true }
        //     );
        //     console.log('cart',cartvalue);

        res.json({ status: true, message: 'Product added to cart successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};




const cartLoaded = async (req, res) => {
    try {
        console.log("hello");
        const userId = req.session.user_id;
        console.log('userId',userId);
        const carts = await Cart.find({ userId }).populate('productId');
        console.log('carts',carts);
        const cartItemCount = carts.reduce((acc, cartItem) => acc + cartItem.quantity, 0);
        const totalPrice = carts.reduce((acc, cartItem) => {
            return acc + (cartItem.productId.price * cartItem.quantity);
        }, 0);
        console.log('totalPrice',totalPrice);
        res.render('users/cart', { cart: carts, cartItemCount: cartItemCount, totalPrice: totalPrice });
    } catch (error) {
        console.log(error.message);
        console.log('hiiiiiiiiiiiiiiiii');
        res.status(500).send('Internal server error');
    }
};



const updateCartItemQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        const userId = req.session.user_id;

        await Cart.updateOne({ userId, productId }, { quantity });
        const updatedCart = await Cart.find({ userId }).populate('productId');
        const totalPrice = updatedCart.reduce((acc, cartItem) => acc + (cartItem.productId.price * cartItem.quantity), 0);
        const productTotal = updatedCart.find(cartItem => cartItem.productId._id.toString() === productId).productId.price * quantity;

        res.json({ status: true, message: 'Cart item quantity updated successfully', cart: updatedCart, totalPrice, productTotal });
    } catch (error) {
        console.error("Error updating cart item quantity:", error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



// cart Removed

const cartRemove = async (req, res) => {
    try {
        const productId = req.body.productId
        const userId = req.session.user_id

        await Cart.deleteOne({ userId, productId })
        res.json({ status: true })

    } catch (error) {
        console.error('Error removing product from cart:', error);
        res.json({ status: false });
    }
}


const getCartCount = async (req,res) => {
    try {
       
        const userId = req.session.user_id
        const cartCount = await Cart.countDocuments({ userId})
        res.status(200).json({ cartCount })
    } catch (error) {
        console.error('Error fetching cart count:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}



module.exports = {
    addToCart,
    cartLoaded,
    updateCartItemQuantity,
    cartRemove,
    getCartCount
}