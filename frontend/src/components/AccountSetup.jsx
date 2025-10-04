import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Container, Card, Row, Col, Form, Button, Alert } from 'react-bootstrap';

const AccountSetup = () => {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [resume, setResume] = useState(null);

    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                setError('Please upload a PDF file.');
                fileInputRef.current.value = null;
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setError('File size should be less than 5MB.');
                fileInputRef.current.value = null;
                return;
            }

            setResume(file);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isLogin) {
            const formDataPayload = new FormData();
            Object.keys(formData).forEach(key => {
                formDataPayload.append(key, formData[key]);
            });

            if (resume) {
                formDataPayload.append('resume', resume);
            }

            try {
                await api.post("//", formDataPayload, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                navigate("/");
            }
            catch (err) {
                setError(err.response?.data?.message || "");
            }
        }

    }

    return (
        <Container>
            <InputField label="Resume" type="file"
                onChange={handleFileChange} accept=".pdf" inputRef={fileInputRef}
                helpText="Upload your resume (PDF format, max 5MB)" required={false}
            />                 
        </Container>
    );
}

export default AccountSetup;