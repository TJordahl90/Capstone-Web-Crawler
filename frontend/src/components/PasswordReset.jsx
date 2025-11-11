import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import InputField from "./InputField";
import api from '../api.js';

const PasswordReset = () => {
    const [email, setEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const navigate = useNavigate();

    const handleSendCode = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!email) {
            setError("Please enter your email address.");
            return;
        }

        try {
            setLoading(true);
            const response = await api.post("/verification/", { email });
            setMessage(response.data.message || "Verification code sent.");
            setCodeSent(true);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to send code.");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!verificationCode || !newPassword || !confirmPassword) {
            setError("Please fill out all fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);
            const response = await api.post("/reset_password/", {
                email,
                verificationCode,
                newPassword,
            });

            setMessage(response.data.message || "Password reset successful.");
            setVerificationCode("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => navigate("/login"), 1000);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container
            fluid
            className="d-flex align-items-center justify-content-center"
            style={{
                height: "100vh",
                background: "linear-gradient(135deg, var(--background), var(--card))",
                color: "var(--text)",
                overflow: "hidden",
            }}
        >
            <Card
                style={{
                    backgroundColor: "var(--card)",
                    border: `1px solid var(--accent1)`,
                    borderRadius: "20px",
                    padding: "2.5rem",
                    width: "100%",
                    maxWidth: "480px",
                    boxShadow: "0 6px 30px var(--shadow2)",
                }}
            >
                {/* Back button */}
                <Button
                    onClick={() => navigate("/")}
                    style={{
                        backgroundColor: "transparent",
                        color: "var(--accent1)",
                        border: "none",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        marginBottom: "10px",
                    }}
                >
                    ← Back to Home
                </Button>

                {/* Header */}
                <h2
                    className="text-center mb-4"
                    style={{
                        color: "var(--accent1)",
                        fontWeight: 700,
                        letterSpacing: "1px",
                    }}
                >
                    Reset Password
                </h2>

                {message && <Alert variant="success" className="text-center">{message}</Alert>}
                {error && <Alert variant="danger" className="text-center">{error}</Alert>}

                {/* Step 1: Send Verification Code */}
                {!codeSent && (
                    <Form onSubmit={handleSendCode}>
                        <InputField
                            label="Email Address"
                            type="email"
                            value={email}
                            labelStyle={{ color: "var(--text)" }}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your account email"
                        />
                        <Button
                            type="submit"
                            disabled={loading}
                            style={{
                                backgroundColor: "var(--accent1)",
                                width: "100%",
                                fontSize: "1rem",
                                padding: "10px 0",
                                color: "#fff",
                                border: "none",
                                borderRadius: "10px",
                                fontWeight: "600",
                                transition: "0.3s ease",
                            }}
                            onMouseEnter={(e) => (e.target.style.opacity = "0.85")}
                            onMouseLeave={(e) => (e.target.style.opacity = "1")}
                        >
                            {loading ? <Spinner as="span" animation="border" size="sm" /> : "Send Verification Code"}
                        </Button>
                    </Form>
                )}

                {/* Step 2: Enter Code & Reset Password */}
                {codeSent && (
                    <Form onSubmit={handlePasswordReset} className="mt-3">
                        <InputField
                            label="Verification Code"
                            type="text"
                            value={verificationCode}
                            labelStyle={{ color: "var(--text)" }}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="Enter verification code"
                        />

                        <InputField
                            label="New Password"
                            type="password"
                            value={newPassword}
                            labelStyle={{ color: "var(--text)" }}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                        />

                        <InputField
                            label="Confirm New Password"
                            type="password"
                            value={confirmPassword}
                            labelStyle={{ color: "var(--text)" }}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password"
                        />

                        <Button
                            type="submit"
                            disabled={loading}
                            style={{
                                backgroundColor: "var(--accent1)",
                                width: "100%",
                                fontSize: "1rem",
                                padding: "10px 0",
                                color: "#fff",
                                border: "none",
                                borderRadius: "10px",
                                fontWeight: "600",
                                transition: "0.3s ease",
                            }}
                            onMouseEnter={(e) => (e.target.style.opacity = "0.85")}
                            onMouseLeave={(e) => (e.target.style.opacity = "1")}
                        >
                            {loading ? <Spinner as="span" animation="border" size="sm" /> : "Reset Password"}
                        </Button>
                    </Form>
                )}

                {/* Footer Navigation */}
                <div className="text-center mt-4" style={{ color: "var(--text)" }}>
                    <p>
                        Remember your password?{" "}
                        <span
                            style={{
                                color: "var(--accent1)",
                                fontWeight: "600",
                                cursor: "pointer",
                            }}
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </span>
                    </p>
                </div>
            </Card>
        </Container>
    );
};

export default PasswordReset;
