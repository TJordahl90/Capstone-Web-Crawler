import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button } from 'react-bootstrap';
import InputField from './InputField';
import api from '../api.js';

const Verification = () => {
    const [code, setCode] = useState("");
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post("/verification-check", {code});
            setMessage("Registration successful!");
            setTimeout(() => navigate("/suggested-jobs/"), 1000);
        } catch (err) {
            setError(err.response?.data?.message || "Invalid Verification Code.");
        }

        setTimeout(() => {
            setMessage('');
            setError('');
        }, 3000);
    };

    return (
        <Container className="py-5">
            {message && <Alert variant="success">{message}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}

            <Card>
                <Card.Body>
                    <Card.Title>Email Verification</Card.Title>
                    <Card.Text></Card.Text>
                    <Form onSubmit={handleSubmit}>
                        <InputField label="Verification Code" type="text" value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Enter code..."
                        />
                        <Button type="submit">Verify</Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Verification;