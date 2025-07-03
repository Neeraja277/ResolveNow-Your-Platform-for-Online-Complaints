const express = require('express');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply auth and admin authorization to all routes
router.use(auth);
router.use(authorize('admin'));

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/stats', async (req, res) => {
  try {
    const [
      totalComplaints,
      totalUsers,
      totalAgents,
      complaintStats
    ] = await Promise.all([
      Complaint.countDocuments(),
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'agent' }),
      Complaint.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const stats = {
      totalComplaints,
      totalUsers,
      totalAgents,
      pendingComplaints: 0,
      inProgressComplaints: 0,
      resolvedComplaints: 0,
      closedComplaints: 0
    };

    complaintStats.forEach(stat => {
      switch (stat._id) {
        case 'pending':
          stats.pendingComplaints = stat.count;
          break;
        case 'in-progress':
          stats.inProgressComplaints = stat.count;
          break;
        case 'resolved':
          stats.resolvedComplaints = stat.count;
          break;
        case 'closed':
          stats.closedComplaints = stat.count;
          break;
      }
    });

    res.json(stats);
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error fetching admin statistics' });
  }
});

// @route   GET /api/admin/recent-complaints
// @desc    Get recent complaints for admin dashboard
// @access  Private (Admin only)
router.get('/recent-complaints', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const complaints = await Complaint.find()
      .populate('user', 'name email')
      .populate('assignedAgent', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({ complaints });
  } catch (error) {
    console.error('Recent complaints fetch error:', error);
    res.status(500).json({ message: 'Server error fetching recent complaints' });
  }
});

// @route   GET /api/admin/complaints
// @desc    Get all complaints with filtering and pagination
// @access  Private (Admin only)
router.get('/complaints', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Apply filters
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }
    if (req.query.assignedAgent) {
      filter.assignedAgent = req.query.assignedAgent;
    }

    const complaints = await Complaint.find(filter)
      .populate('user', 'name email')
      .populate('assignedAgent', 'name email')
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
    console.error('Admin complaints fetch error:', error);
    res.status(500).json({ message: 'Server error fetching complaints' });
  }
});

// @route   PUT /api/admin/complaints/:id/assign
// @desc    Assign complaint to an agent
// @access  Private (Admin only)
router.put('/complaints/:id/assign', async (req, res) => {
  try {
    const { agentId } = req.body;
    
    // Verify agent exists and has agent role
    const agent = await User.findOne({ _id: agentId, role: 'agent' });
    if (!agent) {
      return res.status(400).json({ message: 'Invalid agent ID' });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { 
        assignedAgent: agentId,
        status: 'in-progress'
      },
      { new: true }
    ).populate('user', 'name email').populate('assignedAgent', 'name email');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.emit('complaint-assigned', {
      complaintId: complaint._id,
      agentName: agent.name,
      message: 'Complaint has been assigned to an agent'
    });

    res.json({
      message: 'Complaint assigned successfully',
      complaint
    });
  } catch (error) {
    console.error('Complaint assignment error:', error);
    res.status(500).json({ message: 'Server error assigning complaint' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with filtering and pagination
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    if (req.query.role) {
      filter.role = req.query.role;
    }
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Admin only)
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'agent', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('User role update error:', error);
    res.status(500).json({ message: 'Server error updating user role' });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Activate/Deactivate user account
// @access  Private (Admin only)
router.put('/users/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: `User account ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('User status update error:', error);
    res.status(500).json({ message: 'Server error updating user status' });
  }
});

// @route   GET /api/admin/agents
// @desc    Get all agents for assignment dropdown
// @access  Private (Admin only)
router.get('/agents', async (req, res) => {
  try {
    const agents = await User.find({ 
      role: 'agent', 
      isActive: true 
    }).select('name email');

    res.json({ agents });
  } catch (error) {
    console.error('Agents fetch error:', error);
    res.status(500).json({ message: 'Server error fetching agents' });
  }
});

module.exports = router;