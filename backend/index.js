require('dotenv').config();
const port = process.env.PORT || 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { type } = require("os");
const { error } = require("console");

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection with MongoDB
mongoose.connect(process.env.MONGODB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log("Error: " + err));

// API Creation
app.get("/", (req, res) => {
    res.send("Express App is Running");
});

// Image Storage Engine
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
      return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

// Creating Upload Endpoints for Images
app.use('/images', express.static('upload/images'));
app.post("/upload", upload.single('product'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    });
});

// Schema for creating Products
const productSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    new_price: {
        type: Number,
        required: true
    },
    old_price: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    available: {
        type: Boolean,
        default: true
    }
});

const Product = mongoose.model("Product", productSchema);

app.post('/addproduct', async (req, res) => {
    let products = await Product.find({});
    let id;
    if (products.length > 0) {
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id + 1;
    } else {
        id = 1;
    }
    try {
        const product = new Product({
            id: id,
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price
        });
        await product.save();
        console.log("Saved");
        res.json({
            success: true,
            name: req.body.name,
        });
    } catch (error) {
        res.status(500).json({ error: "Error saving product" });
    }
});

//Creating API fro deleting the product

app.post('/removeproduct', async (req, res)=>{
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success:true,
        name:req.body.name
    })
    
})

//Creating API for getting all products
app.get('/allproducts', async(req, res)=>{
    let products = await Product.find({});
    console.log("All products fetched");
    res.send(products)
    
})



// Schema created for user models
const Users = mongoose.model('Users', {
  name: {
    type: String
  },
  email: {
    type: String,
    unique: true
  },
  password: {
    type: String
  },
  cartData: {
    type: Object
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Creating endpoint for registering the user
app.post('/signup', async (req, res) => {
  try {
    let check = await Users.findOne({ email: req.body.email });
    if (check) {
      return res.status(400).json({ success: false, error: "Existing user found with same email ID" });
    }

    let cart = {};
    for (let i = 0; i < 300; i++) {
      cart[i] = 0;
    }

    const user = new Users({
      name: req.body.username,
      email: req.body.email,
      password: req.body.password,
      cartData: cart
    });

    await user.save();

    const data = {
      user: {
        id: user.id
      }
    };

    const token = jwt.sign(data, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Creating endpoint for user login
app.post('/login', async (req, res) => {
  try {
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
      const passCompare = req.body.password === user.password;
      if (passCompare) {
        const data = {
          user: {
            id: user.id
          }
        };
        const token = jwt.sign(data, process.env.JWT_SECRET);
        res.json({ success: true, token });
      } else {
        res.json({ success: false, errors: "Wrong Password" });
      }
    } else {
      res.json({ success: false, errors: "Wrong Email Id" });
    }
  } catch (error) {
    res.status(500).json({ success: false, errors: "Server error" });
  }
});

app.get('/newcollection', async(req,res)=>{
  let product = await Product.find({});
  let newcollection = product.slice(1).slice(-8);
  console.log("new collection fetched")
  res.send(newcollection)
})

//creating endpoint for popular in woman section

app.get('/popularinwoman',async(req, res)=>{
  let products = await Product.find({category:"women"})
  let populat_in_women = products.slice(0,4);
  console.log("Popular in woman fetched")
  res.send(populat_in_women)
})

// Creating middleware to fetch user
const fetchUser = async (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) {
    return res.status(401).send({ errors: "Please authenticate using valid token" });
  }
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
};

// creating an endpoint for adding products in cartdata
app.post('/addtocart', fetchUser, async (req, res) => {
  try {
    let userData = await Users.findOne({ _id: req.user.id });
    userData.cartData[req.body.itemId] = (userData.cartData[req.body.itemId] || 0) + 1;
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    res.json({ success: true, message: "Added to cart" });
  } catch (error) {
    res.status(500).json({ success: false, errors: "Error adding to cart" });
  }
});

//creating endpoint to removr products form cartdata

app.post('/removefromcart', fetchUser, async (req, res) => {
  try {
    // Find the user based on the ID from the token
    let userData = await Users.findOne({ _id: req.user.id });

    // Get item ID from request body
    const itemId = req.body.itemId;

    // Check if item exists in cart and quantity is greater than 0
    if (userData.cartData[itemId] && userData.cartData[itemId] > 0) {
      userData.cartData[itemId] -= 1;

      // If quantity becomes 0, optionally delete the item from the cart
      if (userData.cartData[itemId] === 0) {
        delete userData.cartData[itemId];
      }

      // Save the updated cart data to the database
      await Users.findOneAndUpdate(
        { _id: req.user.id },
        { cartData: userData.cartData }
      );

      res.json({ success: true, message: "Item removed from cart" });
    } else {
      res.json({ success: false, message: "Item not in cart or already at 0 quantity" });
    }
  } catch (error) {
    res.status(500).json({ success: false, errors: "Error removing item from cart" });
  }
});

// Backend - Creating endpoint to get cartData
app.post('/getcartdata', fetchUser, async (req, res) => {
  console.log("GetCart called");  // Log to confirm the endpoint is hit
  try {
    let userData = await Users.findOne({ _id: req.user.id });
    if (userData) {
      res.json(userData.cartData);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error retrieving cart data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.listen(port, (error) => {
  if (!error) {
      console.log("Server Running on Port " + port);
  } else {
      console.log("Error: " + error);
  }
});