import React from "react";
import "./LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Navbar (Now inside Landing Page) */}
      <nav className="navbar">
        <a href="/register" className="btn signup">Register</a>
        <a href="/login" className="btn login">Login</a>
      </nav>

      {/* Hero Section */}
      <h2 className="opportunity-text">Opportunities</h2>
      <h2 className="connection-text">to Connections</h2>

      {/* Background Shapes */}
      <div className="large_white_ellipse"></div>
      <div className="large_black_ellipse"></div>
      <div className="small_white_rectangle"></div>
      <div className="small_white_ellipse"></div>
    </div>
  );
};

export default LandingPage;
