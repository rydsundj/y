import xss from "xss";
import validator from "validator";
import { Message, User } from "./db.mjs";
import jwt from "jsonwebtoken";
const secretKey = 'y_key';

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; 
  
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    try {
      const decoded = jwt.verify(token, secretKey);
      req.user = decoded; 
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };


// Function to find a user by email
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Check if the user already exists by email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }

        // Create a new user
        const newUser = new User({ username, email, password });
        await newUser.save();

        res.status(200).json(newUser);
    } catch (error) {
        console.error('Registration failed:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};


// Correct login function to handle API requests
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && await user.comparePassword(password)) {
            const token = jwt.sign({ username: user.username, id: user._id }, secretKey, { expiresIn: '1h' });
            return res.status(200).json({ token, user }); 
        } else if (!user) {
            return res.status(400).json({ error: "User doesn't exist" }); 
        } else {
            return res.status(400).json({ error: "Invalid credentials" });
        }
    } catch (error) {
        console.error('Login failed:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
};



//Search for users in the db
const searchUsers = async (req, res) => {
    const searchQuery = req.query.q; 
    if (!searchQuery || searchQuery.trim() === "") {
        return res.status(400).json({ error: "Search query is required" });
    }
    try {
        const users = await User.find({
            username: { $regex: searchQuery, $options: 'i' } 
        });

        if (users.length === 0) {
            return res.status(404).json({ error: "No users found" });
        }
        res.status(200).json(users);
    } catch (error) {

        console.error("Error searching users:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const sendFriendRequest = async (req, res) => {
    const { senderUsername, receiverUsername } = req.body;
    try {
        // Find the sender and receiver users
        const sender = await User.findOne({ username: senderUsername });
        const receiver = await User.findOne({ username: receiverUsername });

        if (!sender || !receiver) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if a friend request is already sent
        if (receiver.friendRequests.includes(sender._id)) {
            return res.status(400).json({ error: "Friend request already sent" });
        }

        // Add sender's ID to receiver's friend requests
        receiver.friendRequests.push(sender._id);
        await receiver.save();

        res.status(200).json({ message: "Friend request sent" });
    } catch (error) {
        console.error("Error sending friend request:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const fetchFriendRequest = async (req, res) => {
    const { username } = req.query;
    if (!username) {
        return res.status(400).json({ error: "Username is required" });
    }

    try {
        const user = await User.findOne({ username }).populate('friendRequests', 'username');
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Return the friend requests (populated with usernames)
        res.status(200).json(user.friendRequests);
    } catch (error) {
        console.error("Error fetching friend requests:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};



const acceptFriendRequest = async (req, res) => {
    const { senderUsername, receiverUsername } = req.body;


    try {
        // Find both users by their usernames
        const sender = await User.findOne({ username: senderUsername });
        const receiver = await User.findOne({ username: receiverUsername });

        if (!sender || !receiver) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if the sender's request exists in the receiver's friendRequests
        if (!receiver.friendRequests.includes(sender._id)) {
            return res.status(400).json({ error: "No friend request found" });
        }

        // Add each other to friends list
        sender.friends.push(receiver._id);
        receiver.friends.push(sender._id);

        // Remove the friend request from the receiver's friendRequests
        receiver.friendRequests = receiver.friendRequests.filter(
            (id) => id.toString() !== sender._id.toString()
        );        

        await sender.save();
        await receiver.save();

        res.status(200).json({ message: "Friend request accepted" });
    } catch (error) {
        console.error("Error accepting friend request:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


const fetchFriends = async (req, res) => {
    const { username } = req.query;
    if (!username) {
        return res.status(400).json({ error: "Username is required" });
    }

    try {
        // Find the user and populate the friends' usernames
        const user = await User.findOne({ username }).populate('friends', 'username');
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Return the populated friends (with just the username)
        res.status(200).json(user.friends);
    } catch (error) {
        console.error("Error fetching friends:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Check if two users are friends
const checkFriendship = async (req, res) => {
    const { loggedInUsername, profileUsername } = req.query;
    if (!loggedInUsername || !profileUsername) {
        return res.status(400).json({ error: "Both usernames are required" });
    }

    try {
        const loggedInUser = await User.findOne({ username: loggedInUsername }).populate('friends', 'username');
        const profileUser = await User.findOne({ username: profileUsername }).populate('friends', 'username');

        if (!loggedInUser || !profileUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if the profile user is in the logged-in user's friends list
        const isFriends = loggedInUser.friends.some(friend => friend.username === profileUsername);

        // Check if there's a pending friend request
        const isRequestPending = profileUser.friendRequests.includes(loggedInUser._id);
        
        // Check if there's a pending friend request from loggedInUser to profileUser
        const isRequestReceived = loggedInUser.friendRequests.includes(profileUser._id);

        res.status(200).json({ isFriends, isRequestPending, isRequestReceived });
    } catch (error) {
        console.error("Error checking friendship status:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};



const postMessage = async (req, res) => {
    verifyToken(req, res, async () => {
    try {
        const { name, message, time } = req.body;

        if (!name || !message) {
            return res.status(400).json({ error: "Name and message required" });
        }

        if (!validator.isLength(message, { min: 1, max: 140 })) {
            return res.status(400).json({ error: "Message must be between 1 and 100 characters" });
        }
        const checkedMsg = xss(message);

        const newMessage = new Message({ name, message: checkedMsg, time });
        await newMessage.save();

        res.status(200).json(newMessage);
    } catch (error) {
        console.error("Error saving message:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
};

// Fetch messages by username
const getMessagesByUsername = async (req, res) => {
    try {
        const { username } = req.query;

        if (!username) {
            return res.status(400).json({ error: "Username is required" });
        }

        // Fetch all messages for the specified username
        const messages = await Message.find({ name: username });

        if (!messages.length) {
            return res.status(404).json({ error: "No messages found for this user" });
        }
        
        res.json(messages);
    } catch (error) {
        console.error("Error retrieving messages by username:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


// Send a message between friends
const postFriendMessage = async (req, res) => {
    verifyToken(req, res, async () => {
    try {
        const { senderUsername, recipientUsername, message, time } = req.body;

        // Validate inputs
        if (!senderUsername || !recipientUsername || !message) {
            return res.status(400).json({ error: "Sender username, recipient username, and message are required" });
        }

        // Check message length
        if (!validator.isLength(message, { min: 1, max: 140 })) {
            return res.status(400).json({ error: "Message must be between 1 and 140 characters" });
        }

        const sanitizedMessage = xss(message); // Sanitize the message to prevent XSS

        // Create a new message object
        const newMessage = new Message({ 
            sender: senderUsername,
            name: recipientUsername, 
            message: sanitizedMessage, 
            time,
        });

        // Save the message in the database
        await newMessage.save();

        // Respond with the newly created message
        res.status(200).json(newMessage);
    } catch (error) {
        console.error("Error saving friend message:", error);
        res.status(500).json({ error: "Internal server error" });
    }
})
};




export { postMessage, getMessagesByUsername, registerUser, loginUser, searchUsers, sendFriendRequest, acceptFriendRequest, fetchFriendRequest, fetchFriends, checkFriendship, postFriendMessage};