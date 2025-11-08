import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import InputField from './InputField';
import api from '../api.js';
import backgroundImage from "../assets/background4.png";

const AuthForm = ({ isLogin }) => {
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmedPassword] = useState(false);

    useEffect(() => {
        const getCsrfToken = async () => {
            try {
                await api.get('/csrf/');
            }
            catch (err) {
                setError(err.response?.data?.message || "Error retrieving necessary tokens.");
            }
        };

        getCsrfToken();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!isLogin) {
            const password = formData.password;
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

            if(!passwordRegex.test(password)){
                setError("Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character");
                setLoading(false);
                return;
            }

            const confirmPassword = formData.confirmPassword;
            if(password !== confirmPassword){
                setError("Passwords do not match");
                setLoading(false);
                return;
            }

            const email = formData.email;
            const confirmEmail = formData.confirmEmail;

            if(email !== confirmEmail){
                setError("Emails do not match");
                setLoading(false);
                return;
            }

            try {
                await api.post('/register/', formData);
                await api.post('/verification/', { email: formData.email });
                navigate("/verification", { state: { email: formData.email } });
            }
            catch (err) {
                setError(err.response?.data?.error || "Error registering acccount.");
                setLoading(false);
            }
        }

        if (isLogin) {
            try {
                const response = await api.post('/login/', formData);
                localStorage.setItem("user", JSON.stringify(response.data.user));
                if (response.data.first_time_login) {
                    setMessage("Login successful!");
                    setTimeout(() => navigate("/account-setup"), 1000);
                } 
                else {
                    setMessage("Login successful!");
                    setTimeout(() => navigate("/dashboard"), 1000);
                }
            } catch (err) {
                setError(err.response?.data?.error || "Something went wrong.");
                setLoading(false);
            }

            setTimeout(() => {
                setMessage('');
                setError('');
            }, 3000);
        };
    }

    return (
        <Container
            style={{
                height: "100vh",
                width: "100%",
                
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                color: "var(--text)",
                overflowX: "hidden",
                overflowY: "auto",
                position: "relative",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                    padding: "40px 20px",
                }}
            >
                <Card
                    style={{
                        width: "100%",
                        maxWidth: "700px",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        backdropFilter: "blur(15px)",
                        WebkitBackdropFilter: "blur(15px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "20px",
                        boxShadow: "0 0 20px rgba(0, 0, 0, 0.2)",
                        padding: "20px",
                    }}
                >

                    <Row className="justify-content-center">
                        <Col>
                            <div
                                className="text-start w-100"
                                style={{
                                    paddingTop: "50px",
                                    paddingLeft: "10px"
                                }}
                            >

                                {/* Back button */}
                                <Button
                                    onClick={() => navigate("/")}
                                    style={{
                                        backgroundColor: "rgba(0, 173, 181, 0.3)",
                                        color: "var(--text)",
                                        border: "2px solid var(--border)",
                                        borderRadius: "8px",
                                        padding: "8px 16px",
                                        fontWeight: "bold",
                                        marginBottom: "20px",
                                        backdropFilter: "blur(6px)",
                                        WebkitBackdropFilter: "blur(6px)",
                                        transition: "0.3s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = "#00ADB5";
                                        e.target.style.color = "#fff";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = "rgba(0, 173, 181, 0.3)";
                                        e.target.style.color = "var(--text)";
                                    }}
                                >
                                    ← Back to Home
                                </Button>

                            </div>
                            <h1 className="text-center mb-4"
                                style={{
                                    color: "var(--border)",
                                }}
                            >{isLogin ? "Login" : "Register"}</h1>
                            {message && <Alert variant="success">{message}</Alert>}
                            {error && <Alert variant="danger">{error}</Alert>}

                            <Form
                                onSubmit={handleSubmit}
                                style={{
                                    paddingLeft: "10px",
                                    paddingRight: "10px",
                                    color: "var(--hover)"
                                }}>
                                {!isLogin && (
                                    <>
                                        <InputField label="Username" type="text" value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            placeholder="Enter a username"
                                        />
                                        <InputField label="Password" type="password" value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Enter a password"
                                        />
                                        {formData.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(formData.password) && (
                                            <small style={{ color: "red" }}>
                                                Must be 8+ characters and include an uppercase, lowercase, number, and special character
                                            </small>
                                        )}
                                        <InputField label="Confirm Password" type="password" value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            placeholder="Confirm your password"
                                        />
                                        <InputField label="First Name" type="text" value={formData.first_name}
                                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                            placeholder="Enter your first name"
                                        />
                                        <InputField label="Last Name" type="text" value={formData.last_name}
                                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                            placeholder="Enter your last name"
                                        />
                                        <InputField label="Email" type="email" value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="Enter your email"
                                        />
                                        <InputField label="Confirm Email" type="email" value={formData.confirmEmail}
                                            onChange={(e) => setFormData({ ...formData, confirmEmail: e.target.value })}
                                            placeholder="Confirm your email"
                                        />
                                    </>
                                )}

                                {isLogin && (
                                    <>
                                        <InputField label="Username" type="text" value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            placeholder="Enter your username"
                                        />
                                        <InputField label="Password" type="password" value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Enter your password"
                                        />
                                        <div className="text-end mb-3">
                                            <Link to="/password-reset">Forgot password?</Link>
                                        </div>
                                    </>
                                )}

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        backgroundColor: "rgba(0, 173, 181, 0.3)",
                                        width: "50%",
                                        fontSize: "0.9rem",
                                        padding: "8px 16px",
                                        color: "var(--text)",
                                        borderRadius: "8px",
                                        border: "2px solid var(--border)",
                                        backdropFilter: "blur(6px)",
                                        WebkitBackdropFilter: "blur(6px)",
                                        transition: "all 0.3s ease",
                                        margin: "0 auto",
                                        display: "block",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = "#00ADB5";
                                        e.target.style.color = "#fff";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = "rgba(0, 173, 181, 0.3)";
                                        e.target.style.color = "var(--text)";
                                    }}
                                >
                                    {loading ? <Spinner as="span" animation="border" size="sm" /> : (isLogin ? "Login" : "Register")}
                                </Button>

                                <div className="text-center mt-3"
                                    style={{
                                        color: "var(--text1)",
                                    }}
                                >
                                    {isLogin ? (
                                        <p>Don't have an account? <Link to="/register">Register</Link></p>
                                    ) : (
                                        <p>Already have an account? <Link to="/login">Login</Link></p>
                                    )}
                                </div>
                            </Form>
                        </Col>
                    </Row>
                </Card>
            </div>
        </Container>
    );
};

export default AuthForm;