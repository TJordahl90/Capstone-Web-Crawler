import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import InputField from './InputField';
import GlobalMessage from './GlobalMessage.jsx';
import api from '../api.js';
import videobg from "../assets/background_video_1.mp4";
import logo from "../assets/logo3.png";

const Verification = () => {
  const [code, setCode] = useState("");
  const [alert, setAlert] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "your email";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ type: "", text: "" });

    try {
      const response = await api.get("/verification/", { params: { email: email, code: code } });
      if (response.status === 200) {
        setAlert({ type: "success", text: "Registration successful!" });
        setTimeout(() => navigate("/login"), 1000);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid verification code.";
      setAlert({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        backgroundColor: "#ffffffff",
      }}
    >
      {/* Global alert / toast */}
      <GlobalMessage
        type={alert.type}
        message={alert.text}
        onClose={() => setAlert({ type: "", text: "" })}
      />

      <Card
        style={{
          backgroundColor: "transparent",
          padding: 0,
          width: "100%",
          height: "100vh",
          maxWidth: "100vw",
          overflow: "hidden",
          boxShadow: "none",
          border: "none",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Row className="g-0" style={{ height: "100%" }}>
          {/* LEFT PANEL = VIDEO + MESSAGE */}
          <Col
            md={8}
            style={{
              padding: 0,
              height: "100%",
              order: 1,
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                animation: "slideFromLeft 0.6s ease forwards",
              }}
            >
              {/* Background video */}
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
                }}
              >
                <source src={videobg} type="video/mp4" />
              </video>

              {/* Logo */}
              <div
                className="landing-logo-container"
                onClick={() => navigate("/")}
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
                  cursor: "pointer",
                }}
              >
                <img
                  src={logo}
                  alt="website logo"
                  className="landing-logo"
                  style={{
                    maxWidth: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>

              {/* Overlay + text */}
              <div
                className="d-flex align-items-center"
                style={{
                  position: "relative",
                  zIndex: 1,
                  height: "100%",
                  justifyContent: "center",
                  padding: "0rem 0rem 5rem 0rem",
                  color: "#ffffff",
                  background: "rgba(0, 0, 0, 0.35)",
                }}
              >
                <div
                  style={{
                    width: "520px",
                  }}
                >
                  <style>
                    {`
                      @keyframes fadeUp {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                      }

                      @keyframes slideFromLeft {
                        from { transform: translateX(-100%); opacity: 0; }
                        to   { transform: translateX(0); opacity: 1; }
                      }
                    `}
                  </style>

                  <h2
                    style={{
                      fontSize: "4rem",
                      fontWeight: 800,
                      lineHeight: 1.2,
                      marginBottom: "1rem",
                      opacity: 0,
                      animation: "fadeUp 1s ease forwards",
                      animationDelay: "0.1s",
                    }}
                  >
                    Verify your email
                  </h2>

                  <p
                    style={{
                      fontSize: "1.2rem",
                      lineHeight: 1.7,
                      maxWidth: "420px",
                      opacity: 0,
                      animation: "fadeUp 1s ease forwards",
                      animationDelay: "0.45s",
                    }}
                  >
                    We just sent a verification code to{" "}
                    <strong>{email}</strong>.  
                    Enter the code on the right to activate your Northstar account.
                  </p>
                </div>
              </div>
            </div>
          </Col>

          {/* RIGHT PANEL = CODE FORM */}
          <Col
            md={4}
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              backgroundColor: "#ffffff",
              padding: "0rem 2.7rem",
              color: "#111111",
              height: "100%",
              "--text": "#111111",
              order: 2,
              animation: "slideFromRight 0.6s ease forwards",
            }}
          >
            <style>
              {`
                @keyframes slideFromRight {
                  from { transform: translateX(100%); opacity: 0; }
                  to   { transform: translateX(0); opacity: 1; }
                }
              `}
            </style>

            {/* Header */}
            <div className="d-flex justify-content-center align-items-center mb-3">
              <h3
                style={{
                  fontSize: "2.1rem",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                Email Verification
              </h3>
            </div>

            <p
              style={{
                textAlign: "center",
                fontSize: "0.95rem",
                marginBottom: "1.5rem",
                color: "#555",
              }}
            >
              Enter the 6-digit code we sent to your email to finish creating your account.
            </p>

            <Form onSubmit={handleSubmit}>
              <InputField
                label="Verification Code"
                type="text"
                value={code}
                placeholder="Enter your verification code..."
                onChange={(e) => setCode(e.target.value)}
                required={true}
              />

              <Button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: "#111111",
                  width: "100%",
                  fontSize: "1rem",
                  padding: "10px 0",
                  color: "#fff",
                  border: "none",
                  borderRadius: "999px",
                  fontWeight: "600",
                  marginTop: "0.75rem",
                  transition: "0.3s ease",
                }}
                onMouseEnter={(e) => (e.target.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.target.style.opacity = "1")}
              >
                {loading ? (
                  <Spinner as="span" animation="border" size="sm" />
                ) : (
                  "Verify"
                )}
              </Button>

              <div
                className="text-center mt-3"
                style={{ fontSize: "0.9rem", color: "#555" }}
              >
                Didn’t get the code?{" "}
                <button
                  type="button"
                  onClick={() => {
                    // optional: you can add resend logic here later
                    setAlert({
                      type: "error",
                      text: "Resend verification is not implemented yet.",
                    });
                  }}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#0b5ed7",
                    fontWeight: 600,
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  Resend
                </button>
              </div>

              <div
                className="text-center mt-2"
                style={{ fontSize: "0.85rem", color: "#777" }}
              >
                Wrong email?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#0b5ed7",
                    fontWeight: 600,
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  Go back to sign up
                </button>
              </div>
            </Form>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Verification;
