const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Middleware to check if user is logged in
function ensureAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
}

// Get messages for Aadi and Mom
router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        // Check if the user is 'Mom'
        const isMom = req.session.user === 'Mom';

        // Fetch all messages from the database
        const messages = await Message.find().sort({ createdAt: -1 });

        // Render the view based on user type
        res.render('index', { 
            messages, 
            isMom,
            isLoggedIn: true // Ensure this value is included for the template
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { code: 500, message: 'Server Error' });
    }
});

// Send message
router.post('/send-message', ensureAuthenticated, async (req, res) => {
    try {
        const newMessage = new Message({
            text: req.body.message,
            from: req.session.user
        });
        await newMessage.save();
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { code: 500, message: 'Server Error' });
    }
});

// Delete message
router.delete('/delete-message/:id', ensureAuthenticated, async (req, res) => {
    try {
        const result = await Message.findByIdAndDelete(req.params.id);
        if (result) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { code: 500, message: 'Server Error' });
    }
});

// Login page
router.get('/login', (req, res) => {
    res.render('login');
});

// Handle login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === 'Aadi' && password === 'Aadi') {
        req.session.user = username;
        res.redirect('/');
    } else if (username === 'Mom' && password === 'Mom') {
        req.session.user = username;
        res.redirect('/');
    } else {
        res.status(401).render('error', { code: 401, message: 'Invalid username or password' });
    }
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
            res.status(500).render('error', { code: 500, message: 'Error logging out' });
        } else {
            res.redirect('/login');
        }
    });
});

module.exports = router;