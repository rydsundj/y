import express from 'express';
import {
    postMessage,
    registerUser,
    loginUser,
    searchUsers,
    getMessagesByUsername,
    sendFriendRequest,
    acceptFriendRequest,
    fetchFriendRequest,
    fetchFriends,
    checkFriendship,
    postFriendMessage
} from './routeFunctions.mjs';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/messages', postMessage);
router.get('/search-users', searchUsers);
router.get("/messages", getMessagesByUsername);
router.post('/send-friend-request', sendFriendRequest);
router.patch('/accept-friend-request', acceptFriendRequest);
router.get('/fetch-friend-request', fetchFriendRequest)
router.get('/fetch-friends', fetchFriends),
router.get('/check-friendship', checkFriendship),
router.post("/send-friend-message", postFriendMessage)

// Return 404 error for non-existing routes
router.use((req, res) => {
    res.status(404).json({ error: "404! Page not found" });
});

// Return 405 error for method not allowed
router.use((req, res, next) => {
    if (!['GET', 'POST', 'PATCH'].includes(req.method)) {
        return res.status(405).json({ error: "405! Method not allowed" });
    }
    next();
});




export default router;