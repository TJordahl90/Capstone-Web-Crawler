import { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api.js';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loginData = {
      username: username,
      password: password,
    };

    try {
      const response = await api.post("/login/", loginData);
      console.log(response.data);
      setMessage("Successful login!");
      setError('');
      
      // setTimeout(() => {
        // navigate('/account', { state: response.data });
      // }, 1000);
    }
    catch (error) {
      console.error(error.response ? error.response.data : error.message)
      if (error.response && error.response.data) {
        if (error.response.data.non_field_errors) {
          setError("Invalid credentials.");
        } 
        else {
          setError("An error has occurred. Please try again.");
        }
      } 
      else {
        setError("Unable to connect to the server. Please check your connection.");
      }
      setMessage('');
    }
  
    setTimeout(() => {
        setError('');
        setMessage('');
    }, 3000);
  }

  return ( 
    <Container
      className="py-5"
      style={{ width: '75%', padding: '30px' }}
      fluid
      >
      <Card
        style={{
        padding: '40px',
        borderWidth: '3px',
        borderStyle: 'solid',
        }}
      >
        <Row className="justify-content-center">
        <Col>
          <h1 className="text-center mb-4" style={{}}>Login</h1>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
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

            <Button variant="primary" type="submit" className="w-100 mb-3">
              Login
            </Button>
          </Form>

          <div className="text-center">
            <Link to="/forgot-username/" className="d-block mb-2">
              Forgot Username?
            </Link>
            <Link to="/forgot-password/" className="d-block">
              Forgot Password?
            </Link>
          </div>
        </Col>
        </Row>
      </Card>
    </Container>
  )
}

export default Login;
