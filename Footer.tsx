import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5>
              <i className="fas fa-clipboard-check me-2"></i>
              ResolveNow
            </h5>
            <p className="mb-3">
              Your trusted platform for online complaint registration and management. 
              We help streamline the complaint resolution process for better customer satisfaction.
            </p>
          </div>
          <div className="col-md-3">
            <h6>Quick Links</h6>
            <ul className="list-unstyled">
              <li><a href="/" className="text-light text-decoration-none">Home</a></li>
              <li><a href="/about" className="text-light text-decoration-none">About</a></li>
              <li><a href="/contact" className="text-light text-decoration-none">Contact</a></li>
              <li><a href="/privacy" className="text-light text-decoration-none">Privacy Policy</a></li>
            </ul>
          </div>
          <div className="col-md-3">
            <h6>Contact Info</h6>
            <p className="mb-1">
              <i className="fas fa-envelope me-2"></i>
              support@resolvenow.com
            </p>
            <p className="mb-1">
              <i className="fas fa-phone me-2"></i>
              +1 (555) 123-4567
            </p>
            <div className="mt-3">
              <a href="#" className="text-light me-3"><i className="fab fa-facebook"></i></a>
              <a href="#" className="text-light me-3"><i className="fab fa-twitter"></i></a>
              <a href="#" className="text-light me-3"><i className="fab fa-linkedin"></i></a>
            </div>
          </div>
        </div>
        <hr className="my-4" />
        <div className="row">
          <div className="col-12 text-center">
            <p className="mb-0">
              &copy; 2024 ResolveNow. All rights reserved. Built with React, Node.js, and MongoDB.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;