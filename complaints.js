const express = require('express');
const { body, validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/complaints
// @desc    Create a new complaint
// @access  Private
router.post('/', [
  auth,
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .isIn(['Product Quality', 'Service Issue', 'Billing Problem', 'Delivery Issue', 'Technical Support', 'Other'])
    .withMessage('Please select a valid category'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Please select a valid priority level')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, category, priority, contactPhone, address } = req.body;

    const complaint = new Complaint({
      title,
      description,
      category,
      priority: priority || 'medium',
      contactPhone,
      address,
      user: req.user._id
    });

    await complaint.save();
    await complaint.populate('user', 'name email');

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.emit('new-complaint', {
      complaint: complaint.toObject(),
      message: 'New complaint submitted'
    });

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint
    });
  } catch (error) {
    console.error('Complaint creation error:', error);
    res.status(500).json({ message: 'Server error creating complaint' });
  }
});

// @route   GET /api/complaints/my-complaints
// @desc    Get user's complaints
// @access  Private
router.get('/my-complaints', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const complaints = await Complaint.find({ user: req.user._id })
      .populate('assignedAgent', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Complaint.countDocuments({ user: req.user._id });

    res.json({
      complaints,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Fetch complaints error:', error);
    res.status(500).json({ message: 'Server error fetching complaints' });
  }
});

// @route   GET /api/complaints/stats
// @desc    Get user's complaint statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Complaint.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      totalComplaints: 0,
      pendingComplaints: 0,
      inProgressComplaints: 0,
      resolvedComplaints: 0,
      closedComplaints: 0
    };

    stats.forEach(stat => {
      result.totalComplaints += stat.count;
      switch (stat._id) {
        case 'pending':
          result.pendingComplaints = stat.count;
          break;
        case 'in-progress':
          result.inProgressComplaints = stat.count;
          break;
        case 'resolved':
          result.resolvedComplaints = stat.count;
          break;
        case 'closed':
          result.closedComplaints = stat.count;
          break;
      }
    });

    res.json(result);
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
});

// @route   GET /api/complaints/:id
// @desc    Get complaint details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'name email')
      .populate('assignedAgent', 'name email');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if user owns the complaint or is an agent/admin
    if (complaint.user._id.toString() !== req.user._id.toString() && 
        req.user.role === 'user') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ complaint });
  } catch (error) {
    console.error('Complaint fetch error:', error);
    res.status(500).json({ message: 'Server error fetching complaint' });
  }
});

// @route   GET /api/complaints/:id/messages
// @desc    Get complaint messages
// @access  Private
router.get('/:id/messages', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check access permissions
    if (complaint.user.toString() !== req.user._id.toString() && 
        req.user.role === 'user') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ complaint: req.params.id })
      .populate('sender', 'name email role')
      .sort({ createdAt: 1 });

    const formattedMessages = messages.map(message => ({
      id: message._id,
      content: message.content,
      sender: message.sender.role === 'user' ? 'user' : 'agent',
      senderName: message.sender.name,
      createdAt: message.createdAt
    }));

    res.json({ messages: formattedMessages });
  } catch (error) {
    console.error('Messages fetch error:', error);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
});

// @route   POST /api/complaints/:id/messages
// @desc    Send a message for a complaint
// @access  Private
router.post('/:id/messages', [
  auth,
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check access permissions
    if (complaint.user.toString() !== req.user._id.toString() && 
        req.user.role === 'user') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const message = new Message({
      complaint: req.params.id,
      sender: req.user._id,
      content: req.body.content
    });

    await message.save();
    await message.populate('sender', 'name email role');

    // Emit socket event for real-time messaging
    const io = req.app.get('io');
    io.to(req.params.id).emit('new-message', {
      id: message._id,
      content: message.content,
      sender: message.sender.role === 'user' ? 'user' : 'agent',
      senderName: message.sender.name,
      createdAt: message.createdAt
    });

    res.status(201).json({
      message: 'Message sent successfully',
      messageData: {
        id: message._id,
        content: message.content,
        sender: message.sender.role === 'user' ? 'user' : 'agent',
        senderName: message.sender.name,
        createdAt: message.createdAt
      }
    });
  } catch (error) {
    console.error('Message send error:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
});

module.exports = router;
