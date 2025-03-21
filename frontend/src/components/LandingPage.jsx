import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <button className="" onClick={() => navigate("/register")}>Register</button>
      <button className="" onClick={() => navigate("/login")}>Login</button>
      <button className="find-jobs-btn" onClick={() => navigate("/find-jobs")}>Find Jobs</button>
    </div>
  );
};

export default LandingPage;
