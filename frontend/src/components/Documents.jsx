import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Container } from 'react-bootstrap';
import { FaEye, FaFilePdf, FaTrash, FaUpload } from 'react-icons/fa';
import api from '../api.js';

const Documents = () => {
    const [resume, setResume] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [showPreview, setShowPreview] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [hoverUpload, setHoverUpload] = useState(false);

    useEffect(() => {
        const fetchResume = async () => {
            try {
                const response = await api.get("/documents/", {
                    responseType: "blob",
                });
                const url = URL.createObjectURL(response.data);
                setResume(url);
            }
            catch (error) {
                console.error("Failed to fetch resume: ", error);
            }
        }

        fetchResume();
    }, []);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileUrl = URL.createObjectURL(file);
            setResume({
                file,
                url: fileUrl,
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

            if (resume.file) {
                await api.put("/documents/", formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            else {
                await api.post("/documents/", formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            const newUrl = URL.createObjectURL(resume.file);
            setResume(newUrl);
            setShowPreview(true);

            setMessage("Resume successfully uploaded.");
        }
        catch (error) {
            console.error(error);
            setError("Error uploading resume.");
        }

        setTimeout(() => {
            setMessage('');
            setError('');
        }, 3000);
    };

    return (
        <Container className="py-4">
            <h3 className="mb-4" style={{ color: "var(--accent1)" }}>My Resume</h3>
            {error && <Alert variant="danger">{error}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}

            <Card className="Myresume"
                style={{
                    backgroundColor: "var(--shadow3)", // more translucent
                    backdropFilter: "blur(10px)",                // adds frosted-glass effect
                    WebkitBackdropFilter: "blur(10px)",          // Safari support
                    borderTopLeftRadius: "12px",
                    borderTopRightRadius: "12px",
                }}>
                <Card.Header className="resumebox"
                    style={{ background: "var(--text)", color: "var(--background)" }}
                >
                    <div className="d-flex justify-content-between align-items-center"
                    >
                        <h5 className="mb-0">Resume</h5>
                        <div className="d-flex"
                            style={{
                                color: "var(--background)",
                            }}>
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

                                onMouseEnter={() => setHoverUpload(true)}
                                onMouseLeave={() => setHoverUpload(false)}

                                style={{
                                    borderColor: hoverUpload ? "var(--text)" : "var(--background)",
                                    color: hoverUpload ? "var(--text)" : "var(--background)",
                                    backgroundColor: hoverUpload ? "var(--background)" : "transparent",
                                    transition: "0.2s ease"
                                }}
                            >
                                <FaUpload className="me-1" />
                                {resume ? "Replace Resume" : "Upload Resume"}
                            </Button>

                            {resume && (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleSubmit}
                                    style={{ color: "var(--text)" }}
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
                        <Alert variant="light" className="text-center"
                        style = {{color: "var(--text)",background: "var(--background)"}}>
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
                            src={resume}
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