import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import api from '../api.js';

const AccountSetup = () => {
    const [resume, setResume] = useState(null);
    const [fileName, setFileName] = useState("");
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
                setFileName('');
                if (fileInputRef.current) fileInputRef.current.value = null;
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB.');
                setResume(null);
                setFileName('');
                if (fileInputRef.current) fileInputRef.current.value = null;
                return;
            }
            setResume(file);
            setFileName(file.name);
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

            await api.post('/documents/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

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

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <Container
            fluid
            className="d-flex align-items-center justify-content-center"
            style={{
                height: "100vh",
                background: "linear-gradient(135deg, var(--background), var(--card))",
                color: "var(--text)",
                overflow: "hidden",
            }}
        >
            <Card
                style={{
                    backgroundColor: "var(--card)",
                    border: `1px solid var(--accent1)`,
                    borderRadius: "20px",
                    padding: "2.5rem",
                    width: "100%",
                    maxWidth: "520px",
                    boxShadow: "0 6px 30px rgba(--shadow2)",
                }}
            >
                {/* Back button */}
                <Button
                    onClick={() => navigate("/")}
                    style={{
                        backgroundColor: "transparent",
                        color: "var(--accent1)",
                        border: "none",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        marginBottom: "10px",
                    }}
                >
                    ← Back to Home
                </Button>

                {/* Header */}
                <h2
                    className="text-center mb-4"
                    style={{
                        color: "var(--accent1)",
                        fontWeight: 700,
                        letterSpacing: "1px",
                    }}
                >
                    Set Up Your Profile
                </h2>

                {error && <Alert variant="danger" className="text-center">{error}</Alert>}

                <p
                    className="text-center mb-4"
                    style={{
                        color: "var(--text)",
                        fontSize: "0.95rem",
                    }}
                >
                    Upload your resume (PDF) to automatically extract your experience and skills.
                </p>

                <Form onSubmit={handleResumeSubmit}>
                    {/* Hidden input */}
                    <input
                        type="file"
                        accept=".pdf"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />

                    {/* Custom file upload button */}
                    <div className="d-flex flex-column align-items-center mb-4">
                        <Button
                            onClick={handleBrowseClick}
                            style={{
                                width: "100%",
                                backgroundColor: "#222831",
                                color: "#fff",
                                border: "1px solid var(--border)",
                                borderRadius: "10px",
                                fontWeight: "600",
                                padding: "10px 20px",
                                transition: "0.3s ease",
                            }}
                            onMouseEnter={(e) => (e.target.style.opacity = "0.85")}
                            onMouseLeave={(e) => (e.target.style.opacity = "1")}
                        >
                            {fileName ? `Selected: ${fileName}` : "Select File"}
                        </Button>
                    </div>

                    {/* Upload button */}
                    <Button
                        type="submit"
                        disabled={loading}
                        style={{
                            backgroundColor: "var(--accent1)",
                            width: "100%",
                            fontSize: "1rem",
                            padding: "10px 0",
                            color: "#fff",
                            border: "none",
                            borderRadius: "10px",
                            fontWeight: "600",
                            transition: "0.3s ease",
                            marginBottom: "15px",
                        }}
                        onMouseEnter={(e) => (e.target.style.opacity = "0.85")}
                        onMouseLeave={(e) => (e.target.style.opacity = "1")}
                    >
                        {loading ? (
                            <Spinner as="span" animation="border" size="sm" />
                        ) : (
                            "Upload and Continue"
                        )}
                    </Button>
                </Form>

                <div className="text-center mt-4">
                    <Button
                        variant="link"
                        onClick={handleSkip}
                        style={{
                            color: "var(--accent1)",
                            fontWeight: "600",
                            textDecoration: "none",
                        }}
                    >
                        Skip for now
                    </Button>
                </div>
            </Card>
        </Container>
    );
};

export default AccountSetup;
