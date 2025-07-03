import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  contactPhone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  assignedAgent?: {
    id: string;
    name: string;
    email: string;
  };
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  senderName: string;
  createdAt: string;
}

const ComplaintDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (id) {
      fetchComplaintDetails();
      fetchMessages();
    }
  }, [id]);

  const fetchComplaintDetails = async () => {
    try {
      const response = await axios.get(`/complaints/${id}`);
      setComplaint(response.data.complaint);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch complaint details');
      navigate('/my-complaints');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/complaints/${id}/messages`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSendingMessage(true);
    try {
      await axios.post(`/complaints/${id}/messages`, {
        content: newMessage
      });
      setNewMessage('');
      fetchMessages(); // Refresh messages
      toast.success('Message sent successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
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

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h3>Complaint not found</h3>
          <button onClick={() => navigate('/my-complaints')} className="btn btn-primary">
            Back to My Complaints
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <button 
            onClick={() => navigate('/my-complaints')} 
            className="btn btn-outline-secondary mb-4"
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to My Complaints
          </button>
        </div>
      </div>

      <div className="row">
        {/* Complaint Details */}
        <div className="col-lg-8">
          <div className="card shadow mb-4">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">
                <i className="fas fa-clipboard-list me-2"></i>
                Complaint Details
              </h3>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <h4>{complaint.title}</h4>
                  <p className="text-muted mb-2">
                    <i className="fas fa-tag me-1"></i>
                    {complaint.category}
                  </p>
                </div>
                <div className="col-md-6 text-md-end">
                  <span className={getStatusBadgeClass(complaint.status)}>
                    {complaint.status.replace('-', ' ').toUpperCase()}
                  </span>
                  <br />
                  <span className={`badge ${getPriorityColor(complaint.priority)} mt-2`}>
                    <i className="fas fa-flag me-1"></i>
                    {complaint.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h6>Description:</h6>
                <p className="text-muted">{complaint.description}</p>
              </div>

              {complaint.address && (
                <div className="mb-4">
                  <h6>Address:</h6>
                  <p className="text-muted">{complaint.address}</p>
                </div>
              )}

              {complaint.contactPhone && (
                <div className="mb-4">
                  <h6>Contact Phone:</h6>
                  <p className="text-muted">{complaint.contactPhone}</p>
                </div>
              )}

              <div className="row">
                <div className="col-md-6">
                  <small className="text-muted">
                    <i className="fas fa-calendar-plus me-1"></i>
                    Created: {new Date(complaint.createdAt).toLocaleString()}
                  </small>
                </div>
                <div className="col-md-6">
                  <small className="text-muted">
                    <i className="fas fa-calendar-check me-1"></i>
                    Last Updated: {new Date(complaint.updatedAt).toLocaleString()}
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Section */}
          <div className="card shadow">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">
                <i className="fas fa-comments me-2"></i>
                Communication with Agent
              </h5>
            </div>
            <div className="card-body">
              <div className="chat-container mb-3">
                {messages.length === 0 ? (
                  <div className="text-center text-muted">
                    <i className="fas fa-comments fa-3x mb-3"></i>
                    <p>No messages yet. Start a conversation with your assigned agent.</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`message ${message.sender === 'user' ? 'message-user' : 'message-agent'}`}
                    >
                      <div className="mb-1">
                        <strong>{message.senderName}</strong>
                        <small className="text-muted ms-2">
                          {new Date(message.createdAt).toLocaleString()}
                        </small>
                      </div>
                      <div>{message.content}</div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={sendMessage}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sendingMessage}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={sendingMessage || !newMessage.trim()}
                  >
                    {sendingMessage ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      <i className="fas fa-paper-plane"></i>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="card shadow">
            <div className="card-header bg-secondary text-white">
              <h6 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Complaint Information
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <strong>Complaint ID:</strong>
                <br />
                <code>{complaint.id}</code>
              </div>

              {complaint.assignedAgent && (
                <div className="mb-3">
                  <strong>Assigned Agent:</strong>
                  <br />
                  <i className="fas fa-user me-1"></i>
                  {complaint.assignedAgent.name}
                  <br />
                  <small className="text-muted">
                    <i className="fas fa-envelope me-1"></i>
                    {complaint.assignedAgent.email}
                  </small>
                </div>
              )}

              <div className="mb-3">
                <strong>Current Status:</strong>
                <br />
                <span className={getStatusBadgeClass(complaint.status)}>
                  {complaint.status.replace('-', ' ').toUpperCase()}
                </span>
              </div>

              <div className="mb-3">
                <strong>Priority Level:</strong>
                <br />
                <span className={`badge ${getPriorityColor(complaint.priority)}`}>
                  <i className="fas fa-flag me-1"></i>
                  {complaint.priority.toUpperCase()}
                </span>
              </div>

              <div className="alert alert-info">
                <i className="fas fa-lightbulb me-2"></i>
                <strong>Tip:</strong> You can communicate with your assigned agent 
                using the message section. You'll receive notifications for any updates.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;