const Chat = require('../models/Chat');
const Booking = require('../models/Booking');

// Fetch chat history for a specific booking
exports.getChatHistory = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    // Verify booking belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify the requesting user is either the customer or the worker
    if (String(booking.userId) !== userId && String(booking.workerId) !== userId) {
      // Allow if request is admin
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    const messages = await Chat.find({ bookingId })
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history'
    });
  }
};

// Send a chat message (HTTP fallback/attachments)
exports.sendMessage = async (req, res) => {
  try {
    const { bookingId, text, fileUrl, fileType, fileName } = req.body;
    const senderId = req.user.id;
    const senderModel = req.user.role === 'WORKER' ? 'Worker' : 'User';

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const message = await Chat.create({
      bookingId,
      senderId,
      senderModel,
      text: text || '',
      fileUrl: fileUrl || null,
      fileType: fileType || 'none',
      fileName: fileName || null,
      readBy: [senderId]
    });

    // Emit live message event to the booking room
    const io = req.app.get('io');
    if (io) {
      io.to(`booking_${bookingId}`).emit('chat:message_received', message);
    }

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};
