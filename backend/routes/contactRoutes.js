const express = require('express');
const router = express.Router();
const { createMessage, getMessages, updateMessageStatus, deleteMessage } = require('../controllers/contactController');
const { protectAdmin } = require('../middleware/auth');

// Public route to submit contact forms
router.post('/', createMessage);

// Admin protected routes for messages
router.get('/', protectAdmin, getMessages);
router.put('/:id', protectAdmin, updateMessageStatus);
router.delete('/:id', protectAdmin, deleteMessage);

module.exports = router;
