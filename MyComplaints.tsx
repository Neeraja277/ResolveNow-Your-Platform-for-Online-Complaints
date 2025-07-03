import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Complaint {
  id: string;
  title: string;
  category: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
}

const MyComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await axios.get('/api/complaints/my-complaints');
      setComplaints(response.data.complaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'status-badge status-pending';
      case 'in-progress':
        return 'status-badge status-in-progress';
      case 'resolved':
        return 'status-badge status-resolved';
      case 'closed':
        return 'status-badge status-closed';
      default:
        return 'status-badge status-pending';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-danger';
      case 'high':
        return 'text-warning';
      case 'medium':
        return 'text-info';
      case 'low':
        return 'text-success';
      default:
        return 'text-secondary';
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    if (filter === 'all') return true;
    return complaint.status === filter;
  });

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
              <h1 className="display-6 fw-bold">My Complaints</h1>
              <p className="text-muted">Track and manage all your submitted complaints</p>
            </div>
            <Link to="/submit-complaint" className="btn btn-primary">
              <i className="fas fa-plus me-2"></i>
              New Complaint
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('all')}
            >
              All ({complaints.length})
            </button>
            <button
              type="button"
              className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({complaints.filter(c => c.status === 'pending').length})
            </button>
            <button
              type="button"
              className={`btn ${filter === 'in-progress' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('in-progress')}
            >
              In Progress ({complaints.filter(c => c.status === 'in-progress').length})
            </button>
            <button
              type="button"
              className={`btn ${filter === 'resolved' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('resolved')}
            >
              Resolved ({complaints.filter(c => c.status === 'resolved').length})
            </button>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="row">
        <div className="col-12">
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-clipboard-list fa-4x text-muted mb-3"></i>
              <h4>No complaints found</h4>
              <p className="text-muted mb-4">
                {filter === 'all' 
                  ? "You haven't submitted any complaints yet." 
                  : `No complaints with status "${filter}" found.`
                }
              </p>
              <Link to="/submit-complaint" className="btn btn-primary">
                Submit Your First Complaint
              </Link>
            </div>
          ) : (
            <div className="row g-4">
              {filteredComplaints.map((complaint) => (
                <div key={complaint.id} className="col-md-6 col-lg-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <span className={getStatusBadgeClass(complaint.status)}>
                          {complaint.status.replace('-', ' ').toUpperCase()}
                        </span>
                        <span className={`badge ${getPriorityColor(complaint.priority)}`}>
                          <i className="fas fa-flag me-1"></i>
                          {complaint.priority.toUpperCase()}
                        </span>
                      </div>
                      
                      <h5 className="card-title">{complaint.title}</h5>
                      <p className="text-muted mb-2">
                        <i className="fas fa-tag me-1"></i>
                        {complaint.category}
                      </p>
                      
                      <div className="text-muted small mb-3">
                        <div>
                          <i className="fas fa-calendar-plus me-1"></i>
                          Created: {new Date(complaint.createdAt).toLocaleDateString()}
                        </div>
                        <div>
                          <i className="fas fa-calendar-check me-1"></i>
                          Updated: {new Date(complaint.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <Link 
                        to={`/complaint/${complaint.id}`} 
                        className="btn btn-outline-primary btn-sm w-100"
                      >
                        <i className="fas fa-eye me-2"></i>
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyComplaints;
