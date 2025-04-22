import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import InputField from './InputField';
//import "./AuthForm.css";
import api from '../api.js';

const AuthForm = ({ isLogin }) => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        email: '',
    });

    useEffect(() => {
        const getCsrfToken = async () => {
            try {
                await api.get('/csrf/');
            }
            catch (err) {
                setError(err.response?.data?.message || "Something went wrong.");
            }
        };

        getCsrfToken();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                setError('Please upload a PDF file.');
                fileInputRef.current.value = null;
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setError('File size should be less than 5MB.');
                fileInputRef.current.value = null;
                return;
            }

            setResumeFile(file);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isLogin) {
            const formDataPayload = new FormData();
            Object.keys(formData).forEach(key => {
                formDataPayload.append(key, formData[key]);
            });

            if (resumeFile) {
                formDataPayload.append('resume', resumeFile);
            }

            try {
                await api.post("/verification/", formDataPayload, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                console.log("Verification code created for: ", formData.email);
                navigate("/verification", { state: { formData } });
            }
            catch (err) {
                setError(err.response?.data?.message || "Something went wrong.");
            }
        }

        if (isLogin) {
            try {
                const response = await api.post('/login/', formData);

                const { skills, preferences, education, experience, ...otherAccountData } = response.data.account;
                localStorage.setItem("user", JSON.stringify(response.data.user));
                localStorage.setItem("account", JSON.stringify(otherAccountData));
                localStorage.setItem("skills", JSON.stringify(skills));
                localStorage.setItem("preferences", JSON.stringify(preferences));
                localStorage.setItem("education", JSON.stringify(education));
                localStorage.setItem("experience", JSON.stringify(experience));

                setMessage("Login successful!");
                setTimeout(() => navigate(isLogin ? "/account" : "/verification"), 1000);
            } catch (err) {
                setError(err.response?.data?.message || "Something went wrong.");
            }

            setTimeout(() => {
                setMessage('');
                setError('');
            }, 3000);
        };
    }

    return (
        <Container
            fluid
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "var(--bg5)"
            }}
        >
            <Card
                style={{
                    width: "100%",
                    maxWidth: "750px",
                    backgroundColor: "var(--bg5)",
                    border: "2px solid var(--border)"
                }}
            >
                <Row className="justify-content-center">
                    <Col>
                        <div
                            className="text-start w-100"
                            style={{
                                paddingTop: "20px",
                                paddingLeft: "10px"
                            }}
                        >

                            {/* Back button */}
                            <Button
                                onClick={() => navigate("/")}
                                style={{
                                    backgroundColor: "var(--backbg1)",
                                    color: "var(--backtxt1)",
                                    border: "none",
                                    borderRadius: "8px",
                                    paddingTop: "8px 16px",
                                    fontWeight: "bold",
                                    marginBottom: "20px",
                                    transition: "0.2s ease"
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = "var(--hover4)";
                                    e.target.style.color = "var(--textonhover4)";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = "var(--backbg1)";
                                    e.target.style.color = "var(--backtxt1)";
                                }}

                            >
                                ← Back to Home
                            </Button>
                        </div>
                        <h1 className="text-center mb-4"
                         style={{
                            color: "var(--title1)",
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
                                    <InputField label="Resume" type="file"
                                        onChange={handleFileChange} accept=".pdf" inputRef={fileInputRef}
                                        helpText="Upload your resume (PDF format, max 5MB)"
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
                                style={{
                                    backgroundColor: "var(--backbg1)",
                                    width: "50%",
                                    fontSize: "0.9rem",
                                    padding: "8px 16px",
                                    color: "var(--backtxt1)",
                                    borderRadius: "8px",
                                    transition: "all 0.3s ease",
                                    margin: "0 auto",
                                    display: "block"
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = "var(--hover4)";
                                    e.target.style.color = "var(--textonhover4)";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = "var(--backbg1)";
                                    e.target.style.color = "var(--backtxt1)";
                                }}
                            >
                                {isLogin ? "Login" : "Register"}
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
        </Container>
    );
};

export default AuthForm;