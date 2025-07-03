import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface AdminStats {
  totalComplaints: number;
  totalUsers: number;
  totalAgents: number;
  pendingComplaints: number;
  resolvedComplaints: number;
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

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalComplaints: 0,
    totalUsers: 0,
    totalAgents: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0
  });
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsResponse, complaintsResponse] = await Promise.all([
        axios.get('/admin/stats'),
        axios.get('/admin/recent-complaints')
      ]);
      
      setStats(statsResponse.data);
      setRecentComplaints(complaintsResponse.data.complaints);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
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
            <i className="fas fa-tachometer-alt me-2"></i>
            Admin Dashboard
          </h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-2">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="dashboard-card bg-primary">
                <i className="fas fa-clipboard-list fa-2x mb-2"></i>
                <h3>{stats.totalComplaints}</h3>
                <p className="mb-0">Total Complaints</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-2">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="dashboard-card bg-success">
                <i className="fas fa-users fa-2x mb-2"></i>
                <h3>{stats.totalUsers}</h3>
                <p className="mb-0">Total Users</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-2">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="dashboard-card bg-info">
                <i className="fas fa-user-tie fa-2x mb-2"></i>
                <h3>{stats.totalAgents}</h3>
                <p className="mb-0">Total Agents</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="dashboard-card bg-warning">
                <i className="fas fa-clock fa-2x mb-2"></i>
                <h3>{stats.pendingComplaints}</h3>
                <p className="mb-0">Pending Complaints</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="dashboard-card bg-success">
                <i className="fas fa-check-circle fa-2x mb-2"></i>
                <h3>{stats.resolvedComplaints}</h3>
                <p className="mb-0">Resolved Complaints</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-list me-2"></i>
                Recent Complaints
              </h5>
            </div>
            <div className="card-body">
              {recentComplaints.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No recent complaints found.</p>
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
                      {recentComplaints.map((complaint) => (
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
                            <span className={`badge ${
                              complaint.status === 'pending' ? 'bg-warning' :
                              complaint.status === 'in-progress' ? 'bg-info' :
                              complaint.status === 'resolved' ? 'bg-success' : 'bg-danger'
                            }`}>
                              {complaint.status.replace('-', ' ').toUpperCase()}
                            </span>
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
                            <button className="btn btn-sm btn-outline-primary">
                              <i className="fas fa-eye"></i>
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

export default AdminDashboard;