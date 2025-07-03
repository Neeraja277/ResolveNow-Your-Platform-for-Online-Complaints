const express = require('express');
const Complaint = require('../models/Complaint');
const Message = require('../models/Message');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply auth and agent authorization to all routes
router.use(auth);
router.use(authorize('agent'));

// @route   GET /api/agent/stats
// @desc    Get agent dashboard statistics
// @access  Private (Agent only)
router.get('/stats', async (req, res) => {
  try {
    const agentId = req.user._id;

    const stats = await Complaint.aggregate([
      { $match: { assignedAgent: agentId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      assignedComplaints: 0,
      pendingComplaints: 0,
      inProgressComplaints: 0,
      resolvedComplaints: 0
    };

    stats.forEach(stat => {
      result.assignedComplaints += stat.count;
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
      }
    });

    res.json(result);
  } catch (error) {
    console.error('Agent stats error:', error);
    res.status(500).json({ message: 'Server error fetching agent statistics' });
  }
});

// @route   GET /api/agent/assigned-complaints
// @desc    Get complaints assigned to the agent
// @access  Private (Agent only)
router.get('/assigned-complaints', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { assignedAgent: req.user._id };
    
    // Apply status filter if provided
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const complaints = await Complaint.find(filter)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Complaint.countDocuments(filter);

    res.json({
      complaints,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Assigned complaints fetch error:', error);
    res.status(500).json({ message: 'Server error fetching assigned complaints' });
  }
});

// @route   GET /api/agent/complaints/:id
// @desc    Get complaint details (agent view)
// @access  Private (Agent only)
router.get('/complaints/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      assignedAgent: req.user._id
    }).populate('user', 'name email phone address');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found or not assigned to you' });
    }

    res.json({ complaint });
  } catch (error) {
    console.error('Complaint fetch error:', error);
    res.status(500).json({ message: 'Server error fetching complaint' });
  }
});

// @route   PUT /api/agent/complaints/:id/status
// @desc    Update complaint status
// @access  Private (Agent only)
router.put('/complaints/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'in-progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const complaint = await Complaint.findOneAndUpdate(
      {
        _id: req.params.id,
        assignedAgent: req.user._id
      },
      { status },
      { new: true }
    ).populate('user', 'name email').populate('assignedAgent', 'name email');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found or not assigned to you' });
    }

    // Create system message for status update
    const systemMessage = new Message({
      complaint: complaint._id,
      sender: req.user._id,
      content: `Complaint status updated to: ${status.replace('-', ' ').toUpperCase()}`,
      messageType: 'system'
    });
    await systemMessage.save();

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.to(req.params.id).emit('status-updated', {
      complaintId: complaint._id,
      status,
      message: `Complaint status updated to ${status.replace('-', ' ')}`
    });

    res.json({
      message: 'Complaint status updated successfully',
      complaint
    });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ message: 'Server error updating complaint status' });
  }
});

// @route   PUT /api/agent/complaints/:id/resolution
// @desc    Add resolution to complaint
// @access  Private (Agent only)
router.put('/complaints/:id/resolution', async (req, res) => {
  try {
    const { resolution } = req.body;
    
    if (!resolution || resolution.trim().length === 0) {
      return res.status(400).json({ message: 'Resolution text is required' });
    }

    const complaint = await Complaint.findOneAndUpdate(
      {
        _id: req.params.id,
        assignedAgent: req.user._id
      },
      { 
        resolution: resolution.trim(),
        status: 'resolved',
        resolvedAt: new Date()
      },
      { new: true }
    ).populate('user', 'name email').populate('assignedAgent', 'name email');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found or not assigned to you' });
    }

    // Create system message for resolution
    const systemMessage = new Message({
      complaint: complaint._id,
      sender: req.user._id,
      content: `Complaint resolved: ${resolution}`,
      messageType: 'system'
    });
    await systemMessage.save();

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.to(req.params.id).emit('complaint-resolved', {
      complaintId: complaint._id,
      resolution,
      message: 'Your complaint has been resolved'
    });

    res.json({
      message: 'Complaint resolved successfully',
      complaint
    });
  } catch (error) {
    console.error('Resolution update error:', error);
    res.status(500).json({ message: 'Server error adding resolution' });
  }
});

// @route   POST /api/agent/complaints/:id/messages
// @desc    Send message to user (agent)
// @access  Private (Agent only)
router.post('/complaints/:id/messages', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Verify complaint is assigned to this agent
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      assignedAgent: req.user._id
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found or not assigned to you' });
    }

    const message = new Message({
      complaint: req.params.id,
      sender: req.user._id,
      content: content.trim()
    });

    await message.save();
    await message.populate('sender', 'name email role');

    // Emit socket event for real-time messaging
    const io = req.app.get('io');
    io.to(req.params.id).emit('new-message', {
      id: message._id,
      content: message.content,
      sender: 'agent',
      senderName: message.sender.name,
      createdAt: message.createdAt
    });

    res.status(201).json({
      message: 'Message sent successfully',
      messageData: {
        id: message._id,
        content: message.content,
        sender: 'agent',
        senderName: message.sender.name,
        createdAt: message.createdAt
      }
    });
  } catch (error) {
    console.error('Agent message send error:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
});

module.exports = router;