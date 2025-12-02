import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Navbar, Nav, Image } from "react-bootstrap";
import logo from "../assets/logo3.png";
// import backgroundImage from "../assets/background4.png";
import "bootstrap/dist/css/bootstrap.min.css";
import videobg from "../assets/background_video_1.mp4";
import { useRef, useState, useEffect } from "react";

const LandingPage = () => {
  const navigate = useNavigate();
  const whyRef = useRef(null);
  const [whyVisible, setWhyVisible] = useState(false);
  const ctaRef = useRef(null);
  const [ctaVisible, setCtaVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCtaVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (ctaRef.current) observer.observe(ctaRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setWhyVisible(true);
          observer.disconnect(); // only animate once
        }
      },
      {
        threshold: 0.2, // 20% of the section visible = trigger
      }
    );

    if (whyRef.current) {
      observer.observe(whyRef.current);
    }

    return () => observer.disconnect();
  }, []);

  console.log("Video URL:", videobg);

  return (

    // landing page
    <div
      className="landing-page"
      style={{
        background: "#ffffff"
      }}
    >
      <div
        className="top-page"
        style={{
          height: "100vh",
          width: "100%",
          color: "white",
          overflowX: "hidden",
          overflowY: "auto",
          position: "relative",
        }}
      >

        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
           
          }}
        >
          <source src={videobg} type="video/mp4" />
        </video>


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
            zIndex: 20,
            cursor:"pointer",
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

        <Container className="d-flex flex-column justify-content-center align-items-center text-center py-5" style={{ minHeight: "100vh", position: 'relative', zIndex: 2 }}>
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              {/* Animation keyframes */}
              <style>
                {`
                @keyframes fadeUp {
                 from { opacity: 0; transform: translateY(14px); }
                 to { opacity: 1; transform: translateY(0); }
                  }
               `}
              </style>

              {/* TITLE + SUBTITLE */}
              <div>
                {/* TITLE FIRST */}
                <h1
                  className="landing-title"
                  style={{
                    fontSize: "4rem",
                    fontWeight: "bold",
                    marginBottom: "60px",
                    color: "white",
                    opacity: 0,
                    animation: "fadeUp 1.1s ease forwards",
                    animationDelay: "0.15s",
                  }}
                >
                  Northstar Jobs
                </h1>

                {/* SUBTITLE SECOND */}
                <p
                  className="lead mb-5 text-white"
                  style={{
                    opacity: 0,
                    animation: "fadeUp 1.1s ease forwards",
                    animationDelay: "0.6s",  // After the title
                  }}
                >
                  Find your dream job or the perfect candidate with our cutting-edge job matching platform
                </p>
              </div>

              {/* BUTTON THIRD */}
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

                  /* New animation */
                  opacity: 0,
                  animation: "fadeUp 1.1s ease forwards",
                  animationDelay: "1.0s",   // AFTER subtitle
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
                Find Jobs
              </button>
            </Col>

          </Row>
        </Container>
        {/* Features Section (Added) */}

        <Container
          ref={whyRef}
          fluid
          className="py-5"
          style={{
            backgroundColor: "#ffffff",
            borderTopLeftRadius: "32px",
            borderTopRightRadius: "32px",

            // ✨ animation part:
            opacity: whyVisible ? 1 : 0,
            transform: whyVisible ? "translateY(0)" : "translateY(40px)",
            transition: "opacity 0.9s ease-out, transform 0.9s ease-out",
          }}
        >
          <Row className="text-center mb-5 "
            style={{ color: "var(--accent1)" }}>
            <Col>
              <h2 className="fw-bold">Why Choose Northstar?</h2>
            </Col>
          </Row>
          <Row className="g-4">
            <Col md={4}>
              <div className="p-4 text-center">
                <div className=" bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3"
                  style={{ backgroundColor: "var(--accent1)" }}>
                  <i className="bi bi-search fs-3 text-primary"></i>
                </div>
                <h4 className="mb-3"
                  style={{ color: "var(--accent1)" }}>Smart Job Matching</h4>
                <p className="detail1"
                  style={{ color: "#111111" }}>Our job matching algorithms connect you with the perfect opportunities based on your skills and preferences.</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="p-4 text-center">
                <div className="bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3"
                  style={{ backgroundColor: "var(--accent1)" }}>
                  <i className="bi bi-graph-up fs-3 text-primary"></i>
                </div>
                <h4 className="mb-3"
                  style={{ color: "var(--accent1)" }}>Career Growth</h4>
                <p
                  className="detail2"
                  style={{ color: "#111111" }}>Access resources and tools designed to help you advance in your professional journey.</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="p-4 text-center">
                <div className="bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3"
                  style={{ backgroundColor: "var(--accent1)" }}>
                  <i className="bi bi-building fs-3 text-primary"></i>
                </div>
                <h4 className="mb-3"
                  style={{ color: "var(--accent1)" }}>Top Companies</h4>
                <p className="detail3"
                  style={{ color: "#111111" }}>Connect with industry-leading companies looking for talent like yours.</p>
              </div>
            </Col>
          </Row>
        </Container>

        {/* Call to Action Section (Added) */}
        <Container
          ref={ctaRef}
          fluid
          className="py-5 text-white text-center"
          style={{
            backgroundColor: "#046992ff",
            //borderTopRightRadius: "32px",
            //borderTopLeftRadius: "32px",
            // scroll reveal
            opacity: ctaVisible ? 1 : 0,
            transform: ctaVisible ? "translateY(0)" : "translateY(40px)",
            transition: "opacity 1s ease-out, transform 1s ease-out",

          }}
        >

          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <h2
                className="fw-bold mb-4"
                style={{ color: "#ffffff" }}
              >
                Ready to Start Your Journey?
              </h2>

              <p
                className="mb-4"
                style={{ color: "#ffffff" }}
              >
                Join thousands of professionals who found their dream job through Northstar
              </p>

              <Button
                size="lg"
                className="rounded-pill px-5 py-3 fw-bold"
                style={{
                  backgroundColor: "#ffffff",
                  color: "var(--accent1)",
                  transition: "0.35s ease",
                  position: "relative",
                  overflow: "hidden",
                  zIndex: 1,
                }}
                onMouseEnter={(e) => {
                  const video = e.currentTarget.querySelector(".btn-video");

                  // Show video
                  video.style.opacity = "1";

                  // Make background transparent but KEEP text visible
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#ffffff";       // Solid white text
                  e.currentTarget.style.webkitTextFillColor = "#ffffff";  // Ensure stays white
                }}
                onMouseLeave={(e) => {
                  const video = e.currentTarget.querySelector(".btn-video");

                  // Hide video
                  video.style.opacity = "0";

                  // Revert normal style
                  e.currentTarget.style.background = "#ffffff";
                  e.currentTarget.style.color = "var(--accent1)";
                  e.currentTarget.style.webkitTextFillColor = "var(--accent1)";
                }}
                onClick={() => navigate("/register")}
              >
                {/* Background video overlay */}
                <div
                  className="btn-video"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                    pointerEvents: "none",
                    opacity: 0,                     // Hidden by default
                    transition: "opacity 0.4s ease",
                    zIndex: -1,                     // Always behind text
                  }}
                >
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  >
                    <source src={videobg} type="video/mp4" />
                  </video>
                </div>

                {/* Text stays above video */}
                <span style={{ position: "relative", zIndex: 5 }}>
                  Get Started Now
                </span>
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
    </div>
  );
};

export default LandingPage;
