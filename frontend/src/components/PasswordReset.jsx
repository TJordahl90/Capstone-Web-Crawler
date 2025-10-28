import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Row,  Col, Button, Alert, Spinner } from 'react-bootstrap';
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
    const [showModal, setShowModal] = useState(true);
    const [codeSent, setCodeSent] = useState(false);
    const navigate = useNavigate();

    const handleSendCode = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if(!email){
            setError("Please enter your email address.");
            return;
        }

        try{
            setLoading(true);
            const response = await api.post("/verification/", { email });
            setMessage(response.data.message || "Verification code sent.");
            setCodeSent(true);
        }
        catch (err) {
            setError(err.response?.data?.error || "Failed to send code.");
        }
        finally {
            setLoading(false);
        }
    }

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if(!verificationCode || !newPassword | !confirmPassword) {
            setError("Please fill out all fields.");
            return;
        }

        if(newPassword !== confirmPassword){
            setError("Passwords do not match");
            return;
        }

        try{
            setLoading(true);
            const response = await api.post("/reset_password/", {
                email,
                verificationCode: verificationCode,
                newPassword: newPassword,
            });

            setMessage(response.data.message || "Pasword reset successful.");
            setVerificationCode("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => navigate("/login"), 1000);
        }
        catch (err){
            setError(err.response?.data?.error || "Failed to reset password.");
        }
        finally{
            setLoading(false);
        }
    }

     return (
        <Container className="py-5" style={{ minHeight: "100vh" }}>
            <Row className="justify-content-center">
                <Col md={6} lg={5}>
                    {message && <Alert variant="success" onClose={() => setMessage("")} dismissible>{message}</Alert>}
                    {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}

                    <div className="p-4 text-start" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: "12px" }}>
                        <h3 className="mb-4 text-center" style={{ color: "#05e3ed" }}>Reset Password</h3>

                        {/* Step 1: Email input + send code */}
                        <Form onSubmit={handleSendCode}>
                            <InputField
                                label="Email Address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your account email"
                            />
                            <Button
                                variant="secondary"
                                type="submit"
                                className="mt-3 w-100"
                                disabled={loading}
                            >
                                {loading ? "Sending..." : "Send Verification Code"}
                            </Button>
                        </Form>

                        {/* Step 2: Verification + password reset (only after code is sent) */}
                        {codeSent && (
                            <Form onSubmit={handlePasswordReset} className="mt-4">
                                <InputField
                                    label="Verification Code"
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    placeholder="Enter verification code"
                                />

                                <InputField
                                    label="New Password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                />

                                <InputField
                                    label="Confirm New Password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter new password"
                                />

                                <Button
                                    type="submit"
                                    className="mt-3 w-100"
                                    disabled={loading}
                                >
                                    {loading ? "Resetting..." : "Reset Password"}
                                </Button>
                            </Form>
                        )}
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default PasswordReset;