import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import InputField from './InputField';
import api from '../api.js';

const Verification = () => {
    const [code, setCode] = useState("");
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const data = location.state;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            //console.log(data.email);
            const response = await api.get("/verification/", { params: { email: data.formDataPayload.get('email'), code: code } });
            if(response.status == 200){
                try{
                    const response = await api.post('/register/', data.formDataPayload, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    setMessage("Registration successful!");
                    setTimeout(() => navigate("/login"), 1000);
                }
                catch(err){
                    console.log(data)
                    setError(err.response?.data?.message || "Invalid Verification Code.");
                }
            }
        } catch (err) {
            console.log(data);
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