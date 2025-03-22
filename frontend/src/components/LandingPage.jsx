import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.webp";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">

      <div className="landing-logo-container">
        <img src={logo} alt="website logo" className="landing-logo" />
      </div>

      <div className="landing-navbar">
        <button className="register-btn" onClick={() => navigate("/register")}>Register</button>
        <button className="login-btn" onClick={() => navigate("/login")}>Login</button>
      </div>
      
      <h1 className="landing-title">DFWork</h1>
      <button className="find-jobs-btn" onClick={() => navigate("/find-jobs")}>Find Jobs</button>

    </div>
  );
};

export default LandingPage;
