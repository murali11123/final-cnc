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

// GET /api/contact - Retrieve all contact messages (Admin Protected)
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error('Fetch messages error:', error.message);
    res.status(500).json({ message: 'Failed to retrieve messages.' });
  }
};

// PUT /api/contact/:id - Update message status (Admin Protected)
const updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['unread', 'read', 'replied'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Message not found.' });
    }

    res.json({ message: 'Message status updated successfully.', data: message });
  } catch (error) {
    console.error('Update message error:', error.message);
    res.status(500).json({ message: 'Failed to update message status.' });
  }
};

// DELETE /api/contact/:id - Delete a message (Admin Protected)
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found.' });
    }
    res.json({ message: 'Message deleted successfully.' });
  } catch (error) {
    console.error('Delete message error:', error.message);
    res.status(500).json({ message: 'Failed to delete message.' });
  }
};

module.exports = {
  createMessage,
  getMessages,
  updateMessageStatus,
  deleteMessage
};
