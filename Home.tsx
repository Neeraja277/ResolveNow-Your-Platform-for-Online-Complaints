import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto">
              <h1>Welcome to ResolveNow</h1>
              <p className="lead">
                Your comprehensive platform for online complaint registration and management. 
                Submit, track, and resolve complaints efficiently with our user-friendly system.
              </p>
              <div className="mt-4">
                {user ? (
                  <Link to="/dashboard" className="btn btn-primary btn-lg me-3">
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary btn-lg me-3">
                      Get Started
                    </Link>
                    <Link to="/login" className="btn btn-outline-light btn-lg">
                      Login
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container">
          <div className="row text-center mb-5">
            <div className="col-lg-8 mx-auto">
              <h2 className="display-5 fw-bold">Why Choose ResolveNow?</h2>
              <p className="lead text-muted">
                Our platform provides comprehensive tools for efficient complaint management
              </p>
            </div>
          </div>
          
          <div className="row g-4">
            <div className="col-md-4">
              <div className="feature-card text-center">
                <div className="feature-icon">
                  <i className="fas fa-user-plus"></i>
                </div>
                <h4>Easy Registration</h4>
                <p>
                  Quick and simple user registration process. Create your account 
                  and start submitting complaints in minutes.
                </p>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="feature-card text-center">
                <div className="feature-icon">
                  <i className="fas fa-clipboard-list"></i>
                </div>
                <h4>Complaint Submission</h4>
                <p>
                  Submit detailed complaints with attachments, descriptions, 
                  and all relevant information for faster resolution.
                </p>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="feature-card text-center">
                <div className="feature-icon">
                  <i className="fas fa-search"></i>
                </div>
                <h4>Real-time Tracking</h4>
                <p>
                  Track your complaint status in real-time with notifications 
                  and updates throughout the resolution process.
                </p>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="feature-card text-center">
                <div className="feature-icon">
                  <i className="fas fa-comments"></i>
                </div>
                <h4>Agent Interaction</h4>
                <p>
                  Communicate directly with assigned agents through our 
                  built-in messaging system for quick resolution.
                </p>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="feature-card text-center">
                <div className="feature-icon">
                  <i className="fas fa-bell"></i>
                </div>
                <h4>Smart Notifications</h4>
                <p>
                  Receive email and SMS notifications for complaint updates, 
                  status changes, and resolution confirmations.
                </p>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="feature-card text-center">
                <div className="feature-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h4>Secure & Confidential</h4>
                <p>
                  Your data is protected with enterprise-level security, 
                  encryption, and strict confidentiality measures.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row text-center mb-5">
            <div className="col-lg-8 mx-auto">
              <h2 className="display-5 fw-bold">How It Works</h2>
              <p className="lead text-muted">
                Simple steps to get your complaints resolved quickly
              </p>
            </div>
          </div>
          
          <div className="row g-4">
            <div className="col-md-3 text-center">
              <div className="mb-3">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{width: '60px', height: '60px'}}>
                  <span className="fw-bold">1</span>
                </div>
              </div>
              <h5>Register Account</h5>
              <p className="text-muted">Create your account with basic information</p>
            </div>
            
            <div className="col-md-3 text-center">
              <div className="mb-3">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{width: '60px', height: '60px'}}>
                  <span className="fw-bold">2</span>
                </div>
              </div>
              <h5>Submit Complaint</h5>
              <p className="text-muted">Fill out the complaint form with details</p>
            </div>
            
            <div className="col-md-3 text-center">
              <div className="mb-3">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{width: '60px', height: '60px'}}>
                  <span className="fw-bold">3</span>
                </div>
              </div>
              <h5>Track Progress</h5>
              <p className="text-muted">Monitor your complaint status and updates</p>
            </div>
            
            <div className="col-md-3 text-center">
              <div className="mb-3">
                <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{width: '60px', height: '60px'}}>
                  <span className="fw-bold">4</span>
                </div>
              </div>
              <h5>Get Resolution</h5>
              <p className="text-muted">Receive resolution and provide feedback</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-5">
          <div className="container">
            <div className="row">
              <div className="col-lg-8 mx-auto text-center">
                <h2 className="display-6 fw-bold mb-3">Ready to Get Started?</h2>
                <p className="lead mb-4">
                  Join thousands of users who trust ResolveNow for their complaint management needs.
                </p>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Create Your Account Today
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;