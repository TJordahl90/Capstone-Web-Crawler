import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Card } from 'react-bootstrap';
import api from '../api.js';

const PasswordReset = () => {
    return (
        <Container className="mt-5">
            <Card>
                <Card.Body>Password reset to be implemented...</Card.Body>
            </Card>
        </Container>
    );
};

export default PasswordReset;