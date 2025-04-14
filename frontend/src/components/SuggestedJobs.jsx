import React, { useState } from "react";
import { Container, Row, Col, ListGroup, Card, Button, Alert } from "react-bootstrap";
import api from "../api.js";

const SuggestedJobs = () => {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [matchedJobs, setMatchedJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);

    const handleJobRetrieval = async () => {
        try {
            const response = await api.get("/job_matching/");
            setMatchedJobs(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    useState(() => {
        handleJobRetrieval();
        setError("No suggested jobs, please set up account.")
    })

    return (
        <Container className="py-5">
            <Row>
                {/* Left column: job list */}
                <Col md={4}>
                    <ListGroup className="suggestedjobs-card">
                        {matchedJobs.map((job) => (
                            <ListGroup.Item 
                                key={job.id} 
                                action 
                                active={selectedJob?.id === job.id}
                                onClick={() => setSelectedJob(job)}
                                className="py-3"
                                style={{backgroundColor: "#b0ac8c" }}
                            >
                                <strong>{job.title}</strong><br />
                                <p>{job.company}</p>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Col>

                {/* Right column: selected job details */}
                <Col md={8}>
                    {selectedJob ? (
                        <Card className="suggestedjobs-card">
                            <Card.Body>
                                <Card.Title>{selectedJob.title}</Card.Title>
                                <Button as="a" variant="outline-dark" href={selectedJob.jobURL}>Apply</Button>
                                <Card.Text>
                                    <strong>Company:</strong> {selectedJob.company}
                                    <br />
                                    <strong>Location:</strong> {selectedJob.location}
                                    <br />
                                    <strong>Date Posted:</strong> {selectedJob.datePosted}
                                </Card.Text>
                                <Card.Text>
                                    <strong>Description: </strong>
                                    {selectedJob.description}
                                </Card.Text>
                                <Card.Text>
                                    <strong>Requirements: </strong>
                                    {selectedJob.requirements.map(skill => skill.name).join(', ')}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    ) : (
                        null
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default SuggestedJobs;
