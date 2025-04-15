import React, { useState, useEffect } from "react";
import { Container, Row, Col, ListGroup, Card, Button, Alert, Modal } from "react-bootstrap";
import api from "../api.js";

const SuggestedJobs = () => {
    const exampleJobs = [
        {
            id: 1,
            title: "Job Example 1",
            company: "For frontend testing",
            location: "5005 WEST ROYAL LANE, SUITE NO 228 IRVING, TX, 75063",
            postedDate: "2025-04-10",
            description: `Analyze, design and configure network architecture and layout strategies. 
        Configure and assist service deployment and document network issues. 
        Detect, and mitigate DDOS attacks on the network. Install, maintain and monitor LAN servers, LAN systems. 
        Troubleshoot and resolve all types of production network outages. 
        Implement test plans and find bugs.`,
            requirements: [
                { name: "VLAN" },
                { name: "BGP" },
                { name: "OSPF" },
                { name: "Cisco" },
                { name: "Python" },
                { name: "Juniper" },
                { name: "Arista" },
                { name: "DNS" },
                { name: "Wireshark" },
                { name: "network architecture" },
                { name: "bachelors" },
            ],
            jobURL: "#", // keep "#" or a dummy URL if you're not linking out
        },
        {
            id: 2,
            title: "Job Example 2",
            company: "For frontend testing",
            location: "5005 WEST ROYAL LANE, SUITE NO 228 IRVING, TX, 75063",
            postedDate: "2025-04-10",
            description: `Analyze, design and configure network architecture and layout strategies. 
        Configure and assist service deployment and document network issues. 
        Detect, and mitigate DDOS attacks on the network. Install, maintain and monitor LAN servers, LAN systems. 
        Troubleshoot and resolve all types of production network outages. 
        Implement test plans and find bugs.`,
            requirements: [
                { name: "VLAN" },
                { name: "BGP" },
                { name: "OSPF" },
                { name: "Cisco" },
                { name: "Python" },
                { name: "Juniper" },
                { name: "Arista" },
                { name: "DNS" },
                { name: "Wireshark" },
                { name: "network architecture" },
                { name: "bachelors" },
            ],
            jobURL: "#", // keep "#" or a dummy URL if you're not linking out
        },
        {
            id: 3,
            title: "Job Example 3",
            company: "For frontend testing",
            location: "5005 WEST ROYAL LANE, SUITE NO 228 IRVING, TX, 75063",
            postedDate: "2025-04-10",
            description: `Analyze, design and configure network architecture and layout strategies. 
        Configure and assist service deployment and document network issues. 
        Detect, and mitigate DDOS attacks on the network. Install, maintain and monitor LAN servers, LAN systems. 
        Troubleshoot and resolve all types of production network outages. 
        Implement test plans and find bugs.`,
            requirements: [
                { name: "VLAN" },
                { name: "BGP" },
                { name: "OSPF" },
                { name: "Cisco" },
                { name: "Python" },
                { name: "Juniper" },
                { name: "Arista" },
                { name: "DNS" },
                { name: "Wireshark" },
                { name: "network architecture" },
                { name: "bachelors" },
            ],
            jobURL: "#", // keep "#" or a dummy URL if you're not linking out
        },
    ];


    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [matchedJobs, setMatchedJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 770);

    const handleJobRetrieval = async () => {
        try {
            const response = await api.get("/job_matching/");
            setMatchedJobs(response.data);
        } catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth <= 770);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await api.get("/job_matching/");
                if (response.data.length > 0) {
                    setMatchedJobs(response.data);
                } else {
                    setMatchedJobs(exampleJobs); // fallback if empty
                    setError("No matched jobs found. Showing sample jobs.");
                }
            } catch (err) {
                console.error("Backend fetch failed, using example jobs.");
                setMatchedJobs(exampleJobs); // fallback if error
                setError("Could not fetch jobs from backend. Showing example jobs.");
            }
        };

        fetchJobs();
    }, []);

    const [isLargeWidth, setIsLargeWidth] = useState(
        window.innerWidth > 480 && window.innerWidth <= 1000
    );

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsLargeWidth(width > 480 && width <= 1000);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="findjobs-container">
            <Row>
                {/* Left column: job list */}
                <Col
                    xs={12}
                    md={isLargeWidth ? 3 : 3}
                    style={{ minWidth: "220px" }}
                >
                    <ListGroup className="suggestedjobs-list">
                        {matchedJobs.map((job) => (
                            <ListGroup.Item
                                key={job.id}
                                action
                                active={selectedJob?.id === job.id}
                                onClick={() => {
                                    setSelectedJob(job);
                                    if (isSmallScreen) {
                                        setShowModal(true);
                                    }
                                }}
                                className="py-3"
                                style={{ backgroundColor: "#b0ac8c" }}
                            >
                                <strong>{job.title}</strong><br />
                                <p>{job.company}</p>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Col>

                {/* Right column: selected job details */}
                {!isSmallScreen && (
                    <Col
                        xs={12}
                        md={isLargeWidth ? 8 : 6}
                        className="mt-3 mt-md-0"
                    >
                        {selectedJob ? (
                            <Card className="suggestedjobs-detail">
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
                            <div className="suggestedjobs-placeholder">
                                <p>Select a job to view details.</p>
                            </div>
                        )}
                    </Col>
                )}
                {!isLargeWidth && <Col md={3}></Col>}
            </Row>
            {isSmallScreen && selectedJob && (
                <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{selectedJob.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p><strong>Company:</strong> {selectedJob.company}</p>
                        <p><strong>Location:</strong> {selectedJob.location}</p>
                        <p><strong>Date Posted:</strong> {selectedJob.postedDate}</p>
                        <p><strong>Description:</strong> {selectedJob.description}</p>
                        <p><strong>Requirements:</strong> {selectedJob.requirements.map(skill => skill.name).join(', ')}</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Close
                        </Button>
                        <Button variant="dark" href={selectedJob.jobURL}>
                            Apply
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}

        </div>
    );
};

export default SuggestedJobs;
