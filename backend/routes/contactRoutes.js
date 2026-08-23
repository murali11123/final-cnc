const express = require('express');
const router = express.Router();
const { createMessage, getMessages } = require('../controllers/contactController');

// Public: submit a contact form
router.post('/', createMessage);

// View submitted messages (no auth - see README security note)
router.get('/', getMessages);

module.exports = router;
