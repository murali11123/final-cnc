const Message = require('../models/Message');

// POST /api/contact - Submit a contact message (Public)
const createMessage = async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;

    if (!name || !phone || !message) {
      return res.status(400).json({ message: 'Name, phone number, and message are required.' });
    }

    const newMessage = new Message({
      name,
      phone,
      email: email || '',
      message
    });

    await newMessage.save();
    res.status(201).json({ message: 'Your message has been sent successfully! We will contact you soon.' });
  } catch (error) {
    console.error('Contact submission error:', error.message);
    res.status(500).json({ message: 'Failed to submit contact form. Please try again.' });
  }
};

// GET /api/contact - Retrieve all contact messages
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error('Fetch messages error:', error.message);
    res.status(500).json({ message: 'Failed to retrieve messages.' });
  }
};

module.exports = {
  createMessage,
  getMessages
};
