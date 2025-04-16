import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import InputField from './InputField';
import "./AuthForm.css";
import api from '../api.js';

const AuthForm = ({ isLogin }) => {
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
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
                const response = await api.get('/csrf/');
            }
            catch (err) {
                setError(err.response?.data?.message || "Something went wrong.");
            }
        };

        getCsrfToken();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isLogin ? "/login/" : "/register/";

        if (!isLogin) {
            try {
                const verificationCode = await api.post("/verification/", formData);
                console.log("Verification code created for: ", formData.email);
                navigate("/verification", {state : {formData}});
            }
            catch (err) {
                setError(err.temp?.data?.message || "Something went wrong.");
            }
        }

        if(isLogin){
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
        <Container className="auth-container" fluid>

            <Card className="p-4">
                <Row className="justify-content-center">
                    <Col>
                        <div className="text-start w-100">
                            <Button
                                onClick={() => navigate("/")}
                                className="auth-back-button"
                            >
                                ← Back to Home
                            </Button>
                        </div>
                        <h1 className="text-center mb-4">{isLogin ? "Login" : "Register"}</h1>
                        {message && <Alert variant="success">{message}</Alert>}
                        {error && <Alert variant="danger">{error}</Alert>}

                        <Form onSubmit={handleSubmit}>
                            {!isLogin && (
                                <>
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
                                </>
                            )}
                            <InputField label="Username" type="text" value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="Enter your username"
                            />
                            <InputField label="Password" type="password" value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Enter your password"
                            />
                            <Button type="submit" className="auth-button">
                                {isLogin ? "Login" : "Register"}
                            </Button>
                        </Form>
                    </Col>
                </Row>
            </Card>
        </Container>
    );
};

export default AuthForm;
