import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface AgentStats {
  assignedComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
}

interface Complaint {
  id: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
}

const AgentDashboard: React.FC = () => {
  const [stats, setStats] = useState<AgentStats>({
    assignedComplaints: 0,
    resolvedComplaints: 0,
    pendingComplaints: 0
  });
  const [assignedComplaints, setAssignedComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgentData();
  }, []);

  const fetchAgentData = async () => {
    try {
      const [statsResponse, complaintsResponse] = await Promise.all([
        axios.get('/agent/stats'),
        axios.get('/agent/assigned-complaints')
      ]);
      
      setStats(statsResponse.data);
      setAssignedComplaints(complaintsResponse.data.complaints);
    } catch (error) {
      console.error('Error fetching agent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (complaintId: string, newStatus: string) => {
    try {
      await axios.put(`/agent/complaints/${complaintId}/status`, {
        status: newStatus
      });
      fetchAgentData(); // Refresh data
    } catch (error) {
      console.error('Error updating complaint status:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <h1 className="display-6 fw-bold mb-4">
            <i className="fas fa-headset me-2"></i>
            Agent Dashboard
          </h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="dashboard-card bg-primary">
                <i className="fas fa-clipboard-list fa-2x mb-2"></i>
                <h3>{stats.assignedComplaints}</h3>
                <p className="mb-0">Assigned Complaints</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="dashboard-card bg-warning">
                <i className="fas fa-clock fa-2x mb-2"></i>
                <h3>{stats.pendingComplaints}</h3>
                <p className="mb-0">Pending</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="dashboard-card bg-success">
                <i className="fas fa-check-circle fa-2x mb-2"></i>
                <h3>{stats.resolvedComplaints}</h3>
                <p className="mb-0">Resolved</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Complaints */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-tasks me-2"></i>
                My Assigned Complaints
              </h5>
            </div>
            <div className="card-body">
              {assignedComplaints.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No complaints assigned to you yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>User</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignedComplaints.map((complaint) => (
                        <tr key={complaint.id}>
                          <td>{complaint.title}</td>
                          <td>
                            <span className="badge bg-secondary">
                              {complaint.category}
                            </span>
                          </td>
                          <td>
                            <div>
                              <strong>{complaint.user.name}</strong>
                              <br />
                              <small className="text-muted">{complaint.user.email}</small>
                            </div>
                          </td>
                          <td>
                            <select
                              className="form-select form-select-sm"
                              value={complaint.status}
                              onChange={(e) => updateComplaintStatus(complaint.id, e.target.value)}
                            >
                              <option value="pending">Pending</option>
                              <option value="in-progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                              <option value="closed">Closed</option>
                            </select>
                          </td>
                          <td>
                            <span className={`badge ${
                              complaint.priority === 'urgent' ? 'bg-danger' :
                              complaint.priority === 'high' ? 'bg-warning' :
                              complaint.priority === 'medium' ? 'bg-info' : 'bg-success'
                            }`}>
                              {complaint.priority.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <small>
                              {new Date(complaint.createdAt).toLocaleDateString()}
                            </small>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary me-1">
                              <i className="fas fa-eye"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-success">
                              <i className="fas fa-comments"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;