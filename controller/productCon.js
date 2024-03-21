const User = require('../model/userModel')
const Category = require ('../model/categoryModel')
const Product = require ('../model/productModel')


const productsLoad = async (req, res) => {
    try {
        const categories = await Category.find({ status: true });
        res.render('addProduct', {Data: categories });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}

// Add Products
const addProducts = async (req, res) => {
        
    try {
        const productImages = req.files.map(file => { 
            return file.filename})
        const { productName, productCategory, productPrice, productQuantity, productSize, productDescription } = req.body;
        const newProduct = new Product({
            name: productName,
            category:productCategory,
            price: productPrice,
            image:productImages,
            quantity: productQuantity,
            size: productSize,
            description: productDescription
        });
        console.log('new product:',newProduct);

        await newProduct.save(); 
        res.redirect('/admin/products'); 
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error"+ error.message);
    }
}




const productLists = async (req, res) => {
    try {createdAt: -1
        const Products = await Product.find({}).populate("category").sort({  });
        res.render('products', { Products });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}


const editLoad = async (req, res) => {
    console.log("editLoad route accessed");
    try {
       const productId = req.params.productId
       const product = await Product.findById(productId)
        const categories = await Category.find( {status:true} )
        res.render('editProduct', { categories,product,productId ,  i: 0});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
}




const editProduct = async (req,res) => {
    
    const productId = req.params.productId;
    
    const {productName, productCategory, productPrice, productQuantity, productSize, productDescription } = req.body;
    
    const images=req.files.map(file=>file.filename)
    let old=await Product.findOne({_id:productId});
    console.log(old+'kkk');
    let image=[]
    for(let i=0;i<old.image.length;i++){
        if(old.image[i]!==req.body.kk[i]){
            images.forEach(e=>{
                if(e.split('-')[1]==req.body.kk[i].split('-')[1]){
                    image[i]=e 
                }
            })
        }else{
            console.log(req.body.kk[i],old.image[i]);
            image[i]=old.image[i]
        }
    }

    try {
      
        const updateProduct = await Product.findOneAndUpdate ({_id:productId}, {$set:
          {  name:productName, 
            category:productCategory,
            price:productPrice,
            image:image,
            quantity:productQuantity,
            size:productSize,
            description:productDescription,}

        }, {new: true})
        
        if (!updateProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        if (req.file) {
            updateProduct.image = req.file.filename; 
            await updateProduct.save();
        }    
            res.redirect('/admin/products')
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



const deleteEditProduct = async (req,res) => {
    try {
        const imageName = req.params.imageName;
        const imagePath = path.join(__dirname, 'upload', imageName);
        if (fs.existsSync(imagePath)) {
            fs.unlink(imagePath, async (err) => {
            if (err) {
                console.error('Error deleting image:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
                console.log('Image deleted:', imageName);
                try {
                    const productId = req.params.productId;
                    const product = await Product.findById(productId);
                    if (!product) {
                        return res.status(404).json({ error: 'Product not found' });
                    }
                    product.image = product.image.filter(image => image !== imageName);
                    await product.save();

                    res.status(200).json({ message: 'Image deleted successfully' });
                } catch (error) {
                    console.error('Error updating database:', error);
                    res.status(500).json({ error: 'Internal server error' });
                }
            });
        
        } else {
            res.status(404).json({ error: 'Image not found' });
            }
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}




const updateProductStatus = async (req, res) => {
    console.log('updateProductStatus');

    try {
        const productId = req.params.id;
        console.log('productId', productId);
        const product = await Product.findById(productId);
        console.log('product', product);

        // Check if confirmation query parameter is present and equals 'true'
        const isConfirmed = req.query.confirm === 'true';

        if (isConfirmed) {
            // If confirmation is received, proceed with updating the product status
            product.status = !product.status;
            await product.save();
            res.json({ status: product.status });
        } else {
            // If confirmation is not received, send a confirmation request to the client
            res.status(200).json({ confirm: true, message: "Are you sure you want to update the product status?" });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};



const deleteProduct = async (req, res) => {
    try {

        const productId = req.params.id;
        console.log("deleteion");
        console.log("parmas : ",req.params);
        const deleted = await Product.findOneAndDelete({ _id: productId });
        res.status(200).json({ message: "deleted successfully" });

    } catch (error) {
        console.error(error.message)
    }
}


// const sortProducts = async (req, res) => {
//     try {
//         let product = await Product.find();
//         const { sortBy } = req.query;
//         if (sortBy === 'az') {
//             product = product.sort((a, b) => a.name.localeCompare(b.name));
//         } else if (sortBy === 'za') {
//             product = product.sort((a, b) => b.name.localeCompare(a.name));
//         } else if (sortBy === 'priceLowToHigh') {
//             product = product.sort((a, b) => a.price - b.price);
//         } else if (sortBy === 'priceHighToLow') {
//             product = product.sort((a, b) => b.price - a.price);
//         }

//         const newProducts = await fetchNewProducts();
//         res.render('users/shop', { product , newProducts });
//     } catch (error) {
//         console.error('Error fetching products:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

const sortProducts = async (req, res) => {
    try {
        const fetchNewProducts = async () => {
            try {
                const newProducts = await Product.find({ isNew: true }).populate('category'); 
                return newProducts;
            } catch (error) {
                console.error('Error fetching new products:', error);
                throw error; 
            }
        };

        let products = await Product.find();
        const newProducts = await fetchNewProducts(); 
        const { sortBy } = req.query;
        if (sortBy === 'az') {
            products = products.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'za') {
            products = products.sort((a, b) => b.name.localeCompare(a.name));
        } else if (sortBy === 'priceLowToHigh') {
            products = products.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'priceHighToLow') {
            products = products.sort((a, b) => b.price - a.price);
        }

        res.render('users/shop', { products, newProducts });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


module.exports = {
    productsLoad,
    addProducts,
    productLists,
    editLoad,
    editProduct,
    deleteEditProduct,
    deleteProduct,
    updateProductStatus,
    sortProducts

};
