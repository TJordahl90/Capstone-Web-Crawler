import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Navbar, Nav, Image } from "react-bootstrap";
import logo from "../assets/logo3.png";
import backgroundImage from "../assets/background4.png";
import "bootstrap/dist/css/bootstrap.min.css";
import videobg from "../assets/sky.mp4";
const LandingPage = () => {
  const navigate = useNavigate();

  return (

    // landing page
    <div
      className="landing-page"
      style={{
        height: "100vh",
        width: "100%",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "white",
        overflowX: "hidden",
        overflowY: "auto",
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
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "24px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          zIndex: 20,
          padding: "4px",
          boxShadow: "0 0 12px rgba(0, 0, 0, 0.1)",
        }}
      >

        {/* Register Button */}
        <button
          className="register-btn"
          onClick={() => navigate("/register")}
          style={{
            width: "45%",
            height: "100%",
            borderRadius: "24px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
            color: "white",
            backgroundColor: "rgba(26, 120, 228, 0.3)",
            border: "2px solid var(--border)",
            backdropFilter: "blur(6px)",
            transition: "0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--accent1)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(26, 120, 228, 0.3)";
            e.currentTarget.style.color = "white";
          }}
        >
          Register
        </button>

        {/* Login Button */}
        <button
          className="login-btn"
          onClick={() => navigate("/login")}
          style={{
            width: "45%",
            height: "100%",
            borderRadius: "24px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
            color: "white",
            backgroundColor: "rgba(26, 120, 228, 0.3)",
            border: "2px solid var(--border)",
            backdropFilter: "blur(6px)",
            transition: "0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--accent1)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(26, 120, 228, 0.3)";
            e.currentTarget.style.color = "white";
          }}
        >
          Login
        </button>
      </div>

      <Container className="d-flex flex-column justify-content-center align-items-center text-center py-5" style={{ minHeight: "100vh" }}>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            {/*Title Web */}
            <h1
              className="landing-title"
              style={{
                fontSize: "4rem",
                fontWeight: "bold",
                marginBottom: "75px",
                color: "white"
              }}
            >
              Northstar
            </h1>
            <p className="lead mb-5 text-white">
              Find your dream job or the perfect candidate with our cutting-edge job matching platform
            </p>
            {/*Find Job button */}
            <button
              className="find-jobs-btn"
              onClick={() => navigate("/find-jobs")}
              style={{
                backgroundColor: "rgba(26, 120, 228, 0.3)",
                color: "white",
                fontSize: "18px",
                fontWeight: "bold",
                border: "2px solid var(--border)",
                borderRadius: "25px",
                padding: "12px 30px",
                cursor: "pointer",
                transition: "0.3s ease",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--accent1)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(26, 120, 228, 0.3)";
                e.currentTarget.style.color = "white";
              }}
            >
              Northstar Jobs
            </button>

          </Col>
        </Row>
      </Container>
      {/* Features Section (Added) */}

      <Container
      fluid
        className="py-5"
        style={{
          backgroundColor: "rgba( var(--border), 0.2 )", 
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
        }}
      >
        <Row className="text-center mb-5 text-white">
          <Col>
            <h2 className="fw-bold">Why Choose Northstar?</h2>
          </Col>
        </Row>
        <Row className="g-4">
          <Col md={4}>
            <div className="p-4 text-center">
              <div className=" bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3"
                style={{ backgroundColor: "var(--border)" }}>
                <i className="bi bi-search fs-3 text-primary"></i>
              </div>
              <h4 className="mb-3"
                style={{ color: "var(--accent1)" }}>Smart Job Matching</h4>
              <p className="text-gray">Our job matching algorithms connect you with the perfect opportunities based on your skills and preferences.</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-4 text-center">
              <div className="bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3"
                style={{ backgroundColor: "var(--border)" }}>
                <i className="bi bi-graph-up fs-3 text-primary"></i>
              </div>
              <h4 className="mb-3"
                style={{ color: "var(--accent1)" }}>Career Growth</h4>
              <p
                className="text-gray">Access resources and tools designed to help you advance in your professional journey.</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-4 text-center">
              <div className="bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3"
                style={{ backgroundColor: "var(--border)" }}>
                <i className="bi bi-building fs-3 text-primary"></i>
              </div>
              <h4 className="mb-3"
                style={{ color: "var(--accent1)" }}>Top Companies</h4>
              <p className="text-gray">Connect with industry-leading companies looking for talent like yours.</p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Call to Action Section (Added) */}
      <Container
        fluid
        className="py-5 text-white text-center"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(10px)",              
          WebkitBackdropFilter: "blur(10px)",       
        }}
      >
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <h2 className="fw-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="mb-4">
              Join thousands of professionals who found their dream job through Northstar
            </p>
            <Button
              size="lg"
              className="rounded-pill px-5 py-3 fw-bold"
              style={{
                backgroundColor: "rgba(26, 120, 228, 0.3)",
                color: "white",
                border: "2px solid var(--border)",
                backdropFilter: "blur(6px)",
                transition: "0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--accent1)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(26, 120, 228, 0.3)";
                e.currentTarget.style.color = "white";
              }}
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
              <p className="mb-0">© 2025 Northstar. All rights reserved.</p>
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
