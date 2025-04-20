import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo3.png";
//import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="landing-container"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text)",
        textAlign: "center",
        overflow: "hidden",
        position: "relative",
        backgroundColor: "var(--lbg)"
      }}
    >
      <div
        className="landing-logo-container"
        style={{
          position: "absolute",
          top: "2vh",
          left: "2vw",
          width: "10vw",
          height: "14vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 20
        }}
      >
        <img
          src={logo}
          alt="website logo"
          className="landing-logo"
          style={{
            maxWidth: "100%",
            height: "100%",
            objectFit: "contain"
          }}
        />
      </div>
      <div
        className="landing-navbar"
        style={{
          position: "absolute",
          top: "3vh",
          right: "3vw",
          minWidth: "240px",
          height: "50px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--bg)",
          borderRadius: "24px",
          zIndex: 20
        }}
      >
        <button
          className="register-btn"
          onClick={() => navigate("/register")}
          style={{
            width: "45%",
            height: "100%",
            border: "none",
            borderRadius: "24px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
            color: "var(--text)",
            transition: "0.3s",
            opacity: 0.8,
            background: "transparent"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--hover)";
            e.currentTarget.style.color = "var(--hovertext)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text)";
          }}
        >
          Register
        </button>

        <button
          className="login-btn"
          onClick={() => navigate("/login")}
          style={{
            width: "45%",
            height: "100%",
            border: "none",
            borderRadius: "24px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
            color: "var(--text)",
            transition: "0.3s",
            opacity: 0.8,
            background: "transparent"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--hover)";
            e.currentTarget.style.color = "var(--hovertext)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text)";
          }}
        >
          Login
        </button>
      </div>

      <h1
        className="landing-title"
        style={{
          fontSize: "4rem",
          fontWeight: "bold",
          marginBottom: "75px"
        }}
      >
        DFWork
      </h1>
      <button
        className="find-jobs-btn"
        onClick={() => navigate("/find-jobs")}
        style={{
          backgroundColor: "var(--bg)",
          color: "var(--text)",
          fontSize: "18px",
          fontWeight: "bold",
          border: "none",
          borderRadius: "25px",
          padding: "12px 30px",
          cursor: "pointer",
          transition: "0.3s"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--hover)";
          e.currentTarget.style.color = "var(--hovertext)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--bg)";
          e.currentTarget.style.color = "var(--text)";
        }}
      >
        Find Jobs
      </button>
    </div>
  );
};

export default LandingPage;
