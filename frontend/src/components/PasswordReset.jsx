import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import InputField from "./InputField";
import GlobalMessage from "./GlobalMessage.jsx";
import api from '../api.js';
import videobg from "../assets/background_video_1.mp4";
import logo from "../assets/logo3.png";

const PasswordReset = () => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [alert, setAlert] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    setAlert({ type: "", text: "" });

    if (!email) {
      setAlert({ type: "error", text: "Please enter your email address." });
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/verification/", { email });
      setAlert({
        type: "success",
        text: response.data.message || "Verification code sent.",
      });
      setCodeSent(true);
    } catch (err) {
      setAlert({
        type: "error",
        text: err.response?.data?.error || "Failed to send code.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setAlert({ type: "", text: "" });

    if (!verificationCode || !newPassword || !confirmPassword) {
      setAlert({ type: "error", text: "Please fill out all fields." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlert({ type: "error", text: "Passwords do not match." });
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/reset_password/", {
        email,
        verificationCode,
        newPassword,
      });

      setAlert({
        type: "success",
        text: response.data.message || "Password reset successful.",
      });

      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setAlert({
        type: "error",
        text: err.response?.data?.error || "Failed to reset password.",
      });
    } finally {
      setLoading(false);
    }
  };

  const passwordsMismatch =
    newPassword &&
    confirmPassword &&
    newPassword !== confirmPassword;

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
      {/* toast message */}
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
          overflow: "hidden",
          border: "none",
        }}
      >
        <Row className="g-0" style={{ height: "100%" }}>

          {/* LEFT = FORM (slide from left) */}
          <Col
            md={4}
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              backgroundColor: "#ffffff",
              padding: "0rem 2.7rem",
              color: "#111",
              animation: "slideFromLeft 0.6s ease forwards",
            }}
          >
            <style>
              {`
                @keyframes slideFromLeft {
                  from { transform: translateX(-100%); opacity: 0; }
                  to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideFromRight {
                  from { transform: translateX(100%); opacity: 0; }
                  to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeUp {
                  from { opacity: 0; transform: translateY(12px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}
            </style>

            <h3
              style={{
                fontSize: "2.3rem",
                fontWeight: 700,
                marginBottom: "25px",
                textAlign: "center",
              }}
            >
              Reset Password
            </h3>

            {/* STEP 1 — send code */}
            {!codeSent && (
              <Form onSubmit={handleSendCode}>
                <InputField
                  label="Email Address"
                  type="email"
                  value={email}
                  placeholder="Enter your account email"
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: "#111",
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
                >
                  {loading ? <Spinner size="sm" /> : "Send Verification Code"}
                </Button>

                <div
                  className="text-center mt-3"
                  style={{ fontSize: "0.9rem", color: "#666" }}
                >
                  Remember your password?{" "}
                  <span
                    style={{
                      color: "#0b5ed7",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                    onClick={() => navigate("/login")}
                  >
                    Login
                  </span>
                </div>
              </Form>
            )}

            {/* STEP 2 — reset password */}
            {codeSent && (
              <Form onSubmit={handlePasswordReset}>
                <InputField
                  label="Verification Code"
                  type="text"
                  value={verificationCode}
                  placeholder="Enter verification code"
                  onChange={(e) => setVerificationCode(e.target.value)}
                />

                <InputField
                  label="New Password"
                  type="password"
                  value={newPassword}
                  placeholder="Enter new password"
                  onChange={(e) => setNewPassword(e.target.value)}
                />

                <small style={{ fontSize: "0.8rem", color: "#777" }}>
                  At least 8 characters with upper, lower, number & symbol.
                </small>

                <InputField
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  placeholder="Re-enter password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {passwordsMismatch && (
                  <small
                    style={{
                      color: "red",
                      fontSize: "0.8rem",
                      marginTop: "-5px",
                      marginBottom: "5px",
                    }}
                  >
                    Passwords do not match.
                  </small>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: "#111",
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
                >
                  {loading ? <Spinner size="sm" /> : "Reset Password"}
                </Button>
              </Form>
            )}
          </Col>

          {/* RIGHT = VIDEO (slide from right) */}
          <Col
            md={8}
            style={{
              padding: 0,
              height: "100%",
              animation: "slideFromRight 0.6s ease forwards",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
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
                  cursor: "pointer",
                  zIndex: 20,
                }}
              >
                <img
                  src={logo}
                  alt="website logo"
                  style={{
                    maxWidth: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>

              {/* TEXT on video */}
              <div
                className="d-flex align-items-center"
                style={{
                  position: "relative",
                  zIndex: 1,
                  height: "100%",
                  justifyContent: "center",
                  padding: "0 0 5rem 0",
                  color: "#fff",
                  background: "rgba(0, 0, 0, 0.35)",
                }}
              >
                <div style={{ width: "520px" }}>
                  <h2
                    style={{
                      fontSize: "4rem",
                      fontWeight: 800,
                      marginBottom: "1rem",
                      opacity: 0,
                      animation: "fadeUp 1s ease forwards",
                      animationDelay: "0.1s",
                    }}
                  >
                    Forgot your password?
                  </h2>

                  <p
                    style={{
                      fontSize: "1.2rem",
                      lineHeight: 1.7,
                      opacity: 0,
                      animation: "fadeUp 1s ease forwards",
                      animationDelay: "0.45s",
                    }}
                  >
                    Don’t worry — enter your email, get your code, and set a new
                    password to continue using Northstar.
                  </p>
                </div>
              </div>

            </div>
          </Col>

        </Row>
      </Card>
    </div>
  );
};

export default PasswordReset;
