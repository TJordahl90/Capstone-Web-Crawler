import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import api from '../api.js';

const AccountSetup = () => {
    const [view, setView] = useState('resume');
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                setError('Please upload a PDF file.');
                setResume(null);
                if(fileInputRef.current) fileInputRef.current.value = null;
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB.');
                setResume(null);
                if(fileInputRef.current) fileInputRef.current.value = null;
                return;
            }
            setResume(file);
            setError('');
        }
    };

    const handleResumeSubmit = async (e) => {
        e.preventDefault();
        if (!resume) {
            setError('Please upload a resume before continuing.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('resume', resume);

            // Call backend resume parser
            const response = await api.post('/documents/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const parsedData = response.data;
            navigate('/dashboard');

        } catch (err) {
            console.error('Error uploading resume:', err);
            setError(
                err.response?.data?.error ||
                'Something went wrong while uploading your resume. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        navigate('/dashboard');
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', color: 'white' }}>
            <Card style={{ width: '100%', maxWidth: '500px'}}>
                <Card.Body className="p-4 p-md-5">
                    <h2 className="text-center mb-3">Set Up Your Profile</h2>
                    
                    {error && <Alert variant="danger">{error}</Alert>}

                    {view === 'resume' ? (
                        <div>
                            <p className="text-center mb-4">
                                Speed up the process by uploading your resume. We'll parse it to fill in your profile.
                            </p>
                            <Form onSubmit={handleResumeSubmit}>
                                <Form.Group controlId="formFile" className="mb-3">
                                    <Form.Control 
                                        type="file" 
                                        accept=".pdf" 
                                        ref={fileInputRef} 
                                        onChange={handleFileChange} 
                                    />
                                </Form.Group>
                                <Button variant="info" type="submit" className="w-100" disabled={loading}>
                                    {loading ? <Spinner as="span" animation="border" size="sm"/> : 'Upload and Continue'}
                                </Button>
                            </Form>
                            <hr />
                            <Button variant="outline-secondary" className="w-100" onClick={() => setView('manual')}>
                                Or, Enter Details Manually
                            </Button>
                        </div>
                    ) : (
                        <div>
                            <p className="text-center mb-4">Fill in your professional details below.</p>
                            <div className="text-center p-5 border border-dashed rounded">
                                <p>need to implement.</p>
                            </div>
                            <hr />
                            <Button variant="outline-secondary" className="w-100" onClick={() => setView('resume')}>
                                Back to Resume Upload
                            </Button>
                        </div>
                    )}

                    <div className="text-center mt-4">
                        <Button variant="link" onClick={handleSkip}>
                            Skip for now
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default AccountSetup;