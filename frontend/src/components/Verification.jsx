import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import InputField from './InputField';
import GlobalMessage from './GlobalMessage.jsx';
import api from '../api.js';

const Verification = () => {
    const [code, setCode] = useState("");
    const [alert, setAlert] = useState({ type: "", text: "" });
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAlert({ type: "", text: "" });

        try {
            const response = await api.get("/verification/", { params: { email: email, code: code } });
            if (response.status === 200) {
                setAlert({ type: "success", text: "Registration successful!" });
                // setMessage("Registration successful!");
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
            {/* Error message popup */}
            <GlobalMessage
                type={alert.type}
                message={alert.text}
                onClose={() => setAlert({ type: "", text: "" })}
            />
                
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
                    Email Verification
                </h2>

                <p
                    className="text-center mb-4"
                    style={{
                        color: "var(--text)",
                        fontSize: "0.95rem",
                    }}
                >
                    We’ve sent a verification code to <strong style={{ color: "var(--accent1)" }}>{email}</strong>.
                    Please enter it below to verify your account.
                </p>
{/* 
                {message && <Alert variant="success" className="text-center">{message}</Alert>}
                {error && <Alert variant="danger" className="text-center">{error}</Alert>} */}

                <Form onSubmit={handleSubmit}>
                    <InputField
                        label="Verification Code"
                        type="text"
                        value={code}
                        labelStyle={{ color: "var(--text)" }}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Enter your verification code..."
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
                        {loading ? <Spinner as="span" animation="border" size="sm" /> : "Verify"}
                    </Button>

                </Form>
            </Card>
        </Container>
    );
};

export default Verification;