import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Container } from 'react-bootstrap';
import { FaEye, FaFilePdf, FaTrash, FaUpload } from 'react-icons/fa';
import api from '../api.js';

const Documents = () => {
    const [resume, setResume] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        const storedAccount = localStorage.getItem("account");
        if (storedAccount) {
            const account = JSON.parse(storedAccount);
            if (account.resume) {
                setResume(account.resume);
            }
        }
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileURL = URL.createObjectURL(file);
            setResume({
                file,
                url: fileURL,
            });
        }
    };

    const handleSubmit = async () => {
        if (!resume || !resume.file) {
            setError("No resume selected.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('resume', resume.file);

            const response = await api.post("/documents/", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMessage("Documents successfully updated!");
            localStorage.setItem("account", JSON.stringify({
                ...JSON.parse(localStorage.getItem("account") || "{}"),
                resume: resume
            }));
        }
        catch (err) {
            setError("Error updating documents.");
            console.error(err);
        }

        setTimeout(() => {
            setMessage('');
            setError('');
        }, 3000);
    };

    return (
        <Container className="py-4">
            <h3 className="mb-4" style={{ color: "#05e3ed" }}>My Resume</h3>
            {error && <Alert variant="danger">{error}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}

            <Card className="mb-4"
                style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)", // more translucent
                    backdropFilter: "blur(10px)",                // adds frosted-glass effect
                    WebkitBackdropFilter: "blur(10px)",          // Safari support
                    borderTopLeftRadius: "12px",
                    borderTopRightRadius: "12px",
                }}>
                <Card.Header className="bg-light"
                >
                    <div className="d-flex justify-content-between align-items-center"
                    >
                        <h5 className="mb-0">Resume</h5>
                        <div className="d-flex">
                            <input
                                type="file"
                                id="upload-resume"
                                className="d-none"
                                accept=".pdf"
                                onChange={handleFileChange}
                            />
                            <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                                onClick={() => document.getElementById('upload-resume').click()}
                            >
                                <FaUpload className="me-1" />
                                {resume ? "Replace Resume" : "Upload Resume"}
                            </Button>
                            {resume && (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleSubmit}
                                >
                                    Save
                                </Button>
                            )}
                        </div>
                    </div>
                </Card.Header>

                <Card.Body>
                    {resume ? (
                        <div className="p-3 border rounded">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    <FaFilePdf className="me-2 text-danger" size={24} />
                                    <div>
                                        <div className="fw-bold">{"My Resume"}</div>
                                    </div>
                                </div>
                                <div>
                                    <Button
                                        variant="link"
                                        className="text-primary"
                                        onClick={() => setShowPreview(!showPreview)}
                                    >
                                        <FaEye />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Alert variant="light" className="text-center">
                            No resume uploaded.
                        </Alert>
                    )}
                </Card.Body>
            </Card>

            {showPreview && resume && (
                <Card className="mb-4">
                    <Card.Header className="bg-light">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Resume Preview</h5>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => setShowPreview(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                        <iframe
                            src={resume.url || resume}
                            title="Resume Preview"
                            width="100%"
                            height="600px"
                            style={{ border: 'none' }}
                        />
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
};

export default Documents;