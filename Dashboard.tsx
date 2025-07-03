import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface DashboardStats {
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  inProgressComplaints: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    inProgressComplaints: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/complaints/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
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
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="display-6 fw-bold">Welcome back, {user?.name}!</h1>
              <p className="text-muted">Here's an overview of your complaint management activity</p>
            </div>
            <Link to="/submit-complaint" className="btn btn-primary">
              <i className="fas fa-plus me-2"></i>
              New Complaint
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
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
        
        <div className="col-md-3">
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
        
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="dashboard-card bg-info">
                <i className="fas fa-cog fa-2x mb-2"></i>
                <h3>{stats.inProgressComplaints}</h3>
                <p className="mb-0">In Progress</p>
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
                <p className="mb-0">Resolved</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row">
        <div className="col-12">
          <h3 className="mb-4">Quick Actions</h3>
        </div>
        
        <div className="col-md-4 mb-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center p-4">
              <i className="fas fa-plus-circle fa-3x text-primary mb-3"></i>
              <h5>Submit New Complaint</h5>
              <p className="text-muted mb-3">
                Register a new complaint with detailed information and attachments.
              </p>
              <Link to="/submit-complaint" className="btn btn-primary">
                Submit Complaint
              </Link>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 mb-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center p-4">
              <i className="fas fa-list fa-3x text-success mb-3"></i>
              <h5>View My Complaints</h5>
              <p className="text-muted mb-3">
                Track the status and progress of all your submitted complaints.
              </p>
              <Link to="/my-complaints" className="btn btn-success">
                View Complaints
              </Link>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 mb-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center p-4">
              <i className="fas fa-chart-bar fa-3x text-info mb-3"></i>
              <h5>Complaint Analytics</h5>
              <p className="text-muted mb-3">
                View detailed analytics and reports of your complaint history.
              </p>
              <button className="btn btn-info" disabled>
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;