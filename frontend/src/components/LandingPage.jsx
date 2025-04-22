import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Navbar, Nav, Image } from "react-bootstrap";
import logo from "../assets/logo3.png";
import "bootstrap/dist/css/bootstrap.min.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (

    // landing page
    <div
      className="landing-page"
      style={{
        height: "100vh", // set fixed height to allow scroll INSIDE
        width: "100%",
        backgroundColor: "var(--bg)",
        color: "var(--text)",
        overflowX: "hidden",
        overflowY: "auto", // enable vertical scrolling
        position: "relative",
      }}
    >


      {/* logo */}
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

      {/*Register and login box */}
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
          background: "var(--aandl)",
          borderRadius: "24px",
          zIndex: 20
        }}
      >
        {/*Register and login button */}
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
            background: "var(--button1)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--hover)";
            e.currentTarget.style.color = "var(--textonhover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--button1)";
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
            background: "var(--button1)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--hover)";
            e.currentTarget.style.color = "var(--textonhover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--button1)";
            e.currentTarget.style.color = "var(--text)";
          }}
        >
          Login
        </button>
      </div>
      <Container className="d-flex flex-column justify-content-center align-items-center text-center py-3" style={{ minHeight: "80vh" }}>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            {/*Title Web */}
            <h1
              className="landing-title"
              style={{
                fontSize: "4rem",
                fontWeight: "bold",
                marginBottom: "75px",
                color: "var(--webname)"
              }}
            >
              DFWork
            </h1>
            <p className="lead mb-5">
              Find your dream job or the perfect candidate with our cutting-edge job matching platform
            </p>
            {/*Find Job button */}
            <button
              className="find-jobs-btn"
              onClick={() => navigate("/find-jobs")}
              style={{
                backgroundColor: "var(--button1)",
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
                e.currentTarget.style.color = "var(--textonhover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--button1)";
                e.currentTarget.style.color = "var(--text)";
              }}
            >
              Find Jobs
            </button>
          </Col>
        </Row>
      </Container>
      {/* Features Section (Added) */}

      <Container className="py-5 bg-white">
        <Row className="text-center mb-5">
          <Col>
            <h2 className="fw-bold">Why Choose DFWork?</h2>
          </Col>
        </Row>
        <Row className="g-4">
          <Col md={4}>
            <div className="p-4 text-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3">
                <i className="bi bi-search fs-3 text-primary"></i>
              </div>
              <h4 className="mb-3">Smart Job Matching</h4>
              <p className="text-muted">Our AI-powered platform connects you with the perfect opportunities based on your skills and preferences.</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-4 text-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3">
                <i className="bi bi-graph-up fs-3 text-primary"></i>
              </div>
              <h4 className="mb-3">Career Growth</h4>
              <p className="text-muted">Access resources and tools designed to help you advance in your professional journey.</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-4 text-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3">
                <i className="bi bi-building fs-3 text-primary"></i>
              </div>
              <h4 className="mb-3">Top Companies</h4>
              <p className="text-muted">Connect with industry-leading companies looking for talent like yours.</p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Call to Action Section (Added) */}
      <Container fluid className="py-5 bg-primary text-white text-center">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <h2 className="fw-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="mb-4">Join thousands of professionals who found their dream job through DFWork</p>
            <Button
              variant="light"
              size="lg"
              className="rounded-pill px-5 py-3 text-primary fw-bold"
              onClick={() => navigate("/register")}
            >
              Get Started Now
            </Button>
          </Col>
        </Row>
      </Container>

      {/* Footer (Added) */}
      <footer className="bg-dark text-light py-4">
        <Container>
          <Row>
            <Col md={6}>
              <p className="mb-0">© 2025 DFWork. All rights reserved.</p>
            </Col>
            <Col md={6} className="text-md-end">
              <a href="#" className="text-light me-3">Terms of Service</a>
              <a href="#" className="text-light me-3">Privacy Policy</a>
              <a href="#" className="text-light">Contact Us</a>
            </Col>
          </Row>
        </Container>
      </footer>
    </div >
  );
};

export default LandingPage;
