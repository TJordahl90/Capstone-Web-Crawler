import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import api from '../api.js';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const registrationData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      username: username,
      password: password,
    };

    try {
      const response = await api.post("/register/", registrationData)
      console.log("Registration successful:", response.data);
      //navigate('/login');
    }
    catch(error) {
      console.error("Error registering account:", error.response.data);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: "75%" }} fluid>
      <Card
        style={{
          padding: "40px",
          borderWidth: "3px",
          borderStyle: "solid",
        }}
      >
        <Row className="justify-content-center">
          <Col>
            <h1 className="text-center mb-4" style={{ }}>Register</h1>
            {message && <Alert variant="success">{message}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formFirstName" className="mb-3">
                <Form.Label>First Name:</Form.Label>
                <Form.Control
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  required
                />
              </Form.Group>

              <Form.Group controlId="formLastName" className="mb-3">
                <Form.Label>Last Name:</Form.Label>
                <Form.Control
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                  required
                />
              </Form.Group>

              <Form.Group controlId="formEmail" className="mb-3">
                <Form.Label>Email:</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </Form.Group>

              <Form.Group controlId="formPhone" className="mb-3">
                <Form.Label>Phone Number:</Form.Label>
                <Form.Control
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  required
                />
              </Form.Group>

              <Form.Group controlId="formUsername" className="mb-3">
                <Form.Label>Username:</Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                />
              </Form.Group>

              <Form.Group controlId="formPassword" className="mb-3">
                <Form.Label>Password:</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100">
                Submit
              </Button>
            </Form>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};
  
export default Register;
  