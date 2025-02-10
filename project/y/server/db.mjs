import mongoose from 'mongoose';
import bcrypt from 'bcrypt'; // For password hashing
import validator from 'validator'; 
//-------------------------------------------------
//const { MongoClient, ServerApiVersion } = require('mongodb');

import {MongoClient, ServerApiVersion} from "mongodb";
const mongoURI = "mongodb+srv://oryjo:xav890@cluster0.huxxv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(mongoURI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


//-------------------------------------------------


//utilizes callback functions ().then() and .catch()) to handle the results of the mongoose.connect() operation. 
const connectDB = async () => {
    mongoose.connect(mongoURI)
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
};

const messageSchema = new mongoose.Schema({
    sender: {type: String, required: false},
    name: {type: String, required: true},
    message: { type: String, default: true },
    time: {type: String, required: true},
    read: {type: Boolean, default: false},
});


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: (v) => validator.isEmail(v),
            message: (props) => `${props.value} is not a valid email!`
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    }],
    friendRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    }]
});

// Pre-save hook to hash the password before saving the user

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10); // Hash the password with bcrypt

    if (!this.password.startsWith('$2')) {
        this.password = await bcrypt.hash(this.password, 10); // Hash the password if it's not already hashed
    }
    next();
});


// Method to compare input password with hashed password
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};


const Message = mongoose.model('Message', messageSchema);
const User = mongoose.model('User', userSchema);




//module.exports = User;
export { connectDB, Message, User};
