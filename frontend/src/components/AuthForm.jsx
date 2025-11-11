import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import InputField from './InputField';
import GlobalMessage from './GlobalMessage.jsx';
import api from '../api.js';

const AuthForm = ({ isLogin }) => {
    const navigate = useNavigate();
    const [alert, setAlert] = useState({ type: "", text: "" });
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        email: '',
        confirmEmail: '',
    });

    useEffect(() => {
        api.get('/csrf/').catch(() =>
            setAlert({ type: "error", text: "Error retrieving necessary tokens." }),
        );
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAlert({ type: "", text: "" });

        try {
            if (!isLogin) {
                const { password, confirmPassword, email, confirmEmail } = formData;
                const valid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
                
                if (!valid.test(password)) throw new Error("Password must be 8+ chars and include uppercase, lowercase, number, and special char.");
                if (password !== confirmPassword) throw new Error("Passwords do not match.");
                if (email !== confirmEmail) throw new Error("Emails do not match.");
                
                await api.post('/register/', formData);
                await api.post('/verification/', { email });
                
                setAlert({ type: "success", text: "Account created successfully! Check your email for verification." });
                setTimeout(() => navigate("/verification", { state: { email } }), 1000);
            } 
            else {
                const response = await api.post('/login/', formData);
                localStorage.setItem("user", JSON.stringify(response.data.user));
                
                setAlert({ type: "success", text: "Login successful!" });
                setTimeout(() => navigate(response.data.first_time_login ? "/account-setup" : "/dashboard"), 1000);
            }
        } 
        catch (err) {
            const data = err.response?.data;
            let msg = "Something went wrong.";

            if (typeof data?.error === "string") {
                msg = data.error;
            } 
            else if (typeof data?.error === "object") {
                msg = Object.entries(data.error)
                    .map(([field, errors]) => `${field}: ${errors.join(", ")}`)
                    .join("\n");
            }
            setAlert({ type: "error", text: msg });
        } 
        finally {
            setLoading(false);
        }
    };

    return (
        <Container
            fluid
            className="d-flex align-items-center justify-content-center"
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, var(--background), var(--card))",
                color: "var(--text)",
                padding: "1rem",
                overflowY: "auto",
            }}
        >
            {/* Alert Message */}
            <GlobalMessage type={alert.type} message={alert.text} onClose={() => setAlert({ type: "", text: "" })} />

            <Card
                style={{
                    backgroundColor: "var(--card)",
                    border: `1px solid var(--accent1)`,
                    borderRadius: "20px",
                    padding: "2rem",
                    width: "100%",
                    maxWidth: "440px",
                    boxShadow: "0 6px 30px var(--shadow1)",
                }}
            >
                <Button
                    onClick={() => navigate("/")}
                    style={{
                        backgroundColor: "transparent",
                        color: "var(--accent1)",
                        border: "none",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        marginBottom: "10px",
                        padding: 0,
                    }}
                >
                    ← Back to Home
                </Button>

                <h2
                    className="text-center mb-4"
                    style={{
                        color: "var(--accent1)",
                        fontWeight: 700,
                        letterSpacing: "1px",
                    }}
                >
                    {isLogin ? "Welcome Back" : "Create Account"}
                </h2>

                <Form onSubmit={handleSubmit}>
                    {!isLogin ? (
                        <>
                            <InputField
                                label="Username"
                                type="text"
                                placeholder="Enter a username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                            <InputField
                                label="Password"
                                type="password"
                                placeholder="Enter a password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            {formData.password &&
                                !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(formData.password) && (
                                    <small style={{ color: "red" }}>Must meet password requirements</small>
                                )}
                            <InputField
                                label="Confirm Password"
                                type="password"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                            <Row className="gx-2">
                                <Col xs={12} sm={6}>
                                    <InputField
                                        label="First Name"
                                        type="text"
                                        placeholder="First name"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    />
                                </Col>
                                <Col xs={12} sm={6}>
                                    <InputField
                                        label="Last Name"
                                        type="text"
                                        placeholder="Last name"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    />
                                </Col>
                            </Row>
                            <InputField
                                label="Email"
                                type="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            <InputField
                                label="Confirm Email"
                                type="email"
                                placeholder="Confirm your email"
                                value={formData.confirmEmail}
                                onChange={(e) => setFormData({ ...formData, confirmEmail: e.target.value })}
                            />
                        </>
                    ) : (
                        <>
                            <InputField
                                label="Username"
                                type="text"
                                placeholder="Enter your username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                            <InputField
                                label="Password"
                                type="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <div className="text-end mb-3">
                                <Link
                                    to="/password-reset"
                                    style={{ color: "var(--accent1)", textDecoration: "none", fontSize: "0.9rem" }}
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        </>
                    )}

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
                        {loading ? (
                            <Spinner as="span" animation="border" size="sm" />
                        ) : (
                            isLogin ? "Login" : "Register"
                        )}
                    </Button>

                    <div className="text-center mt-3" style={{ color: "var(--text)" }}>
                        {isLogin ? (
                            <p style={{ fontSize: "0.95rem" }}>
                                Don’t have an account?{" "}
                                <Link to="/register" style={{ color: "var(--accent1)", fontWeight: 600 }}>
                                    Register
                                </Link>
                            </p>
                        ) : (
                            <p style={{ fontSize: "0.95rem" }}>
                                Already have an account?{" "}
                                <Link to="/login" style={{ color: "var(--accent1)", fontWeight: 600 }}>
                                    Login
                                </Link>
                            </p>
                        )}
                    </div>
                </Form>
            </Card>
        </Container>
    );
};

export default AuthForm;
