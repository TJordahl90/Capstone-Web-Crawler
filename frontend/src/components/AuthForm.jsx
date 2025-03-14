import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import InputField from './InputField';
import api from '../api.js';

const AuthForm = ({ isLogin }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isLogin ? "/login/" : "/register/";

        try {
            const response = await api.post(endpoint, formData);
            setMessage(isLogin ? "Login successful!" : "Registration successful!");
            setTimeout(() => navigate(isLogin ? "/account" : "/login"), 1000);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong.");
        }

        setTimeout(() => {
            setMessage('');
            setError('');
        }, 3000);
    };

    return (
        <Container className="auth-container" fluid>
            <Card className="p-4 border-3">
                <Row className="justify-content-center">
                    <Col>
                        <h1 className="text-center mb-4">{isLogin ? "Login" : "Register"}</h1>
                        {message && <Alert variant="success">{message}</Alert>}
                        {error && <Alert variant="danger">{error}</Alert>}

                        <Form onSubmit={handleSubmit}>
                            {!isLogin && (
                                <>
                                    <InputField label="First Name" type="text" value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        placeholder="Enter your first name"
                                    />
                                    <InputField label="Last Name" type="text" value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        placeholder="Enter your last name"
                                    />
                                    <InputField label="Email" type="email" value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="Enter your email"
                                    />
                                    <InputField label="Phone" type="text" value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="Enter your phone number"
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
                            <Button variant="primary" type="submit" className="w-100">
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
