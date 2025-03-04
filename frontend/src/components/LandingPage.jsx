import React from "react";
import "./LandingPage.css";
import knobLogo from "../assets/knob.png";

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <button className="btn signup">Sign up</button>
        <button className="btn login">Log in</button>
      </nav>

      {/* Logo */}
      <div className="logo-container">
        <img src={knobLogo} alt="Knob Logo" className="logo" />
      </div>

      {/* Hero Section (Positioned Text) */}
      <h2 className="opportunity-text">
        Opportunities <br />
        <br />
        <br />
        to Connections
      </h2>

      <h2 className="connection-text">to Connections</h2>

      {/* Right-Aligned Ellipses */}
      <div className="large_white_ellipse"></div>
      <div className="large_black_ellipse"></div>

      {/* Other Background Shapes */}
      <div className="small_white_rectangle"></div>
      <div className="small_white_ellipse"></div>
    </div>
  );
};

export default LandingPage;
