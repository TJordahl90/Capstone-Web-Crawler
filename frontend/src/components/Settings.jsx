import React, { useState } from 'react';
import { Container, Row, Button, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';

const Settings = () => {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleDeleteAccount = async () => {
        setLoading(true);
        try {
            await api.delete("/delete_user/");
            localStorage.clear();
            navigate("/");
        } 
        catch (err) {
            console.error(err.response?.data?.error || "Error deleting account.");
            setLoading(false);
        }
    };

    return (
        <Container className="mt-5 text-center">
            <h2 className="mb-4">Settings</h2>
            
            <Row className="justify-content-center">
                <Button variant="outline-danger" style={{maxWidth: '200px'}} onClick={() => setShowModal(true)}>
                    Delete Account
                </Button>
            </Row>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Account Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to permanently delete your account? All of your data will be lost.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteAccount} disabled={loading}>
                        {loading ? <Spinner as="span" animation="border" size="sm" /> : "Yes, Delete My Account"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Settings;